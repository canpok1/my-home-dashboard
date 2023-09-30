import path from "path";
import { Page } from "@playwright/test";
import { Browser, withBrowser } from "./Browser";
import { MonthlyUsageModel } from "../domain/Water";
import { Env } from "../Env";
import Logger from "bunyan";

export class WaterClient {
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
        try {
          // ログインページに移動
          logger.info("goto login page");
          await page.goto(this.env.loginUrl);
          await page.locator("#fs-contents").waitFor();
          await page.screenshot({
            path: this.makeScreenshotPath("water-01-login-page.png"),
            fullPage: true,
          });

          // ログイン
          logger.info("input id and password");
          await page.locator("#loginId").fill(this.env.user);
          await page.locator("#password").fill(this.env.password.value());
          await page.screenshot({
            path: this.makeScreenshotPath("water-02-login-page-with-id-pw.png"),
            fullPage: true,
          });
          logger.info("click login button");
          await page
            .locator("#thisform > div.area > div.areaR > button")
            .click();
          logger.info("wait for loading top page");
          await page.locator("#fs-contents").waitFor();
          await page.screenshot({
            path: this.makeScreenshotPath("water-03-top-page.png"),
            fullPage: true,
          });

          // 料金を取得
          const now = new Date();
          usages = usages.concat(await this.fetch(logger, page, now));
        } catch (err) {
          await page.screenshot({
            path: this.makeScreenshotPath("water-99-error.png"),
            fullPage: true,
          });
          throw err;
        }
      });
    } finally {
      logger.info("fetch end");
    }
    return usages;
  }

  async fetch(
    logger: Logger,
    page: Page,
    now: Date
  ): Promise<MonthlyUsageModel[]> {
    logger.info("wait for loading usage data");
    const tables = await page.locator("#fs-contents .kenshin-day+.waterUsage");
    const tablesCount = await tables?.count();

    const usages: MonthlyUsageModel[] = [];
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

      logger.debug(
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

    return usages;
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.env.screenshotDir, fileName);
  }
}
