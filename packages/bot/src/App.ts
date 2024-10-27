import { PrismaClient } from "@prisma/client";
import { Env } from "./Env";
import { createLogger } from "lib";
import { MessagingGatewayClient } from "./infra/MessagingGateway";
import Logger from "bunyan";
import { MySqlClient } from "./infra/MySqlClient";
import { BatchSearvice } from "./domain/Batch";
import { EventProcessor } from "./domain/EventProseccor";

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
  const messagingGatewayClient = new MessagingGatewayClient(env.appName);

  const batchService = new BatchSearvice(env.appName, mysqlClient);
  const processor = new EventProcessor(
    mysqlClient,
    mysqlClient,
    messagingGatewayClient
  );

  await batchService.run(logger, async (logger: Logger) => {
    await processor.process(logger);
  });
})();
