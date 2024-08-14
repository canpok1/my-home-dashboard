import Logger from "bunyan";
import { MessagingGatewayClient } from "../infra/MessagingGateway";
import {
  MonthlyUsage,
  MonthlyUsageRepository,
  NotifySetting,
  NotifySettingRepository,
  NotifyStatusRepository,
} from "./types/Electricity";
import { MessageRepository } from "./types/Message";
import Handlebars from "handlebars";

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

  async notify(targetDate: Date, logger: Logger) {
    const date = targetDate.getDate();

    const settings =
      await this.notifySettingRepo.findElectricityNotifySettings(date);
    logger.info(`${settings.length} settings were find`);

    if (settings.length === 0) {
      logger.info("skip notify, notify settings is not found");
      return;
    }

    for (const setting of settings) {
      const childLogger = logger.child({ notifySettingId: setting.id });
      const now = new Date();
      try {
        const notified = await this.notifyBySetting(
          setting,
          targetDate,
          childLogger
        );
        if (notified) {
          await this.notifyStatusRepo.upsertElectricityNotifyStatusesSuccess(
            setting.id,
            now
          );
        }
      } catch (err) {
        childLogger.error(
          err,
          `failed to notify by electricity_notify_setting_id = ${setting.id}`
        );
        await this.notifyStatusRepo.upsertElectricityNotifyStatusesFailure(
          setting.id,
          now
        );
      }
    }
  }

  private async notifyBySetting(
    setting: NotifySetting,
    targetDate: Date,
    logger: Logger
  ): Promise<boolean> {
    if (setting.notifyDistIds.length === 0) {
      logger.warn("skip notify, notify dest LINE user is not found");
      return false;
    }
    if (setting.template === "") {
      logger.warn("skip notify, notify message template is empty");
      return false;
    }

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    const usage = await this.monthlyUsageRepo.findElectricityMonthlyUsage(
      setting.fetchSettingId,
      year,
      month
    );
    if (usage) {
      logger.debug(
        { condition: { fetchSettingId: setting.fetchSettingId, year, month } },
        `usage is found`
      );
    } else {
      logger.debug(
        { condition: { fetchSettingId: setting.fetchSettingId, year, month } },
        `usage is not found`
      );
    }

    const message = this.makeMessage(setting, targetDate, usage);
    logger.debug({ message }, "made a message");

    await this.messageRepo.bulkSendMessage(
      setting.lineChannelId,
      setting.notifyDistIds,
      [
        {
          type: "text",
          text: message,
        },
      ]
    );
    logger.info(
      { lineChannelId: setting.lineChannelId, to: setting.notifyDistIds },
      "notified to LINE"
    );
    return true;
  }

  private makeMessage(
    setting: NotifySetting,
    today: Date,
    usage: MonthlyUsage | null
  ): string {
    const make = Handlebars.compile(setting.template);
    return make({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      date: today.getDate(),
      usage: usage,
    });
  }
}
