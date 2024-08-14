import { PrismaClient } from "@prisma/client";
import { Env } from "./Env";
import { createLogger } from "lib";
import { MessagingGatewayClient } from "./infra/MessagingGateway";
import { MySqlClient } from "./infra/MySQLClient";
import { ElectricityNotifyService } from "./domain/Electricity";

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

  try {
    logger.info({ env: env }, "start notifier");

    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`; // DB接続チェック

    const mysqlClient = new MySqlClient(prisma);
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
  } catch (err) {
    logger.error(err, "error occured");
  } finally {
    logger.info("end notifier");
  }
})();
