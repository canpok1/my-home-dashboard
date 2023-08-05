import { chromium } from "playwright-core";
import "dotenv/config";
import { Env } from "./Env";

const env = new Env(process.env);

(async (env: Env) => {
  console.log("env: %s", env);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.kireilife.net/pages/index.html");

    // ログイン
    await page.locator("#k_id").fill(env.user);
    await page.locator("#k_pw").fill(env.password.value());
    await page.locator("#loginFormDtl").locator(".headLoginbtn").click();
    await page.locator(".loginName").waitFor();

    // 電気料金の一覧ページに移動
    await page
      .locator(
        "#headerRyoukin > table.header_ryoukin_tbl.desktop_only > tbody > tr > td:nth-child(4) > a"
      )
      .click();
    await page.locator("#menu_month").click();

    // 電気料金を取得
    const tables = await page.locator(
      "#wrapper > div > div > table.desktop_only.table01.mt-1.monthJisekiTbl.conditionBackgroud"
    );
    await tables.waitFor();
    const rows = await tables.locator("tbody > tr");
    for (let i = 0; i < (await rows?.count()); i++) {
      if (i == 0) {
        continue;
      }
      const columns = await rows.nth(i).locator("td");
      const yearMonth = (await columns.nth(0).innerText()).split("/");
      const year = Number(yearMonth[0]);
      const month = Number(yearMonth[1]);
      const dayCount = Number(await columns.nth(5).innerText());
      const kwh = Number(await columns.nth(2).innerText());
      const yen = Number((await columns.nth(3).innerText()).replace(",", ""));

      console.log(year + " " + month + " " + dayCount + " " + kwh + " " + yen);
    }
  } finally {
    await browser.close();
  }
})(env);
