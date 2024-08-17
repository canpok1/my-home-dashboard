import { PrismaClient } from "@prisma/client";
import { Env } from "./Env";
import { createLogger } from "lib";
import { MessagingGatewayClient } from "./infra/MessagingGateway";
import { MySqlClient } from "./infra/MySQLClient";
import { ElectricityNotifyService } from "./domain/Electricity";
import { BatchSearvice } from "./domain/Batch";
import Logger from "bunyan";

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

  const mysqlClient = new MySqlClient(prisma);

  const batchService = new BatchSearvice(env.appName, mysqlClient);

  await batchService.run(logger, async (logger: Logger) => {
    const messagingClient = new MessagingGatewayClient();

    const electricityService = new ElectricityNotifyService(
      mysqlClient,
      mysqlClient,
      mysqlClient,
      messagingClient
    );

    const targetDate = new Date();
    const childLogger = logger.child({ targetDate });
    await electricityService.notify(targetDate, childLogger);
  });
})();
