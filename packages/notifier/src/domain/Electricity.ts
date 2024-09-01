import Logger from "bunyan";
import type { Message, MessageRepository } from "./types/Message";
import Handlebars from "handlebars";
import type {
  DailyUsage,
  DailyUsageRepository,
  MonthlyUsage,
  MonthlyUsageRepository,
  NotifyDestLineUserRepository,
  NotifySetting,
  NotifySettingRepository,
  NotifyStatusRepository,
} from "./types/Electricity";
import { messagingApi } from "@line/bot-sdk";
import type { AdviceRepository } from "./types/Advice";
import { SecretString } from "lib";
import removeMd from "remove-markdown";

export class ElectricityNotifyService {
  readonly notifySettingRepo: NotifySettingRepository;
  readonly monthlyUsageRepo: MonthlyUsageRepository;
  readonly dailyUsageRepo: DailyUsageRepository;
  readonly notifyStatusRepo: NotifyStatusRepository;
  readonly messageRepo: MessageRepository;
  readonly notifyDestLineUserRepo: NotifyDestLineUserRepository;
  readonly adviceRepo: AdviceRepository;
  readonly encryptionPassword: SecretString;

  constructor(
    notifySettingRepo: NotifySettingRepository,
    monthlyUsageRepo: MonthlyUsageRepository,
    dailyUsageRepo: DailyUsageRepository,
    notifyStatusRepo: NotifyStatusRepository,
    notifyDestLineUserRepo: NotifyDestLineUserRepository,
    messageRepo: MessageRepository,
    adviceRepo: AdviceRepository,
    encryptionPassword: SecretString
  ) {
    this.notifySettingRepo = notifySettingRepo;
    this.monthlyUsageRepo = monthlyUsageRepo;
    this.dailyUsageRepo = dailyUsageRepo;
    this.notifyStatusRepo = notifyStatusRepo;
    this.notifyDestLineUserRepo = notifyDestLineUserRepo;
    this.messageRepo = messageRepo;
    this.adviceRepo = adviceRepo;
    this.encryptionPassword = encryptionPassword;
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

    const lastDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() - 1
    );
    const nextDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      1
    );

    const targetUsage = await this.findMonthlyUsage(
      setting,
      targetDate,
      logger
    );
    const nextUsage = await this.findMonthlyUsage(setting, nextDate, logger);
    const dailyUsages = await this.findDailyUsages(setting, lastDate, logger);

    if (
      this.shouldSkipNotify(setting, targetDate, targetUsage, nextUsage, logger)
    ) {
      return false;
    }

    const messages = await this.makeMessages(
      setting,
      targetDate,
      targetUsage,
      dailyUsages
    );
    logger.debug({ messages }, "made the messages");

    const handleEachMessageSent = async (
      to: string,
      _sentMessages: messagingApi.SentMessage[]
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
      messages,
      handleEachMessageSent
    );
    return true;
  }

  private async findMonthlyUsage(
    setting: NotifySetting,
    targetDate: Date,
    logger: Logger
  ): Promise<MonthlyUsage | undefined> {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const usage = await this.monthlyUsageRepo.findMonthlyUsage(
      setting.fetchSettingId,
      year,
      month
    );
    logger.debug(
      { fetchSettingId: setting.fetchSettingId, year, month, usage },
      "find electricity_monthly_usage"
    );
    return usage;
  }

  private async findDailyUsages(
    setting: NotifySetting,
    targetDate: Date,
    logger: Logger
  ): Promise<DailyUsage[]> {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const usages = await this.dailyUsageRepo.findDailyUsages(
      setting.fetchSettingId,
      year,
      month
    );
    logger.debug(
      { fetchSettingId: setting.fetchSettingId, year, month },
      `find electricity_daily_usage, count = ${usages.length}`
    );
    return usages;
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

  private async makeMessages(
    setting: NotifySetting,
    today: Date,
    monthlyUsage: MonthlyUsage | undefined,
    dailyUsages: DailyUsage[]
  ): Promise<Message[]> {
    const messages: Message[] = [];
    const make = Handlebars.compile(setting.template);
    const summary = make({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      date: today.getDate(),
      usage: monthlyUsage,
    });
    messages.push({ type: "text", text: summary });

    if (monthlyUsage && setting.encryptedAdvisorApiKey) {
      const apikey = setting.encryptedAdvisorApiKey.decrypt(
        this.encryptionPassword
      );
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const adviceMarkdown = await this.adviceRepo.generateElectricityAdvice(
        apikey,
        lastMonth.getFullYear(),
        lastMonth.getMonth() + 1,
        monthlyUsage.yen,
        dailyUsages
      );
      messages.push({
        type: "text",
        text: removeMd(adviceMarkdown),
      });
    }

    return messages;
  }
}
