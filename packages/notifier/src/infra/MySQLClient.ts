import { PrismaClient } from "@prisma/client";
import {
  isNotifyStatus,
  type ElectricityNotifyStatus,
  type MonthlyUsage,
  type MonthlyUsageRepository,
  type NotifySetting,
  type NotifySettingRepository,
  type NotifyStatus,
  type NotifyStatusRepository,
} from "../domain/Electricity";
import { AppStatusRepository } from "../domain/types/AppStatus";

export class MySqlClient
  implements
    NotifySettingRepository,
    MonthlyUsageRepository,
    NotifyStatusRepository,
    AppStatusRepository
{
  readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findElectricityNotifySettings(): Promise<NotifySetting[]> {
    const settings = await this.prisma.electricity_notify_settings.findMany({
      select: {
        id: true,
        electricity_fetch_setting_id: true,
        line_channel_id: true,
        notify_date: true,
        template: true,
        electricity_notify_dest_line_users: {
          select: {
            line_user_id: true,
          },
        },
      },
      where: {
        notify_enable: true,
      },
    });
    return settings.map((setting) => ({
      id: setting.id,
      fetchSettingId: setting.electricity_fetch_setting_id,
      lineChannelId: setting.line_channel_id,
      notifyDate: setting.notify_date,
      template: setting.template,
      notifyDistIds: setting.electricity_notify_dest_line_users.map(
        (user) => user.line_user_id
      ),
    }));
  }

  async findElectricityMonthlyUsage(
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

  async findElectricityNotifyStatus(
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

  async upsertElectricityNotifyStatusesSuccess(
    notifySettingId: bigint,
    now: Date
  ): Promise<void> {
    return this.upsertElectricityNotifyStatuses(
      notifySettingId,
      now,
      "success"
    );
  }

  async upsertElectricityNotifyStatusesFailure(
    notifySettingId: bigint,
    now: Date
  ): Promise<void> {
    return this.upsertElectricityNotifyStatuses(
      notifySettingId,
      now,
      "failure"
    );
  }

  private async upsertElectricityNotifyStatuses(
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
