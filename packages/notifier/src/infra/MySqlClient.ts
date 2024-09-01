import { PrismaClient } from "@prisma/client";
import {
  type DailyUsage,
  type DailyUsageRepository,
  isNotifyStatus,
  type NotifyDestLineUserRepository,
  type ElectricityNotifyStatus,
  type MonthlyUsage,
  type MonthlyUsageRepository,
  type NotifySetting,
  type NotifySettingRepository,
  type NotifyStatus,
  type NotifyStatusRepository,
} from "../domain/types/Electricity";
import type { AppStatusRepository } from "../domain/types/AppStatus";
import { EncryptedValue } from "lib";

export class MySqlCommonClient implements AppStatusRepository {
  readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async upsertAppStatusStopped(appName: string, now: Date): Promise<void> {
    await this.prisma.app_statuses.upsert({
      where: {
        app_name: appName,
      },
      create: {
        app_name: appName,
        app_status_types: {
          connect: {
            type_name: "stopped",
          },
        },
        last_successful_at: now,
      },
      update: {
        app_status_types: {
          connect: {
            type_name: "stopped",
          },
        },
        last_successful_at: now,
        updated_at: now,
      },
    });
  }

  async upsertAppStatusRunning(appName: string, now: Date): Promise<void> {
    await this.prisma.app_statuses.upsert({
      where: {
        app_name: appName,
      },
      create: {
        app_name: appName,
        app_status_types: {
          connect: {
            type_name: "running",
          },
        },
      },
      update: {
        app_status_types: {
          connect: {
            type_name: "running",
          },
        },
        updated_at: now,
      },
    });
  }

  async upsertAppStatusError(appName: string, now: Date): Promise<void> {
    await this.prisma.app_statuses.upsert({
      where: {
        app_name: appName,
      },
      create: {
        app_name: appName,
        app_status_types: {
          connect: {
            type_name: "error",
          },
        },
        last_failure_at: now,
      },
      update: {
        app_status_types: {
          connect: {
            type_name: "error",
          },
        },
        last_failure_at: now,
        updated_at: now,
      },
    });
  }
}

export class MySqlElectricityClient
  implements
    NotifySettingRepository,
    MonthlyUsageRepository,
    DailyUsageRepository,
    NotifyStatusRepository,
    NotifyDestLineUserRepository
{
  readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findNotifySettings(targetDate: Date): Promise<NotifySetting[]> {
    const borderDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1
    );

    const settings = await this.prisma.electricity_notify_settings.findMany({
      select: {
        id: true,
        electricity_fetch_setting_id: true,
        line_channel_id: true,
        advisors: {
          select: {
            encrypted_apikey: true,
          },
        },
        notify_date: true,
        template: true,
        electricity_notify_dest_line_users: {
          select: {
            line_user_id: true,
          },
        },
      },
      where: {
        OR: [
          {
            // 今月まだ通知してないユーザー
            notify_enable: true,
            electricity_notify_dest_line_users: {
              every: {
                notify_enable: true,
                last_notified_at: {
                  lte: borderDate,
                },
              },
            },
          },
          {
            // 一度も通知してないユーザー
            notify_enable: true,
            electricity_notify_dest_line_users: {
              every: {
                notify_enable: true,
                last_notified_at: null,
              },
            },
          },
        ],
      },
    });
    return settings.map((setting) => ({
      id: setting.id,
      fetchSettingId: setting.electricity_fetch_setting_id,
      lineChannelId: setting.line_channel_id,
      encryptedAdvisorApiKey: setting.advisors?.encrypted_apikey
        ? EncryptedValue.makeFromSerializedText(
            setting.advisors.encrypted_apikey
          )
        : undefined,
      notifyDate: setting.notify_date,
      template: setting.template,
      notifyDistUserIds: setting.electricity_notify_dest_line_users.map(
        (user) => user.line_user_id
      ),
    }));
  }

  async findMonthlyUsage(
    fetchSettingId: bigint,
    year: number,
    month: number
  ): Promise<MonthlyUsage | undefined> {
    const usage = await this.prisma.electricity_monthly_usages.findUnique({
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
        electricity_fetch_setting_id_usage_year_usage_month: {
          electricity_fetch_setting_id: fetchSettingId,
          usage_year: year,
          usage_month: month,
        },
      },
    });
    if (!usage) {
      return undefined;
    }
    return {
      yen: usage.usage_yen,
      kwh: usage.usage_kwh,
      settingName: usage.electricity_fetch_settings.setting_name,
    };
  }

  async findDailyUsages(
    fetchSettingId: bigint,
    year: number,
    month: number
  ): Promise<DailyUsage[]> {
    const usages = await this.prisma.electricity_daily_usages.findMany({
      select: {
        usage_year: true,
        usage_month: true,
        usage_date: true,
        usage_amount: true,
      },
      where: {
        electricity_fetch_setting_id: fetchSettingId,
        usage_year: year,
        usage_month: month,
      },
    });
    return usages.map((usage) => ({
      year: usage.usage_year,
      month: usage.usage_month,
      date: usage.usage_date,
      kwh: usage.usage_amount.toNumber(),
    }));
  }

  async findNotifyStatus(
    notifySettingId: bigint
  ): Promise<ElectricityNotifyStatus | undefined> {
    const record = await this.prisma.electricity_notify_statuses.findUnique({
      select: {
        last_successful_at: true,
        last_failure_at: true,
        notify_status_types: {
          select: {
            type_name: true,
          },
        },
      },
      where: {
        electricity_notify_setting_id: notifySettingId,
      },
    });
    if (!record) {
      return undefined;
    }

    const status = record.notify_status_types.type_name;
    if (!isNotifyStatus(status)) {
      throw new Error(`unsupported type_name [${status}]`);
    }

    return {
      status,
      lastSuccessfulAt: record.last_successful_at || undefined,
      lastFailureAt: record.last_failure_at || undefined,
    };
  }

  async upsertNotifyStatusesSuccess(
    notifySettingId: bigint,
    now: Date
  ): Promise<void> {
    return this.upsertNotifyStatuses(notifySettingId, now, "success");
  }

  async upsertNotifyStatusesFailure(
    notifySettingId: bigint,
    now: Date
  ): Promise<void> {
    return this.upsertNotifyStatuses(notifySettingId, now, "failure");
  }

  private async upsertNotifyStatuses(
    notifySettingId: bigint,
    now: Date,
    status: NotifyStatus
  ): Promise<void> {
    const lastSuccessfulAt = status === "success" ? now : null;
    const lastFailureAt = status === "failure" ? now : null;

    await this.prisma.electricity_notify_statuses.upsert({
      where: {
        electricity_notify_setting_id: notifySettingId,
      },
      create: {
        electricity_notify_settings: {
          connect: {
            id: notifySettingId,
          },
        },
        notify_status_types: {
          connect: {
            type_name: status,
          },
        },
        last_successful_at: lastSuccessfulAt,
        last_failure_at: lastFailureAt,
      },
      update: {
        notify_status_types: {
          connect: {
            type_name: status,
          },
        },
        last_successful_at: lastSuccessfulAt,
        last_failure_at: lastFailureAt,
      },
    });
  }

  async updateNotifyDestLineUsersLastNotifiedAt(
    notifySettingId: bigint,
    lineUserId: string,
    now: Date
  ): Promise<void> {
    await this.prisma.electricity_notify_dest_line_users.update({
      where: {
        electricity_notify_setting_id_line_user_id: {
          electricity_notify_setting_id: notifySettingId,
          line_user_id: lineUserId,
        },
      },
      data: {
        last_notified_at: now,
      },
    });
  }
}
