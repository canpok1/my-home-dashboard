import { PrismaClient } from "@prisma/client";
import { Env } from "./Env";
import { createLogger } from "lib";
import { MessagingGatewayClient } from "./infra/MessagingGateway";
import { MySqlCommonClient, MySqlElectricityClient } from "./infra/MySqlClient";
import { ElectricityNotifyService } from "./domain/Electricity";
import { BatchSearvice } from "./domain/Batch";
import Logger from "bunyan";
import { DifyClient } from "./infra/DifyClient";

// BigIntをログ出力できるようにする
Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    "use strict";
    return () => String(this);
  },
});

(async () => {
  const env = new Env(process.env);
  const logger = createLogger(env);

  const prisma = new PrismaClient();
  await prisma.$queryRaw`SELECT 1`; // DB接続チェック

  const mysqlCommonClient = new MySqlCommonClient(prisma);
  const mysqlElectricityClient = new MySqlElectricityClient(prisma);

  const batchService = new BatchSearvice(env.appName, mysqlCommonClient);

  await batchService.run(logger, async (logger: Logger) => {
    const messagingClient = new MessagingGatewayClient();
    const difyClient = new DifyClient(env.appName);

    const electricityService = new ElectricityNotifyService(
      mysqlElectricityClient,
      mysqlElectricityClient,
      mysqlElectricityClient,
      mysqlElectricityClient,
      mysqlElectricityClient,
      messagingClient,
      difyClient,
      env.encryptionPassword
    );

    const targetDate = new Date();
    const childLogger = logger.child({ targetDate });
    await electricityService.notify(targetDate, childLogger);
  });
})();
