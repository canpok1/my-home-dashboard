import Logger from "bunyan";
import {
  DailyUsageModel,
  FetchSettingModel,
  MonthlyUsageModel,
  UsageFetcher,
} from "../domain/Electricity";
import { CommonEnv, Env } from "../Env";
import { Browser, withBrowser } from "./Browser";
import { BrowserPage } from "./BrowserPage";
import { nthMatch } from "./ScrapeUtils";

export class ElectricityClient implements UsageFetcher {
  readonly commonEnv: CommonEnv;
  readonly env: Env;

  constructor(commonEnv: CommonEnv, env: Env) {
    this.commonEnv = commonEnv;
    this.env = env;
  }

  async fetchMonthly(
    parentLogger: Logger,
    setting: FetchSettingModel
  ): Promise<MonthlyUsageModel[]> {
    const logger = parentLogger.child({ term: "monthly" });

    logger.info("fetch monthly start");
    let usages: MonthlyUsageModel[] = [];
    let screenshotNo: number = 0;
    try {
      await withBrowser(this.env, async (browser: Browser): Promise<void> => {
        const page = new BrowserPage(
          this.env,
          await browser.newPage(logger),
          "electricity/monthly",
          "electricity-"
        );

        // ログインしてトップページに移動
        await this.login(logger, setting, page);

        // 今月の電気料金のページに移動
        logger.info("click detail link");
        await page.instance
          .locator(
            "#headerRyoukin > table.header_ryoukin_tbl.desktop_only > tbody > tr > td:nth-child(4) > a"
          )
          .click();

        // 電気料金を取得
        usages.push(
          await this.fetchLatestUsage(logger, setting, page, "latest-usage.png")
        );

        // 毎月の電気料金の一覧ページに移動
        logger.info("click menu_month button");
        await page.instance.locator("#menu_month").click();

        // 電気料金を取得
        usages = usages.concat(
          await this.fetchUsageHistory(
            logger,
            setting,
            page,
            "usage-history.png"
          )
        );
      });
    } finally {
      logger.info("fetch monthly end");
    }
    return usages;
  }

  async fetchDaily(
    parentLogger: Logger,
    setting: FetchSettingModel
  ): Promise<DailyUsageModel[]> {
    const logger = parentLogger.child({ term: "daily" });

    logger.info("fetch daily start");
    let usages: DailyUsageModel[] = [];
    try {
      await withBrowser(this.env, async (browser: Browser): Promise<void> => {
        const page = new BrowserPage(
          this.env,
          await browser.newPage(logger),
          "electricity/daily",
          "electricity-"
        );

        try {
          // ログインしてトップページに移動
          await this.login(logger, setting, page);

          // 今月の電気料金のページに移動
          logger.info("click detail link");
          await page.instance
            .locator(
              "#headerRyoukin > table.header_ryoukin_tbl.desktop_only > tbody > tr > td:nth-child(4) > a"
            )
            .click();

          // 1日ごとの電気料金の一覧ページに移動
          logger.info("click menu_day button");
          await page.instance.locator("#menu_day").click();

          // 電気料金を取得
          usages = await this.fetchDailyUsages(
            logger,
            setting,
            page,
            "daily-usages.png"
          );
        } catch (err) {
          await page.screenshotForError();
          throw err;
        }
      });
    } finally {
      logger.info("fetch daily end");
    }
    return usages;
  }

  private async login(
    logger: Logger,
    setting: FetchSettingModel,
    page: BrowserPage
  ): Promise<void> {
    const userName = setting.userName;
    const password = setting.password;

    // ログインページに移動
    logger.info("goto login page");
    await page.instance.goto(this.env.loginUrl);
    await page.screenshot("login-page.png");

    // ログイン
    logger.info("input id and password");
    await page.instance.locator("#k_id").fill(userName);
    await page.instance.locator("#k_pw").fill(password.value());
    await page.screenshot("login-page-with-id-pw.png");

    logger.info("click login button");
    await page.instance
      .locator("#loginFormDtl")
      .locator(".headLoginbtn")
      .click();

    logger.info("wait for loading top page");
    await page.instance.locator(".loginName").waitFor();
    await page.screenshot("top-page.png");
  }

