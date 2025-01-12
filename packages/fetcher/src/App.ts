import { CommonEnv, Env } from "./Env";
import { PrismaClient } from "@prisma/client";
import { FetchApplication, Params } from "./application/FetchApplication";
import { createLogger } from "./Logger";
import { findValueStrings } from "lib";

// BigIntをログ出力できるようにする
Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    "use strict";
    return () => String(this);
  },
});

function makeAppParams(args: string[]): Params {
  const appParams = {
    enableElectricity: false,
    enableGas: false,
    enableWater: false,
  };
  for (const enableType of findValueStrings(args, "fetch")) {
    if (enableType == "electricity") {
      appParams.enableElectricity = true;
    }
    if (enableType == "gas") {
      appParams.enableGas = true;
    }
    if (enableType == "water") {
      appParams.enableWater = true;
    }
  }
  return appParams;
}

(async () => {
  const commonEnv = new CommonEnv(process.env);
  const logger = createLogger(commonEnv);

  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`; // DB接続チェック

    const appParams = makeAppParams(process.argv);

    const electricityEnv = new Env(process.env, "ELECTRICITY");
    logger.info({ env: electricityEnv }, "loaded electricity env");

    const gasEnv = new Env(process.env, "GAS");
    logger.info({ env: gasEnv }, "loaded gas env");

    const waterEnv = new Env(process.env, "WATER");
    logger.info({ env: waterEnv }, "loaded water env");

    const app = new FetchApplication(
      commonEnv,
      electricityEnv,
      gasEnv,
      waterEnv,
      prisma,
      appParams
    );
    await app.run(logger);
  } catch (err) {
    logger.error(err);
  }
})();
