import { Env } from "./Env";
import { PrismaClient } from "@prisma/client";
import { FetchApplication } from "./application/FetchApplication";
import * as bunyan from "bunyan";

(async () => {
  const logger = bunyan.createLogger({
    name: "fetcher",
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
