import path from "path";
import { Page } from "@playwright/test";
import { AppContext, RunContext } from "./Context";
import { Browser } from "./Browser";

export class GasFetcher {
  readonly appCtx: AppContext;

  constructor(ctx: AppContext) {
    this.appCtx = ctx;
  }

  async fetch(ctx: RunContext, browser: Browser) {
    ctx.logger.info("fetch start");
    try {
      const page = await browser.newPage(ctx);

      // ログインページに移動
      ctx.logger.info("goto login page");
      await page.goto(this.appCtx.env.loginUrl);
      await page.locator("#divContent > div.divFrame01").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("gas-01-login-page.png"),
        fullPage: true,
      });

      // ログイン
      ctx.logger.info("input id and password");
      await page
        .locator("#ContentPlaceHolder1_txtLoginID")
        .fill(this.appCtx.env.user);
      await page
        .locator("#ContentPlaceHolder1_txtPassWord")
        .fill(this.appCtx.env.password.value());
      await page.screenshot({
        path: this.makeScreenshotPath("gas-02-login-page-with-id-pw.png"),
        fullPage: true,
      });
      ctx.logger.info("click login button");
      await page.locator("#ContentPlaceHolder1_btnLogin").click();
      ctx.logger.info("wait for loading top page");
      await page.locator("#tblLoginInfo").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("gas-03-top-page.png"),
        fullPage: true,
      });

      // ガス料金を取得して保存
      const now = new Date();
      for (let beforeMonth = 0; beforeMonth < 5; beforeMonth++) {
        if (beforeMonth != 0) {
          ctx.logger.info("click before month button");
          await page.locator("#ContentPlaceHolder1_LinkButton1").click();
        }

        await this.fetchAndSave(ctx, page, beforeMonth, now);
      }
    } finally {
      ctx.logger.info("fetch end");
    }
  }

  async fetchAndSave(
    ctx: RunContext,
    page: Page,
    beforeMonth: number,
    now: Date
  ) {
    ctx.logger.info("wait for loading usage data, %d month ago", beforeMonth);
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

    // ガス料金を保存
    ctx.logger.info("save usage data to db, %d month ago", beforeMonth);
    await this.appCtx.prisma.gas_monthly_usages.upsert({
      where: {
        usage_year_usage_month: {
          usage_year: year,
          usage_month: month,
        },
      },
      create: {
        usage_year: year,
        usage_month: month,
        usage_begin_at: beginAt,
        usage_end_at: endAt,
        usage_amount: amount,
        usage_yen: yen,
      },
      update: {
        usage_begin_at: beginAt,
        usage_end_at: endAt,
        usage_amount: amount,
        usage_yen: yen,
        updated_at: now,
      },
    });
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.appCtx.env.screenshotDir, fileName);
  }
}
