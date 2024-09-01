import Logger from "bunyan";
import { MessageRepository } from "./types/Message";
import Handlebars from "handlebars";
import type {
  MonthlyUsage,
  MonthlyUsageRepository,
  NotifyDestLineUserRepository,
  NotifySetting,
  NotifySettingRepository,
  NotifyStatusRepository,
} from "./types/Electricity";
import { messagingApi } from "@line/bot-sdk";

export class ElectricityNotifyService {
  readonly notifySettingRepo: NotifySettingRepository;
  readonly monthlyUsageRepo: MonthlyUsageRepository;
  readonly notifyStatusRepo: NotifyStatusRepository;
  readonly messageRepo: MessageRepository;
  readonly notifyDestLineUserRepo: NotifyDestLineUserRepository;

  constructor(
    notifySettingRepo: NotifySettingRepository,
    monthlyUsageRepo: MonthlyUsageRepository,
    notifyStatusRepo: NotifyStatusRepository,
    notifyDestLineUserRepo: NotifyDestLineUserRepository,
    messageRepo: MessageRepository
  ) {
    this.notifySettingRepo = notifySettingRepo;
    this.monthlyUsageRepo = monthlyUsageRepo;
    this.notifyStatusRepo = notifyStatusRepo;
    this.notifyDestLineUserRepo = notifyDestLineUserRepo;
    this.messageRepo = messageRepo;
  }

  async notify(targetDate: Date, logger: Logger) {
    const settings =
      await this.notifySettingRepo.findNotifySettings(targetDate);
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
          await this.notifyStatusRepo.upsertNotifyStatusesSuccess(
            setting.id,
            now
          );
        }
      } catch (err) {
        childLogger.error(
          err,
          `failed to notify by electricity_notify_setting_id = ${setting.id}`
        );
        await this.notifyStatusRepo.upsertNotifyStatusesFailure(
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
    const status = await this.notifyStatusRepo.findNotifyStatus(setting.id);
    logger.debug(
      { notifySettingId: setting.id, status },
      "find electricity_notify_status"
    );

    const { year, month } = this.getYearMonth(targetDate);
    const targetUsage = await this.monthlyUsageRepo.findMonthlyUsage(
      setting.fetchSettingId,
      year,
      month
    );
    logger.debug(
      { fetchSettingId: setting.fetchSettingId, year, month, targetUsage },
      "find electricity_monthly_usage for targetDate"
    );

    const nextDate = this.getNextMonthFirst(targetDate);
    const { year: nextYear, month: nextMonth } = this.getYearMonth(nextDate);
    const nextUsage = await this.monthlyUsageRepo.findMonthlyUsage(
      setting.fetchSettingId,
      nextYear,
      nextMonth
    );
    logger.debug(
      {
        fetchSettingId: setting.fetchSettingId,
        nextYear,
        nextMonth,
        nextUsage,
      },
      "find electricity_monthly_usage for nextDate"
    );

    if (
      this.shouldSkipNotify(setting, targetDate, targetUsage, nextUsage, logger)
    ) {
      return false;
    }

    const message = this.makeMessage(setting, targetDate, targetUsage);
    logger.debug({ message }, "made a message");

    const handleEachMessageSent = async (
      to: string,
      sentMessages: messagingApi.SentMessage[]
    ) => {
      const now = new Date();
      await this.notifyDestLineUserRepo.updateNotifyDestLineUsersLastNotifiedAt(
        setting.id,
        to,
        new Date()
      );
      logger.info(
        { lineChannelId: setting.lineChannelId, to },
        "notified to LINE"
      );
    };

    await this.messageRepo.bulkSendMessage(
      setting.lineChannelId,
      setting.notifyDistUserIds,
      [
        {
          type: "text",
          text: message,
        },
      ],
      handleEachMessageSent
    );
    return true;
  }

  private shouldSkipNotify(
    setting: NotifySetting,
    targetDate: Date,
    targetUsage: MonthlyUsage | undefined,
    nextUsage: MonthlyUsage | undefined,
    logger: Logger
  ): boolean {
    if (setting.notifyDistUserIds.length === 0) {
      logger.warn("skip notify, notify dest LINE user is not found");
      return true;
    }
    if (setting.template === "") {
      logger.warn("skip notify, notify message template is empty");
      return true;
    }

    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    if (!targetUsage) {
      logger.info(
        { fetchSettingId: setting.fetchSettingId, targetYear, targetMonth },
        `skip notify, usage is not found`
      );
      return true;
    }
    if (!nextUsage) {
      logger.info(
        { fetchSettingId: setting.fetchSettingId, targetYear, targetMonth },
        `skip notify, usage is not determined`
      );
      return true;
    }

    return false;
  }

  private getNextMonthFirst(base: Date): Date {
    return new Date(base.getFullYear(), base.getMonth() + 1, 1);
  }

  private getYearMonth(base: Date): { year: number; month: number } {
    return {
      year: base.getFullYear(),
      month: base.getMonth() + 1,
    };
  }

  private makeMessage(
    setting: NotifySetting,
    today: Date,
    usage: MonthlyUsage | undefined
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
