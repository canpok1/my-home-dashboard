import path from "path";
import { Page } from "@playwright/test";
import { Browser, withBrowser } from "./Browser";
import { Env } from "../Env";
import { MonthlyUsageModel } from "../domain/Gas";
import { Logger } from "pino";

export class GasClient {
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
        await page.locator("#divContent > div.divFrame01").waitFor();
        await page.screenshot({
          path: this.makeScreenshotPath("gas-01-login-page.png"),
          fullPage: true,
        });

        // ログイン
        logger.info("input id and password");
        await page
          .locator("#ContentPlaceHolder1_txtLoginID")
          .fill(this.env.user);
        await page
          .locator("#ContentPlaceHolder1_txtPassWord")
          .fill(this.env.password.value());
        await page.screenshot({
          path: this.makeScreenshotPath("gas-02-login-page-with-id-pw.png"),
          fullPage: true,
        });
        logger.info("click login button");
        await page.locator("#ContentPlaceHolder1_btnLogin").click();
        logger.info("wait for loading top page");
        await page.locator("#tblLoginInfo").waitFor();
        await page.screenshot({
          path: this.makeScreenshotPath("gas-03-top-page.png"),
          fullPage: true,
        });

        // ガス料金を取得して保存
        const now = new Date();
        for (let beforeMonth = 0; beforeMonth < 5; beforeMonth++) {
          if (beforeMonth != 0) {
            logger.info("click before month button");
            await page.locator("#ContentPlaceHolder1_LinkButton1").click();
          }

          usages.push(await this.fetchByBeforeMonth(logger, page, beforeMonth));
        }
      });
    } finally {
      logger.info("fetch end");
    }
    return usages;
  }

  async fetchByBeforeMonth(
    logger: Logger,
    page: Page,
    beforeMonth: number
  ): Promise<MonthlyUsageModel> {
    logger.info("wait for loading usage data, %d month ago", beforeMonth);
    const year = Number(
      (
        await page.locator("#ContentPlaceHolder1_lblNowYear").innerText()
      ).replace("年", "")
    );
    const month = Number(
      await page.locator("#ContentPlaceHolder1_lblNowMonth").innerText()
    );
    const beginAt =
      (
        await page
          .locator(
            "#ContentPlaceHolder1_tblWeb > tbody > tr:nth-child(5) > td.tblFrame01-td02-2"
          )
          .innerText()
      )
        .replace("年", "-")
        .replace("月", "-")
        .replace("日", "") + "T00:00:00.000Z";
    const endAt =
      (
        await page
          .locator(
            "#ContentPlaceHolder1_tblWeb > tbody > tr:nth-child(3) > td.tblFrame01-td02-2"
          )
          .innerText()
      )
        .replace("年", "-")
        .replace("月", "-")
        .replace("日", "") + "T00:00:00.000Z";
    const amount = Number(
      await page.locator("#ContentPlaceHolder1_lblUse").innerText()
    );
    const yen = Number(
      (
        await page.locator("#ContentPlaceHolder1_lblLpUsePrice").innerText()
      ).replace(",", "")
    );

    return {
      year: year,
      month: month,
      begin: beginAt,
      end: endAt,
      amount: amount,
      yen: yen,
    };
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.env.screenshotDir, fileName);
  }
}
