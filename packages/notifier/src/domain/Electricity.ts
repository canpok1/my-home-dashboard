import Logger from "bunyan";
import { MessageRepository } from "./types/Message";
import Handlebars from "handlebars";

export interface NotifySetting {
  id: bigint;
  fetchSettingId: bigint;
  lineChannelId: string;
  notifyDate: number;
  template: string;
  notifyDistIds: string[];
}

export interface MonthlyUsage {
  yen: number;
  kwh: number;
  settingName: string;
}

const notifyStatuses = ["success", "failure"] as const;
export type NotifyStatus = (typeof notifyStatuses)[number];

export function isNotifyStatus(value: string): value is NotifyStatus {
  return notifyStatuses.some((status) => status === value);
}

export interface ElectricityNotifyStatus {
  status: NotifyStatus;
  lastSuccessfulAt?: Date;
  lastFailureAt?: Date;
}

export interface NotifySettingRepository {
  findElectricityNotifySettings(): Promise<NotifySetting[]>;
}

export interface MonthlyUsageRepository {
  findElectricityMonthlyUsage(
    fetchSettingId: bigint,
    year: number,
    month: number
  ): Promise<MonthlyUsage | undefined>;
}

export interface NotifyStatusRepository {
  findElectricityNotifyStatus(
    notifySettingId: bigint
  ): Promise<ElectricityNotifyStatus | undefined>;
  upsertElectricityNotifyStatusesSuccess(
    notifySettingId: bigint,
    now: Date
  ): Promise<void>;
  upsertElectricityNotifyStatusesFailure(
    notifySettingId: bigint,
    now: Date
  ): Promise<void>;
}

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
    const settings =
      await this.notifySettingRepo.findElectricityNotifySettings();
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
    const status = await this.notifyStatusRepo.findElectricityNotifyStatus(
      setting.id
    );
    logger.debug(
      { notifySettingId: setting.id, status },
      "find electricity_notify_status"
    );

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    const usage = await this.monthlyUsageRepo.findElectricityMonthlyUsage(
      setting.fetchSettingId,
      year,
      month
    );
    logger.debug(
      { fetchSettingId: setting.fetchSettingId, year, month, usage },
      "find electricity_monthly_usage"
    );

    if (this.shouldSkipNotify(setting, targetDate, status, usage, logger)) {
      return false;
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

  private shouldSkipNotify(
    setting: NotifySetting,
    targetDate: Date,
    status: ElectricityNotifyStatus | undefined,
    usage: MonthlyUsage | undefined,
    logger: Logger
  ): boolean {
    if (setting.notifyDistIds.length === 0) {
      logger.warn("skip notify, notify dest LINE user is not found");
      return true;
    }
    if (setting.template === "") {
      logger.warn("skip notify, notify message template is empty");
      return true;
    }

    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    if (this.isMonthlyNotificationCompleted(targetDate, status)) {
      logger.info(
        { targetYear, targetMonth },
        "skip notify, monthly notification completed"
      );
      return true;
    }
    if (!usage) {
      logger.info(
        { fetchSettingId: setting.fetchSettingId, targetYear, targetMonth },
        `skip notify, usage is not found`
      );
      return true;
    }

    return false;
  }

  private isMonthlyNotificationCompleted(
    targetDate: Date,
    status?: ElectricityNotifyStatus
  ): boolean {
    if (!status?.lastSuccessfulAt) {
      return false;
    }
    if (status.lastSuccessfulAt.getFullYear() !== targetDate.getFullYear()) {
      return false;
    }

    if (status.lastSuccessfulAt.getMonth() !== targetDate.getMonth()) {
      return false;
    }

    return true;
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
