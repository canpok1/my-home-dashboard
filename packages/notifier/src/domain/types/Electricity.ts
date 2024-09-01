import { EncryptedValue } from "lib";

export interface NotifySetting {
  id: bigint;
  fetchSettingId: bigint;
  lineChannelId: string;
  encryptedAdvisorApiKey?: EncryptedValue;
  notifyDate: number;
  template: string;
  notifyDistUserIds: string[];
}

export interface MonthlyUsage {
  yen: number;
  kwh: number;
  settingName: string;
}

export interface DailyUsage {
  year: number;
  month: number;
  date: number;
  kwh: number;
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
  findNotifySettings(targetDate: Date): Promise<NotifySetting[]>;
}

export interface MonthlyUsageRepository {
  findMonthlyUsage(
    fetchSettingId: bigint,
    year: number,
    month: number
  ): Promise<MonthlyUsage | undefined>;
}

export interface DailyUsageRepository {
  findDailyUsages(
    fetchSettingId: bigint,
    year: number,
    month: number
  ): Promise<DailyUsage[]>;
}

export interface NotifyStatusRepository {
  findNotifyStatus(
    notifySettingId: bigint
  ): Promise<ElectricityNotifyStatus | undefined>;
  upsertNotifyStatusesSuccess(
    notifySettingId: bigint,
    now: Date
  ): Promise<void>;
  upsertNotifyStatusesFailure(
    notifySettingId: bigint,
    now: Date
  ): Promise<void>;
}

export interface NotifyDestLineUserRepository {
  updateNotifyDestLineUsersLastNotifiedAt(
    notifySettingId: bigint,
    lineUserId: string,
    now: Date
  ): Promise<void>;
}
