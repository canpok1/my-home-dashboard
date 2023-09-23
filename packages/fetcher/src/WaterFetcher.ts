import { Browser } from "playwright-core";
import path from "path";
import { Page } from "@playwright/test";
import { AppContext, RunContext } from "./Context";

interface Usage {
  year: number;
  month: number;
  begin: string | null;
  end: string;
  amount: number;
  yen: number;
}

export class WaterFetcher {
  readonly appCtx: AppContext;

  constructor(ctx: AppContext) {
    this.appCtx = ctx;
  }

  async fetch(ctx: RunContext, browser: Browser) {
    ctx.logger.info("fetch start");
    const page = await browser.newPage();
    try {
      page.on("requestfailed", (req) => {
        ctx.logger.debug(
          `[browser] request failed: ${req.failure()
            ?.errorText}, ${req.method()} ${req.url()}`
        );
      });
      page.on("response", (res) => {
        if (!res.ok()) {
          ctx.logger.debug(
            `[browser] ${res.status()} error: ${res
              .request()
              .method()} ${res.url()}`
          );
        }
      });
      page.on("console", (msg) =>
        ctx.logger.debug("[browser] console: " + msg.text())
      );
      await page.setDefaultTimeout(this.appCtx.env.timeoutMs);

      // ログインページに移動
      ctx.logger.info("goto login page");
      await page.goto(this.appCtx.env.loginUrl);
      await page.locator("#fs-contents").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("water-01-login-page.png"),
        fullPage: true,
      });

      // ログイン
      ctx.logger.info("input id and password");
      await page.locator("#loginId").fill(this.appCtx.env.user);
      await page.locator("#password").fill(this.appCtx.env.password.value());
      await page.screenshot({
        path: this.makeScreenshotPath("water-02-login-page-with-id-pw.png"),
        fullPage: true,
      });
      ctx.logger.info("click login button");
      await page.locator("#thisform > div.area > div.areaR > button").click();
      ctx.logger.info("wait for loading top page");
      await page.locator("#fs-contents").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("water-03-top-page.png"),
        fullPage: true,
      });

      // 料金を取得
      const now = new Date();
      await this.fetchAndSave(ctx, page, now);
    } catch (err) {
      await page.screenshot({
        path: this.makeScreenshotPath("water-99-error.png"),
        fullPage: true,
      });
      throw err;
    } finally {
      ctx.logger.info("fetch end");
    }
  }

  async fetchAndSave(ctx: RunContext, page: Page, now: Date) {
    ctx.logger.info("wait for loading usage data");
    const tables = await page.locator("#fs-contents .kenshin-day+.waterUsage");
    const tablesCount = await tables?.count();

    const usages: Usage[] = [];
    for (let i = 0; i < tablesCount; i++) {
      // 日付取得
      const dateStrOrg = await tables.nth(i).locator("td").nth(0).innerText();
      const splited = dateStrOrg.split("/");
      const year = Number(splited[0].replace("R", "")) + 2018;
      const month = Number(splited[1]);
      const day = Number(splited[2]);
      const datetimeStr = `${year}-${splited[1]}-${splited[2]}T00:00:00.000Z`;

      // 使用量と料金を取得
      const amount = Number(
        (await tables.nth(i).locator("td").nth(2).innerText()).replace(",", "")
      );
      const yen = Number(
        (await tables.nth(i).locator("td").nth(5).innerText()).replace(",", "")
      );

      ctx.logger.debug(
        "%s(%d/%d/%d) %d[m^3] %d[yen]",
        dateStrOrg,
        year,
        month,
        day,
        amount,
        yen
      );

      const usage = usages.pop();
      if (usage) {
        usage.begin = datetimeStr;
        usages.push(usage);
      }

      usages.push({
        year: year,
        month: month,
        begin: null,
        end: datetimeStr,
        amount: amount,
        yen: yen,
      });
    }

    // 料金を保存
    ctx.logger.info("save usage data to db");
    for (const usage of usages) {
      if (usage.begin == null) {
        continue;
      }

      await this.appCtx.prisma.water_monthly_usages.upsert({
        where: {
          usage_year_usage_month: {
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
        create: {
          usage_year: usage.year,
          usage_month: usage.month,
          usage_begin_at: usage.begin,
          usage_end_at: usage.end,
          usage_amount: usage.amount,
          usage_yen: usage.yen,
        },
        update: {
          usage_begin_at: usage.begin,
          usage_end_at: usage.end,
          usage_amount: usage.amount,
          usage_yen: usage.yen,
          updated_at: now,
        },
      });
    }
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.appCtx.env.screenshotDir, fileName);
  }
}
