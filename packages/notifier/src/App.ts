import { electricity_notify_settings, PrismaClient } from "@prisma/client";
import { Env } from "./Env";
import { createLogger } from "lib";
import Logger from "bunyan";
import { MessagingGatewayClient } from "./infra/MessagingGateway";

(async () => {
  const env = new Env(process.env);
  const logger = createLogger(env);

  try {
    logger.info({ env: env }, "loaded env");

    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`; // DB接続チェック

    const today = new Date();
    await notifyElectricity(today, prisma, logger);
  } catch (err) {
    logger.error(err);
  }
})();

async function notifyElectricity(
  today: Date,
  prisma: PrismaClient,
  logger: Logger
) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const settings = await prisma.electricity_notify_settings.findMany({
    select: {
      id: true,
      electricity_fetch_setting_id: true,
      line_channel_id: true,
      electricity_notify_dest_line_users: {
        select: {
          line_user_id: true,
        },
      },
    },
    where: {
      notify_date: date,
      notify_enable: true,
    },
  });
  if (settings.length === 0) {
    logger.info("skip notify, notify settings is not found");
    return;
  }

  for (const setting of settings) {
    const tos = setting.electricity_notify_dest_line_users.map(
      (user) => user.line_user_id
    );
    const now = new Date();
    try {
      await notifyElectricityBySetting(
        setting.electricity_fetch_setting_id,
        setting.line_channel_id,
        tos,
        today,
        logger,
        prisma
      );
      await prisma.electricity_notify_statuses.upsert({
        where: {
          electricity_notify_setting_id: setting.id,
        },
        create: {
          electricity_notify_settings: {
            connect: {
              id: setting.id,
            },
          },
          notify_status_types: {
            connect: {
              type_name: "success",
            },
          },
          last_successful_at: now,
        },
        update: {
          notify_status_types: {
            connect: {
              type_name: "success",
            },
          },
          last_successful_at: now,
        },
      });
    } catch (err) {
      await prisma.electricity_notify_statuses.upsert({
        where: {
          electricity_notify_setting_id: setting.id,
        },
        create: {
          electricity_notify_settings: {
            connect: {
              id: setting.id,
            },
          },
          notify_status_types: {
            connect: {
              type_name: "failure",
            },
          },
          last_failure_at: now,
        },
        update: {
          notify_status_types: {
            connect: {
              type_name: "failure",
            },
          },
          last_failure_at: now,
        },
      });
    }
  }
}

async function notifyElectricityBySetting(
  fetchSettingId: bigint,
  lineChannelId: string,
  tos: string[],
  today: Date,
  logger: Logger,
  prisma: PrismaClient
): Promise<void> {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

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
      electricity_fetch_setting_id: fetchSettingId,
      usage_year: year,
      usage_month: month,
    },
  });

  const client = new MessagingGatewayClient(lineChannelId);

  if (usages.length === 0) {
    const message = `${year}年${month}月請求分の電気料金: データなし`;
    logger.info(message);
    await client.bulkSendMessage(tos, [
      {
        type: "text",
        text: message,
      },
    ]);
    return;
  }

  const messages: string[] = [`${year}年${month}月請求分の電気料金`];
  for (const usage of usages) {
    messages.push(
      `${usage.electricity_fetch_settings.setting_name}: ${usage.usage_yen}円（${usage.usage_kwh}kWh）`
    );
  }
  logger.info(messages.join("\n"));
  await client.bulkSendMessage(tos, [
    {
      type: "text",
      text: messages.join("\n"),
    },
  ]);
}
