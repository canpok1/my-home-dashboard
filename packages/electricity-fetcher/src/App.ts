import { chromium } from "playwright-core";
import "dotenv/config";
import { Env } from "./Env";
import { Fetcher } from "./Fetcher";
import { schedule } from "node-cron";

const env = new Env(process.env);

const fetch = async (env: Env) => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  try {
    const fetcher = new Fetcher(env, "tmp");
    await fetcher.fetch(browser);
  } finally {
    await browser.close();
  }
};

(async (env: Env) => {
  console.log("env: %s", env);

  if (env.cron === "") {
    console.log("run at once");
    await fetch(env);
  } else {
    console.log("setup cron schedule [%s]", env.cron);
    schedule(env.cron, async () => {
      await fetch(env);
    });
  }
})(env);
