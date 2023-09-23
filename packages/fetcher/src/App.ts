import { Env } from "./Env";
import { ElectricityFetcher } from "./ElectricityFetcher";
import { GasFetcher } from "./GasFetcher";
import { WaterFetcher } from "./WaterFetcher";
import { PrismaClient } from "@prisma/client";
import pino from "pino";
import { AppContext } from "./Context";
import { Scheduler } from "./Scheduler";

(async () => {
  const logger = pino({
    transport: {
      target: "pino-pretty",
    },
  });

  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`; // DB接続チェック

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

    const scheduler = new Scheduler();
    // 電気料金
    {
      const l = logger.child({ target: "electricity" });
      l.level = electricityCtx.env.logLevel;

      await scheduler.schedule(
        { logger: l },
        new ElectricityFetcher(electricityCtx),
        electricityCtx.env.cron
      );
    }

    // ガス料金
    {
      const l = logger.child({ target: "gas" });
      l.level = gasCtx.env.logLevel;

      await scheduler.schedule(
        { logger: l },
        new GasFetcher(gasCtx),
        gasCtx.env.cron
      );
    }

    // 水道料金
    {
      const l = logger.child({ target: "water" });
      l.level = waterCtx.env.logLevel;

      await scheduler.schedule(
        { logger: l },
        new WaterFetcher(waterCtx),
        waterCtx.env.cron
      );
    }
  } catch (err) {
    logger.error(err);
  }
})();
