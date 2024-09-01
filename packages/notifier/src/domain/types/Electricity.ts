export interface NotifySetting {
  id: bigint;
  fetchSettingId: bigint;
  lineChannelId: string;
  notifyDate: number;
  template: string;
  notifyDistUserIds: string[];
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
  findElectricityNotifySettings(targetDate: Date): Promise<NotifySetting[]>;
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

export interface NotifyDestLineUserRepository {
  updateElectricityNotifyDestLineUsersLastNotifiedAt(
    notifySettingId: bigint,
    lineUserId: string,
    now: Date
  ): Promise<void>;
}
