import { Env } from "./Env";
import { PrismaClient } from "@prisma/client";
import pino, { stdTimeFunctions } from "pino";
import { FetchApplication } from "./application/FetchApplication";

(async () => {
  const logger = pino({
    name: "fetcher",
    timestamp: stdTimeFunctions.isoTime,
  });

  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`; // DB接続チェック

    const electricityEnv = new Env(process.env, "ELECTRICITY");
    logger.info({ env: electricityEnv }, "loaded electricity env");

    const gasEnv = new Env(process.env, "GAS");
    logger.info({ env: gasEnv }, "loaded gas env");

    const waterEnv = new Env(process.env, "WATER");
    logger.info({ env: waterEnv }, "loaded water env");

    const app = new FetchApplication(electricityEnv, gasEnv, waterEnv, prisma);
    await app.run(logger);
  } catch (err) {
    logger.error(err);
  }
})();
// (async () => {
//   const logger = pino({
//     name: "fetcher",
//     timestamp: stdTimeFunctions.isoTime,
//   });
//
//   try {
//     const prisma = new PrismaClient();
//     await prisma.$queryRaw`SELECT 1`; // DB接続チェック
//
//     const electricityCtx: AppContext = {
//       prisma: prisma,
//       env: new Env(process.env, "ELECTRICITY"),
//     };
//     logger.info({ env: electricityCtx.env }, "loaded electricity env");
//
//     const gasCtx: AppContext = {
//       prisma: prisma,
//       env: new Env(process.env, "GAS"),
//     };
//     logger.info({ env: gasCtx.env }, "loaded gas env");
//
//     const waterCtx: AppContext = {
//       prisma: prisma,
//       env: new Env(process.env, "WATER"),
//     };
//     logger.info({ env: waterCtx.env }, "loaded water env");
//
//     // 電気料金
//     {
//       const l = logger.child({}, { msgPrefix: "[electricity]" });
//       l.level = electricityCtx.env.logLevel;
//
//       const scheduler = new Scheduler(electricityCtx);
//       await scheduler.schedule(
//         { logger: l },
//         new ElectricityFetcher(electricityCtx),
//         electricityCtx.env.cron
//       );
//     }
//
//     // ガス料金
//     {
//       const l = logger.child({}, { msgPrefix: "[gas]" });
//       l.level = gasCtx.env.logLevel;
//
//       const scheduler = new Scheduler(electricityCtx);
//       await scheduler.schedule(
//         { logger: l },
//         new GasFetcher(gasCtx),
//         gasCtx.env.cron
//       );
//     }
//
//     // 水道料金
//     {
//       const l = logger.child({}, { msgPrefix: "[water]" });
//       l.level = waterCtx.env.logLevel;
//
//       const scheduler = new Scheduler(electricityCtx);
//       await scheduler.schedule(
//         { logger: l },
//         new WaterFetcher(waterCtx),
//         waterCtx.env.cron
//       );
//     }
//   } catch (err) {
//     logger.error(err);
//   }
// })();
