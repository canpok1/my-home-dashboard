export interface NotifySetting {
  id: bigint;
  fetchSettingId: bigint;
  lineChannelId: string;
  template: string;
  notifyDistIds: string[];
}

export interface MonthlyUsage {
  yen: number;
  kwh: number;
  settingName: string;
}

export interface NotifySettingRepository {
  findElectricityNotifySettings(notifyDate: number): Promise<NotifySetting[]>;
}

export interface MonthlyUsageRepository {
  findElectricityMonthlyUsage(
    fetchSettingId: bigint,
    year: number,
    month: number
  ): Promise<MonthlyUsage | null>;
}

export interface NotifyStatusRepository {
  upsertElectricityNotifyStatusesSuccess(
    notifySettingId: bigint,
    now: Date
  ): Promise<void>;
  upsertElectricityNotifyStatusesFailure(
    notifySettingId: bigint,
    now: Date
  ): Promise<void>;
}