  private async fetchUsageHistory(
    logger: Logger,
    setting: FetchSettingModel,
    page: BrowserPage,
    screenshotName: string
  ): Promise<MonthlyUsageModel[]> {
    logger.info("wait for loading usage history");
    const tables = await page.instance.locator(
      "#wrapper > div > div > table.desktop_only.table01.mt-1.monthJisekiTbl.conditionBackgroud"
    );
    await tables.waitFor();
    await page.screenshot(screenshotName);

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
        id: setting.id,
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
    setting: FetchSettingModel,
    page: BrowserPage,
    screenshotName: string
  ): Promise<MonthlyUsageModel> {
    logger.info("wait for loading latest usages");
    await page.instance.locator("#gaiyouGaisan").waitFor();
    await page.screenshot(screenshotName);

    logger.info("fetch latest usage");
    const prevDateLabel = (
      await page.instance.locator("#gaiyouJiseki > div.gaiyouTitle").innerText()
    )
      .replace("年", "")
      .replace("月分の実績", "");
    const prevYear = Number(prevDateLabel.substring(0, 4));
    const prevMonth = Number(prevDateLabel.substring(4));

    const current = new Date(prevYear, prevMonth - 1, 1);
    current.setMonth(current.getMonth() + 1);

    const dayCount = Number(
      await page.instance
        .locator("#gaiyouGaisan > div:nth-child(4) > span:nth-child(2)")
        .innerText()
    );
    const kwh = Number(
      await page.instance
        .locator("#gaiyouGaisan > div:nth-child(3) > span")
        .innerText()
    );
    const yen = Number(
      (
        await page.instance
          .locator("#gaiyouGaisan > div.blockGaiyou.ml10 > span")
          .innerText()
      ).replace(",", "")
    );

    return {
      id: setting.id,
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      dayCount: dayCount,
      kwh: kwh,
      yen: yen,
    };
  }

  private async fetchDailyUsages(
    logger: Logger,
    setting: FetchSettingModel,
    page: BrowserPage,
    screenshotName: string
  ): Promise<DailyUsageModel[]> {
    logger.info("wait for loading daily usages");
    const frame = await page.instance.frameLocator("#mieruframe");
    await page.screenshot(screenshotName);

    logger.info("fetch daily usages");

    // タイトルから期間の開始年を抽出
    const title = await frame.locator("#mi_title").innerText();
    const beginYear = Number(nthMatch(title, /([0-9]+)年[0-9]+月[0-9]+日/, 1));
    logger.debug("begin year is %d, title[%s]", beginYear, title);

    const table = await frame.locator("#mi_month_list_table");
    const rows = await table.locator("tbody > tr");
    const rowCount = await rows.count();
    logger.debug("daily usages row count: %d", rowCount);

    const usages: DailyUsageModel[] = [];
    let year = beginYear;
    for (let i = 0; i < rowCount; i++) {
      if (i == 0) {
        continue;
      }
      const columns = await rows.nth(i).locator("td");
      if ((await columns.count()) == 0) {
        continue;
      }

      const dateStr = await columns.nth(0).innerText();
      const month = Number(nthMatch(dateStr, /[0-9]+月/, 0).replace("月", ""));
      const date = Number(nthMatch(dateStr, /[0-9]+日/, 0).replace("日", ""));

      const amountStr = (await columns.nth(1).innerText())
        .replace("*", "")
        .trim();
      if (amountStr == "") {
        continue;
      }
      const amount = Number(amountStr);

      const usage: DailyUsageModel = {
        id: setting.id,
        year: year,
        month: month,
        date: date,
        amount: amount,
      };
      logger.debug("usage: %j", usage);

      usages.push(usage);

      if (month == 12 && date == 31) {
        year++;
      }
    }
    return usages;

    // logger.info("fetch latest usage");
    // const prevDateLabel = (
    //   await page.locator("#gaiyouJiseki > div.gaiyouTitle").innerText()
    // )
    //   .replace("年", "")
    //   .replace("月分の実績", "");
    // const prevYear = Number(prevDateLabel.substring(0, 4));
    // const prevMonth = Number(prevDateLabel.substring(4));

    // const current = new Date(prevYear, prevMonth - 1, 1);
    // current.setMonth(current.getMonth() + 1);

    // const dayCount = Number(
    //   await page
    //     .locator("#gaiyouGaisan > div:nth-child(4) > span:nth-child(2)")
    //     .innerText()
    // );
    // const kwh = Number(
    //   await page.locator("#gaiyouGaisan > div:nth-child(3) > span").innerText()
    // );
    // const yen = Number(
    //   (
    //     await page
    //       .locator("#gaiyouGaisan > div.blockGaiyou.ml10 > span")
    //       .innerText()
    //   ).replace(",", "")
    // );

    // return {
    //   year: current.getFullYear(),
    //   month: current.getMonth() + 1,
    //   dayCount: dayCount,
    //   kwh: kwh,
    //   yen: yen,
    // };
  }
}
