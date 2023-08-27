import { PrismaClient, electricity_monthly_usages } from "@prisma/client";
import { Browser } from "playwright-core";
import { Env } from "./Env";
import path from "path";
import { Page } from "@playwright/test";

interface Usage {
  year: number;
  month: number;
  dayCount: number;
  kwh: number;
  yen: number;
}

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
      const now = new Date();
      const prisma = new PrismaClient();

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

      // 今月の電気料金のページに移動
      console.log("[Electricity][action] click detail link");
      await page
        .locator(
          "#headerRyoukin > table.header_ryoukin_tbl.desktop_only > tbody > tr > td:nth-child(4) > a"
        )
        .click();

      // 電気料金を取得
      await this.saveLatestUsage(
        page,
        prisma,
        now,
        "electricity-04-latest-usage.png"
      );

      // 毎月の電気料金の一覧ページに移動
      console.log("[Electricity][action] click menu_month button");
      await page.locator("#menu_month").click();

      // 電気料金を取得
      await this.saveUsageHistory(
        page,
        prisma,
        now,
        "electricity-05-usage-history.png"
      );
    } finally {
      console.log("[Electricity] fetch end");
    }
  }

  private async saveLatestUsage(
    page: Page,
    prisma: PrismaClient,
    now: Date,
    screenshotName: string
  ) {
    console.log("[Electricity][action] wait for loading latest usages");
    await page.locator("#gaiyouGaisan").waitFor();
    await page.screenshot({
      path: this.makeScreenshotPath(screenshotName),
      fullPage: true,
    });

    console.log("[Electricity][action] fetch latest usage");
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

    console.log("[Electricity][action] save latest usage to db");
    await this.upsert(
      prisma,
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
    page: Page,
    prisma: PrismaClient,
    now: Date,
    screenshotName: string
  ) {
    console.log("[Electricity][action] wait for loading usage history");
    const tables = await page.locator(
      "#wrapper > div > div > table.desktop_only.table01.mt-1.monthJisekiTbl.conditionBackgroud"
    );
    await tables.waitFor();
    await page.screenshot({
      path: this.makeScreenshotPath(screenshotName),
      fullPage: true,
    });

    console.log("[Electricity][action] fetch usage history");
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
    console.log("[Electricity][action] save usage history to db");
    for (const usage of usages) {
      await this.upsert(prisma, usage, now);
    }
  }

  private makeScreenshotPath(fileName: string): string {
    return path.join(this.screenshotDir, fileName);
  }

  private async upsert(prisma: PrismaClient, usage: Usage, now: Date) {
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
        updated_at: now,
      },
    });
  }
}
