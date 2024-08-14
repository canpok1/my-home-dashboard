import Logger from "bunyan";
import { MessagingGatewayClient } from "../infra/MessagingGateway";
import {
  MonthlyUsageRepository,
  NotifySettingRepository,
  NotifyStatusRepository,
} from "./types/Electricity";
import { MessageRepository } from "./types/Message";

export class ElectricityNotifyService {
  readonly notifySettingRepo: NotifySettingRepository;
  readonly monthlyUsageRepo: MonthlyUsageRepository;
  readonly notifyStatusRepo: NotifyStatusRepository;
  readonly messageRepo: MessageRepository;

  constructor(
    notifySettingRepo: NotifySettingRepository,
    monthlyUsageRepo: MonthlyUsageRepository,
    notifyStatusRepo: NotifyStatusRepository,
    messageRepo: MessageRepository
  ) {
    this.notifySettingRepo = notifySettingRepo;
    this.monthlyUsageRepo = monthlyUsageRepo;
    this.notifyStatusRepo = notifyStatusRepo;
    this.messageRepo = messageRepo;
  }

  async notify(today: Date, logger: Logger) {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const settings =
      await this.notifySettingRepo.findElectricityNotifySettings(date);
    if (settings.length === 0) {
      logger.info({ year, month }, "skip notify, notify settings is not found");
      return;
    }

    for (const setting of settings) {
      const now = new Date();
      try {
        await this.notifyBySetting(
          setting.fetchSettingId,
          setting.lineChannelId,
          setting.notifyDistIds,
          today,
          logger
        );
        await this.notifyStatusRepo.upsertElectricityNotifyStatusesSuccess(
          setting.id,
          now
        );
      } catch (err) {
        await this.notifyStatusRepo.upsertElectricityNotifyStatusesFailure(
          setting.id,
          now
        );
      }
    }
  }

  private async notifyBySetting(
    fetchSettingId: bigint,
    lineChannelId: string,
    tos: string[],
    today: Date,
    logger: Logger
  ): Promise<void> {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const usages = await this.monthlyUsageRepo.findElectricityMonthlyUsages(
      fetchSettingId,
      year,
      month
    );

    if (usages.length === 0) {
      const message = `${year}年${month}月請求分の電気料金: データなし`;
      logger.info(message);
      await this.messageRepo.bulkSendMessage(lineChannelId, tos, [
        {
          type: "text",
          text: message,
        },
      ]);
      return;
    }

    const messages: string[] = [`${year}年${month}月請求分の電気料金`];
    for (const usage of usages) {
      messages.push(`${usage.settingName}: ${usage.yen}円（${usage.kwh}kWh）`);
    }
    logger.info(messages.join("\n"));
    await this.messageRepo.bulkSendMessage(lineChannelId, tos, [
      {
        type: "text",
        text: messages.join("\n"),
      },
    ]);
  }
}
