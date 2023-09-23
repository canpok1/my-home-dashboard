import { Browser, chromium } from "@playwright/test";
import { RunContext } from "./Context";
import cron from "node-cron";

export interface Fetcher {
  fetch(ctx: RunContext, browswer: Browser): Promise<void>;
}

export class Scheduler {
  async schedule(ctx: RunContext, fetcher: Fetcher, cronValue: string) {
    if (!cron.validate(cronValue)) {
      ctx.logger.info("cron schedule[%s] is invalid, run at once", cron);
      await this.withBrowser(async (browser: Browser) => {
        await fetcher.fetch(ctx, browser);
      });
    } else {
      ctx.logger.info("setup cron schedule [%s]", cronValue);
      cron.schedule(
        cronValue,
        async () => {
          try {
            await this.withBrowser(async (browser: Browser) => {
              await fetcher.fetch(ctx, browser);
            });
          } catch (err) {
            ctx.logger.error(err);
          }
        },
        {
          timezone: "Asia/Tokyo",
        }
      );
    }
  }

  private async withBrowser(f: (browser: Browser) => Promise<void>) {
    const browser = await chromium.launch({
      headless: true,
      args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
    });

    try {
      await f(browser);
    } finally {
      await browser.close();
    }
  }
}
