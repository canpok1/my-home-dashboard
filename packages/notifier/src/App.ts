import { PrismaClient } from "@prisma/client";
import { Env } from "./Env";
import { createLogger } from "lib";
import Logger from "bunyan";

(async () => {
  const env = new Env(process.env);
  const logger = createLogger(env);

  try {
    logger.info({ env: env }, "loaded env");

    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`; // DB接続チェック

    const today = new Date();
    await notifyElectricityMonthlyUsage(today, logger, prisma);
  } catch (err) {
    logger.error(err);
  }
})();

async function notifyElectricityMonthlyUsage(
  today: Date,
  logger: Logger,
  prisma: PrismaClient
) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const usages = await prisma.electricity_monthly_usages.findMany({
    select: {
      usage_yen: true,
      usage_kwh: true,
      electricity_fetch_settings: {
        select: {
          setting_name: true,
        },
      },
    },
    where: {
      electricity_fetch_setting_id: 1,
      usage_year: year,
      usage_month: month,
    },
  });
  if (usages.length === 0) {
    const message = `${year}年${month}月請求分の電気料金: データなし`;
    logger.info(message);
    return;
  }

  const messages: string[] = [`${year}年${month}月請求分の電気料金`];
  for (const usage of usages) {
    messages.push(
      `${usage.electricity_fetch_settings.setting_name}: ${usage.usage_yen}円（${usage.usage_kwh}kWh）`
    );
  }
  logger.info(messages.join("\n"));
}
