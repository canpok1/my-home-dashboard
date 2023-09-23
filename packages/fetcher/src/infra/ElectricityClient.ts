import path from "path";
import { Page } from "@playwright/test";
import { MonthlyUsageModel } from "../domain/Electricity";
import { Env } from "../Env";
import { Browser, withBrowser } from "./Browser";
import { Logger } from "pino";

export class ElectricityClient {
  readonly env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async fetchMonthly(logger: Logger): Promise<MonthlyUsageModel[]> {
    logger.info("fetch start");
    let usages: MonthlyUsageModel[] = [];
    try {
      await withBrowser(this.env, async (browser: Browser): Promise<void> => {
        const page = await browser.newPage(logger);

        // ログインページに移動
        logger.info("goto login page");
        await page.goto(this.env.loginUrl);
        await page.screenshot({
          path: this.makeScreenshotPath("electricity-01-login-page.png"),
          fullPage: true,
        });

        // ログイン
        logger.info("input id and password");
        await page.locator("#k_id").fill(this.env.user);
        await page.locator("#k_pw").fill(this.env.password.value());
        await page.screenshot({
          path: this.makeScreenshotPath(
            "electricity-02-login-page-with-id-pw.png"
          ),
          fullPage: true,
        });

        logger.info("click login button");
        await page.locator("#loginFormDtl").locator(".headLoginbtn").click();

        logger.info("wait for loading top page");
        await page.locator(".loginName").waitFor();
        await page.screenshot({
          path: this.makeScreenshotPath("electricity-03-top-page.png"),
          fullPage: true,
        });

        // 今月の電気料金のページに移動
        logger.info("click detail link");
        await page
          .locator(
            "#headerRyoukin > table.header_ryoukin_tbl.desktop_only > tbody > tr > td:nth-child(4) > a"
          )
          .click();

        // 電気料金を取得
        usages.push(
          await this.fetchLatestUsage(
            logger,
            page,
            "electricity-04-latest-usage.png"
          )
        );

        // 毎月の電気料金の一覧ページに移動
        logger.info("click menu_month button");
        await page.locator("#menu_month").click();

        // 電気料金を取得
        usages = usages.concat(
          await this.fetchUsageHistory(
            logger,
            page,
            "electricity-05-usage-history.png"
          )
        );
      });
    } finally {
      logger.info("fetch end");
    }
    return usages;
  }

  private async fetchUsageHistory(
    logger: Logger,
    page: Page,
    screenshotName: string
  ): Promise<MonthlyUsageModel[]> {
    logger.info("wait for loading usage history");
    const tables = await page.locator(
      "#wrapper > div > div > table.desktop_only.table01.mt-1.monthJisekiTbl.conditionBackgroud"
    );
    await tables.waitFor();
    await page.screenshot({
      path: this.makeScreenshotPath(screenshotName),
      fullPage: true,
    });

    logger.info("fetch usage history");
    const rows = await tables.locator("tbody > tr");

    const usages: MonthlyUsageModel[] = [];
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
    return usages;
  }

  private async fetchLatestUsage(
    logger: Logger,
    page: Page,
    screenshotName: string
  ): Promise<MonthlyUsageModel> {
    logger.info("wait for loading latest usages");
    await page.locator("#gaiyouGaisan").waitFor();
    await page.screenshot({
      path: this.makeScreenshotPath(screenshotName),
      fullPage: true,
    });

    logger.info("fetch latest usage");
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

    return {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      dayCount: dayCount,
      kwh: kwh,
      yen: yen,
    };
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.env.screenshotDir, fileName);
  }
}
