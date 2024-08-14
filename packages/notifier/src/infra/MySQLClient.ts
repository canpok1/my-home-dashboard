import { PrismaClient } from "@prisma/client";
import type {
  MonthlyUsage,
  MonthlyUsageRepository,
  NotifySetting,
  NotifySettingRepository,
  NotifyStatusRepository,
} from "../domain/types/Electricity";

export class MySqlClient
  implements
    NotifySettingRepository,
    MonthlyUsageRepository,
    NotifyStatusRepository
{
  readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findElectricityNotifySettings(
    notifyDate: number
  ): Promise<NotifySetting[]> {
    const settings = await this.prisma.electricity_notify_settings.findMany({
      select: {
        id: true,
        electricity_fetch_setting_id: true,
        line_channel_id: true,
        template: true,
        electricity_notify_dest_line_users: {
          select: {
            line_user_id: true,
          },
        },
      },
      where: {
        notify_date: notifyDate,
        notify_enable: true,
      },
    });
    return settings.map((setting) => ({
      id: setting.id,
      fetchSettingId: setting.electricity_fetch_setting_id,
      lineChannelId: setting.line_channel_id,
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
  ): Promise<MonthlyUsage | null> {
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
    if (usage) {
      return {
        yen: usage.usage_yen,
        kwh: usage.usage_kwh,
        settingName: usage.electricity_fetch_settings.setting_name,
      };
    } else {
      return null;
    }
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
    status: "success" | "failure"
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
}
