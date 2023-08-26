import { PrismaClient } from "@prisma/client";
import { Browser } from "playwright-core";
import { Env } from "./Env";
import path from "path";

export class ElectricityFetcher {
  readonly env: Env;
  readonly screenshotDir: string;

  constructor(env: Env, screenshotDir: string) {
    this.env = env;
    this.screenshotDir = screenshotDir;
  }

  async fetch(browser: Browser) {
    console.log("[Electricity] fetch start");
    try {
      const page = await browser.newPage();
      page.on("requestfailed", (req) => {
        console.log(
          `[Electricity][browser] request failed: ${req.failure()
            ?.errorText}, ${req.method()} ${req.url()}`
        );
      });
      page.on("response", (res) => {
        if (!res.ok()) {
          console.log(
            `[Electricity][browser] ${res.status()} error: ${res
              .request()
              .method()} ${res.url()}`
          );
        }
      });
      page.on("console", (msg) =>
        console.log("[Electricity][browser] console: " + msg.text())
      );
      await page.setDefaultTimeout(this.env.timeoutMs);

      // ログインページに移動
      console.log("[Electricity][action] goto login page");
      await page.goto(this.env.loginUrl);
      await page.screenshot({
        path: this.makeScreenshotPath("electricity-01-login-page.png"),
        fullPage: true,
      });

      // ログイン
      console.log("[Electricity][action] input id and password");
      await page.locator("#k_id").fill(this.env.user);
      await page.locator("#k_pw").fill(this.env.password.value());
      await page.screenshot({
        path: this.makeScreenshotPath(
          "electricity-02-login-page-with-id-pw.png"
        ),
        fullPage: true,
      });

      console.log("[Electricity][action] click login button");
      await page.locator("#loginFormDtl").locator(".headLoginbtn").click();

      console.log("[Electricity][action] wait for loading top page");
      await page.locator(".loginName").waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("electricity-03-top-page.png"),
        fullPage: true,
      });

      // 電気料金の一覧ページに移動
      console.log("[Electricity][action] click detail link");
      await page
        .locator(
          "#headerRyoukin > table.header_ryoukin_tbl.desktop_only > tbody > tr > td:nth-child(4) > a"
        )
        .click();

      console.log("[Electricity][action] click menu_month button");
      await page.locator("#menu_month").click();

      // 電気料金を取得
      console.log("[Electricity][action] wait for loading tables");
      const tables = await page.locator(
        "#wrapper > div > div > table.desktop_only.table01.mt-1.monthJisekiTbl.conditionBackgroud"
      );
      await tables.waitFor();
      await page.screenshot({
        path: this.makeScreenshotPath("electricity-04-usages-list.png"),
        fullPage: true,
      });

      console.log("[Electricity][action] fetch tables");
      const rows = await tables.locator("tbody > tr");

      const usages = [];
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
      console.log("[Electricity][action] save tables to db");
      const prisma = new PrismaClient();
      for (const usage of usages) {
        await prisma.electricity_monthly_usages.upsert({
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
          },
        });
        const records = await prisma.electricity_monthly_usages.findMany();
      }
    } finally {
      console.log("[Electricity] fetch end");
    }
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.screenshotDir, fileName);
  }
}
