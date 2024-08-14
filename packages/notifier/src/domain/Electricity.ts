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

  async notify(targetDate: Date, parentLogger: Logger) {
    const logger = parentLogger.child({ targetDate });

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const date = targetDate.getDate();

    const settings =
      await this.notifySettingRepo.findElectricityNotifySettings(date);
    logger.debug(`${settings.length} settings were find`);

    if (settings.length === 0) {
      logger.info("skip notify, notify settings is not found");
      return;
    }

    for (const setting of settings) {
      const now = new Date();
      try {
        const notified = await this.notifyBySetting(
          setting,
          targetDate,
          logger
        );
        if (notified) {
          await this.notifyStatusRepo.upsertElectricityNotifyStatusesSuccess(
            setting.id,
            now
          );
        }
      } catch (err) {
        logger.error(err, "failed to notify by setting");
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
    parentLogger: Logger
  ): Promise<boolean> {
    const logger = parentLogger.child({ notifySettingId: setting.id });
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

    const usages = await this.monthlyUsageRepo.findElectricityMonthlyUsages(
      setting.fetchSettingId,
      year,
      month
    );
    logger.debug(
      { condition: { fetchSettingId: setting.fetchSettingId, year, month } },
      `${usages.length} usages were found`
    );

    const message = this.makeMessage(setting, targetDate, usages);
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
      "success to send message"
    );
    return true;
  }

  private makeMessage(
    setting: NotifySetting,
    today: Date,
    usages: MonthlyUsage[]
  ): string {
    const make = Handlebars.compile(setting.template);
    return make({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      date: today.getDate(),
      usages: usages,
    });
  }
}
