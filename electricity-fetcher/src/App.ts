import { chromium } from "playwright-core";
import "dotenv/config";
import { Env } from "./Env";
import { Fetcher } from "./Fetcher";

const env = new Env(process.env);

(async (env: Env) => {
  console.log("env: %s", env);

  const fetcher = new Fetcher(env, "tmp");

  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus"],
  });

  try {
    await fetcher.fetch(browser);
  } finally {
    await browser.close();
  }
})(env);
