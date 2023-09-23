import path from "path";
import { Page } from "@playwright/test";
import { AppContext, RunContext } from "./Context";
import { Browser } from "./Browser";

interface Usage {
  year: number;
  month: number;
  dayCount: number;
  kwh: number;
  yen: number;
}

export class ElectricityFetcher {
  readonly appCtx: AppContext;

  constructor(ctx: AppContext) {
    this.appCtx = ctx;
  }

  async fetch(ctx: RunContext, browser: Browser) {
    ctx.logger.info("fetch start");
    try {
      const now = new Date();

      const page = await browser.newPage(ctx);

      // ログインページに移動
      ctx.logger.info("goto login page");
      await page.goto(this.appCtx.env.loginUrl);
      await page.screenshot({
        path: this.makeScreenshotPath("electricity-01-login-page.png"),
        fullPage: true,
      });

      // ログイン
      ctx.logger.info("input id and password");
      await page.locator("#k_id").fill(this.appCtx.env.user);
      await page.locator("#k_pw").fill(this.appCtx.env.password.value());
      await page.screenshot({
        path: this.makeScreenshotPath(
          "electricity-02-login-page-with-id-pw.png"
        ),
        fullPage: true,
      });

      ctx.logger.info("click login button");
      await page.locator("#loginFormDtl").locator(".headLoginbtn").click();

      ctx.logger.info("wait for loading top page");
      await page.locator(".loginName").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("electricity-03-top-page.png"),
        fullPage: true,
      });

      // 今月の電気料金のページに移動
      ctx.logger.info("click detail link");
      await page
        .locator(
          "#headerRyoukin > table.header_ryoukin_tbl.desktop_only > tbody > tr > td:nth-child(4) > a"
        )
        .click();

      // 電気料金を取得して保存
      await this.saveLatestUsage(
        ctx,
        page,
        now,
        "electricity-04-latest-usage.png"
      );

      // 毎月の電気料金の一覧ページに移動
      ctx.logger.info("click menu_month button");
      await page.locator("#menu_month").click();

      // 電気料金を取得して保存
      await this.saveUsageHistory(
        ctx,
        page,
        now,
        "electricity-05-usage-history.png"
      );
    } finally {
      ctx.logger.info("fetch end");
    }
  }

  private async saveLatestUsage(
    ctx: RunContext,
    page: Page,
    now: Date,
    screenshotName: string
  ) {
    ctx.logger.info("wait for loading latest usages");
    await page.locator("#gaiyouGaisan").waitFor();
    await page.screenshot({
      path: this.makeScreenshotPath(screenshotName),
      fullPage: true,
    });

    ctx.logger.info("fetch latest usage");
    const prevDateLabel = (
      await page.locator("#gaiyouJiseki > div.gaiyouTitle").innerText()
    )
      .replace("年", "")
      .replace("月分の実績", "");
    const prevYear = Number(prevDateLabel.substring(0, 4));
    const prevMonth = Number(prevDateLabel.substring(4));

    const current = new Date(prevYear, prevMonth - 1, 1);
    current.setMonth(current.getMonth() + 1);

    const dayCount = Number(
      await page
        .locator("#gaiyouGaisan > div:nth-child(4) > span:nth-child(2)")
        .innerText()
    );
    const kwh = Number(
      await page.locator("#gaiyouGaisan > div:nth-child(3) > span").innerText()
    );
    const yen = Number(
      (
        await page
          .locator("#gaiyouGaisan > div.blockGaiyou.ml10 > span")
          .innerText()
      ).replace(",", "")
    );

    ctx.logger.info("save latest usage to db");
    await this.upsert(
      {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        dayCount: dayCount,
        kwh: kwh,
        yen: yen,
      },
      now
    );
  }

  private async saveUsageHistory(
    ctx: RunContext,
    page: Page,
    now: Date,
    screenshotName: string
  ) {
    ctx.logger.info("wait for loading usage history");
    const tables = await page.locator(
      "#wrapper > div > div > table.desktop_only.table01.mt-1.monthJisekiTbl.conditionBackgroud"
    );
    await tables.waitFor();
    await page.screenshot({
      path: this.makeScreenshotPath(screenshotName),
      fullPage: true,
    });

    ctx.logger.info("fetch usage history");
    const rows = await tables.locator("tbody > tr");

    const usages: Usage[] = [];
    for (let i = 0; i < (await rows?.count()); i++) {
      if (i == 0) {
        continue;
      }
      const columns = await rows.nth(i).locator("td");
      const yearMonth = (await columns.nth(0).innerText()).split("/");
      usages.push({
        year: Number(yearMonth[0]),
        month: Number(yearMonth[1]),
        dayCount: Number(await columns.nth(5).innerText()),
        kwh: Number(await columns.nth(2).innerText()),
        yen: Number((await columns.nth(3).innerText()).replace(",", "")),
      });
    }

    // 電気料金を保存
    ctx.logger.info("save usage history to db");
    for (const usage of usages) {
      await this.upsert(usage, now);
    }
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.appCtx.env.screenshotDir, fileName);
  }

  private async upsert(usage: Usage, now: Date) {
    await this.appCtx.prisma.electricity_monthly_usages.upsert({
      where: {
        usage_year_usage_month: {
          usage_year: usage.year,
          usage_month: usage.month,
        },
      },
      create: {
        usage_year: usage.year,
        usage_month: usage.month,
        usage_day_count: usage.dayCount,
        usage_kwh: usage.kwh,
        usage_yen: usage.yen,
      },
      update: {
        usage_day_count: usage.dayCount,
        usage_kwh: usage.kwh,
        usage_yen: usage.yen,
        updated_at: now,
      },
    });
  }
}
