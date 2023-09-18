import { PrismaClient } from "@prisma/client";
import { Browser } from "playwright-core";
import { Env } from "./Env";
import path from "path";
import { Page } from "@playwright/test";

export class GasFetcher {
  readonly env: Env;
  readonly screenshotDir: string;

  constructor(env: Env, screenshotDir: string) {
    this.env = env;
    this.screenshotDir = screenshotDir;
  }

  async fetch(browser: Browser, prisma: PrismaClient) {
    console.log("[Gas] fetch start");
    try {
      const page = await browser.newPage();
      page.on("requestfailed", (req) => {
        console.log(
          `[Gas][browser] request failed: ${req.failure()
            ?.errorText}, ${req.method()} ${req.url()}`
        );
      });
      page.on("response", (res) => {
        if (!res.ok()) {
          console.log(
            `[Gas][browser] ${res.status()} error: ${res
              .request()
              .method()} ${res.url()}`
          );
        }
      });
      page.on("console", (msg) =>
        console.log("[Gas][browser] console: " + msg.text())
      );
      await page.setDefaultTimeout(this.env.timeoutMs);

      // ログインページに移動
      console.log("[Gas][action] goto login page");
      await page.goto(this.env.loginUrl);
      await page.locator("#divContent > div.divFrame01").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("gas-01-login-page.png"),
        fullPage: true,
      });

      // ログイン
      console.log("[Gas][action] input id and password");
      await page.locator("#ContentPlaceHolder1_txtLoginID").fill(this.env.user);
      await page
        .locator("#ContentPlaceHolder1_txtPassWord")
        .fill(this.env.password.value());
      await page.screenshot({
        path: this.makeScreenshotPath("gas-02-login-page-with-id-pw.png"),
        fullPage: true,
      });
      console.log("[Gas][action] click login button");
      await page.locator("#ContentPlaceHolder1_btnLogin").click();
      console.log("[Gas][action] wait for loading top page");
      await page.locator("#tblLoginInfo").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("gas-03-top-page.png"),
        fullPage: true,
      });

      // ガス料金を取得
      const now = new Date();
      for (let beforeMonth = 0; beforeMonth < 5; beforeMonth++) {
        if (beforeMonth != 0) {
          console.log("[Gas][action] ");
          await page.locator("#ContentPlaceHolder1_LinkButton1").click();
        }

        await this.fetchAndSave(prisma, page, beforeMonth, now);
      }
    } finally {
      console.log("[Gas] fetch end");
    }
  }

  async fetchAndSave(
    prisma: PrismaClient,
    page: Page,
    beforeMonth: number,
    now: Date
  ) {
    console.log(
      "[Gas][action] wait for loading usage data, %d month ago",
      beforeMonth
    );
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
    console.log(
      "[Gas][action] save usage data to db, %d month ago",
      beforeMonth
    );
    await prisma.gas_monthly_usages.upsert({
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
    return path.join(this.screenshotDir, fileName);
  }
}
