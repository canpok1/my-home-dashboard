import { chromium } from "playwright-core";
import "dotenv/config";
import { Env } from "./Env";
import { ElectricityFetcher } from "./ElectricityFetcher";
import { schedule, validate } from "node-cron";
import { GasFetcher } from "./GasFetcher";
import { WaterFetcher } from "./WaterFetcher";
import { PrismaClient } from "@prisma/client";
import pino from "pino";
import { AppContext } from "./Context";
import { Browser } from "@playwright/test";

async function withBrowser(f: (browser: Browser) => Promise<void>) {
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

(async () => {
  const logger = pino({
    transport: {
      target: "pino-pretty",
    },
  });

  try {
    const prisma = new PrismaClient();

    const electricityCtx: AppContext = {
      prisma: prisma,
      env: new Env(process.env, "ELECTRICITY"),
    };

    const gasCtx: AppContext = {
      prisma: prisma,
      env: new Env(process.env, "GAS"),
    };

    const waterCtx: AppContext = {
      prisma: prisma,
      env: new Env(process.env, "WATER"),
    };

    logger.info("electricity env: %j", electricityCtx.env);
    logger.info("gas env: %j", gasCtx.env);
    logger.info("water env: %j", waterCtx.env);

    // 電気料金
    {
      const fetcher = new ElectricityFetcher(electricityCtx);
      const l = logger.child({ target: "electricity" });
      l.level = electricityCtx.env.logLevel;
      const ctx = {
        logger: l,
      };

      if (!validate(electricityCtx.env.cron)) {
        ctx.logger.info(
          "cron schedule[%s] is invalid, run at once",
          electricityCtx.env.cron
        );
        await withBrowser(async (browser: Browser) => {
          await fetcher.fetch(ctx, browser);
        });
      } else {
        ctx.logger.info("setup cron schedule [%s]", electricityCtx.env.cron);
        schedule(
          electricityCtx.env.cron,
          async () => {
            try {
              await withBrowser(async (browser: Browser) => {
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

    // ガス料金
    {
      const fetcher = new GasFetcher(gasCtx);

      const l = logger.child({ target: "gas" });
      l.level = gasCtx.env.logLevel;
      const ctx = {
        logger: l,
      };

      if (!validate(gasCtx.env.cron)) {
        ctx.logger.info(
          "cron schedule[%s] is invalid, run at once",
          gasCtx.env.cron
        );
        await withBrowser(async (browser: Browser) => {
          await fetcher.fetch(ctx, browser);
        });
      } else {
        ctx.logger.info("setup cron schedule [%s]", gasCtx.env.cron);
        schedule(
          gasCtx.env.cron,
          async () => {
            try {
              await withBrowser(async (browser: Browser) => {
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

    // 水道料金
    {
      const fetcher = new WaterFetcher(waterCtx);

      const l = logger.child({ target: "water" });
      l.level = gasCtx.env.logLevel;
      const ctx = {
        logger: l,
      };

      if (!validate(waterCtx.env.cron)) {
        ctx.logger.info(
          "cron schedule[%s] is invalid, run at once",
          waterCtx.env.cron
        );
        await withBrowser(async (browser: Browser) => {
          await fetcher.fetch(ctx, browser);
        });
      } else {
        ctx.logger.info("setup cron schedule [%s]", waterCtx.env.cron);
        schedule(
          waterCtx.env.cron,
          async () => {
            try {
              await withBrowser(async (browser: Browser) => {
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
  } catch (err) {
    logger.error(err);
  }
})();
