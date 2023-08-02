import { chromium } from "playwright-core";

(async () => {
  const browser = await chromium.launch({
    //channel: "chrome", //ここで指定することで既存のchromeを利用可能
    headless: true, //falseの場合はブラウザ上での動きを確認しながら実行可能
  }); //①ブラウザ起動
  const page = await browser.newPage(); //②ページ生成
  await page.goto("https://www.google.co.jp/"); //③サイトへアクセス
  await page.screenshot({ path: `tmp/sample.png` }); //④スクリーンショット
  await browser.close(); //⑤ブラウザ終了
})();
