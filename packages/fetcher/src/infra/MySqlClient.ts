import { PrismaClient } from "@prisma/client";
import * as electricity from "../domain/Electricity";
import * as gas from "../domain/Gas";
import * as water from "../domain/Water";
import * as app from "../domain/AppStatus";
import { SecretString, EncryptedValue } from "lib";

export class MySqlClient
  implements
    electricity.UsageRepository,
    electricity.FetchSettingRepository,
    electricity.FetchStatusRepository,
    gas.UsageRepository,
    gas.FetchSettingRepository,
    gas.FetchStatusRepository,
    water.UsageRepository,
    water.FetchSettingRepository,
    water.FetchStatusRepository,
    app.AppStatusRepository
{
  readonly prisma: PrismaClient;
  readonly encryptionPassword: SecretString;

  constructor(prisma: PrismaClient, encryptionPassword: SecretString) {
    this.prisma = prisma;
    this.encryptionPassword = encryptionPassword;
  }
  async findAllElectricityFetchSettings(): Promise<
    electricity.FetchSettingModel[]
  > {
    const settings = await this.prisma.electricity_fetch_settings.findMany({
      where: {
        fetch_enable: true,
      },
    });
    return settings.map((v) => {
      const password = EncryptedValue.makeFromSerializedText(
        v.encrypted_password
      ).decrypt(this.encryptionPassword);
      return {
        id: v.id,
        siteId: v.electricity_site_id,
        userName: v.user_name,
        password: password,
      };
    });
  }

  async findAllGasFetchSettings(): Promise<gas.FetchSettingModel[]> {
    const settings = await this.prisma.gas_fetch_settings.findMany({
      where: {
        fetch_enable: true,
      },
    });
    return settings.map((v) => {
      const password = EncryptedValue.makeFromSerializedText(
        v.encrypted_password
      ).decrypt(this.encryptionPassword);
      return {
        id: v.id,
        siteId: v.gas_site_id,
        userName: v.user_name,
        password: password,
      };
    });
  }

  async findAllWaterFetchSettings(): Promise<water.FetchSettingModel[]> {
    const settings = await this.prisma.water_fetch_settings.findMany({
      where: {
        fetch_enable: true,
      },
    });
    return settings.map((v) => {
      const password = EncryptedValue.makeFromSerializedText(
        v.encrypted_password
      ).decrypt(this.encryptionPassword);
      return {
        id: v.id,
        siteId: v.water_site_id,
        userName: v.user_name,
        password: password,
      };
    });
  }

  async saveElectricityMonthlyUsages(
    usages: electricity.MonthlyUsageModel[],
    now: Date
  ): Promise<void> {
    for (const usage of usages) {
      const old = await this.prisma.electricity_monthly_usages.findUnique({
        select: {
          usage_day_count: true,
          usage_kwh: true,
          usage_yen: true,
        },
        where: {
          electricity_fetch_setting_id_usage_year_usage_month: {
            electricity_fetch_setting_id: usage.fetchSettingId,
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
      });
      if (old) {
        // 月の切り替わり時期になると取得値が少なくなる場合があるためチェック
        if (usage.yen < old.usage_yen || usage.kwh < old.usage_kwh) {
          continue;
        }

        await this.prisma.electricity_monthly_usages.update({
          data: {
            usage_day_count: usage.dayCount,
            usage_kwh: usage.kwh,
            usage_yen: usage.yen,
            updated_at: now,
          },
          where: {
            electricity_fetch_setting_id_usage_year_usage_month: {
              electricity_fetch_setting_id: usage.fetchSettingId,
              usage_year: usage.year,
              usage_month: usage.month,
            },
          },
        });
      } else {
        await this.prisma.electricity_monthly_usages.create({
          data: {
            electricity_fetch_setting_id: usage.fetchSettingId,
            usage_year: usage.year,
            usage_month: usage.month,
            usage_day_count: usage.dayCount,
            usage_kwh: usage.kwh,
            usage_yen: usage.yen,
          },
        });
      }
    }
  }

  async saveElectricityDailyUsages(
    usages: electricity.DailyUsageModel[],
    now: Date
  ): Promise<void> {
    for (const usage of usages) {
      await this.prisma.electricity_daily_usages.upsert({
        where: {
          electricity_fetch_setting_id_usage_year_usage_month_usage_date: {
            electricity_fetch_setting_id: usage.fetchSettingId,
            usage_year: usage.year,
            usage_month: usage.month,
            usage_date: usage.date,
          },
        },
        create: {
          electricity_fetch_setting_id: usage.fetchSettingId,
          usage_year: usage.year,
          usage_month: usage.month,
          usage_date: usage.date,
          usage_amount: usage.amount,
        },
        update: {
          usage_amount: usage.amount,
          updated_at: now,
        },
      });
    }
  }

  async saveGasMonthlyUsages(
    usages: gas.MonthlyUsageModel[],
    now: Date
  ): Promise<void> {
    for (const usage of usages) {
      await this.prisma.gas_monthly_usages.upsert({
        where: {
          gas_fetch_setting_id_usage_year_usage_month: {
            gas_fetch_setting_id: usage.fetchSettingId,
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
        create: {
          gas_fetch_setting_id: usage.fetchSettingId,
          usage_year: usage.year,
          usage_month: usage.month,
          usage_begin_at: usage.begin,
          usage_end_at: usage.end,
          usage_amount: usage.amount,
          usage_yen: usage.yen,
        },
        update: {
          usage_begin_at: usage.begin,
          usage_end_at: usage.end,
          usage_amount: usage.amount,
          usage_yen: usage.yen,
          updated_at: now,
        },
      });
    }
  }

  async saveWaterMonthlyUsages(
    usages: water.MonthlyUsageModel[],
    now: Date
  ): Promise<void> {
    for (const usage of usages) {
      if (usage.begin == null) {
        continue;
      }

      await this.prisma.water_monthly_usages.upsert({
        where: {
          water_fetch_setting_id_usage_year_usage_month: {
            water_fetch_setting_id: usage.fetchSettingId,
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
        create: {
          water_fetch_setting_id: usage.fetchSettingId,
          usage_year: usage.year,
          usage_month: usage.month,
          usage_begin_at: usage.begin,
          usage_end_at: usage.end,
          usage_amount: usage.amount,
          usage_yen: usage.yen,
        },
        update: {
          usage_begin_at: usage.begin,
          usage_end_at: usage.end,
          usage_amount: usage.amount,
          usage_yen: usage.yen,
          updated_at: now,
        },
      });
    }
  }

  async upsertStopped(appName: string, now: Date): Promise<void> {
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
  async upsertRunning(appName: string, now: Date): Promise<void> {
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
  async upsertError(appName: string, now: Date): Promise<void> {
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

  async upsertElectricityFetchStatusSuccess(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void> {
    await this.prisma.electricity_fetch_statuses.upsert({
      where: {
        electricity_fetch_setting_id: fetchSettingId,
      },
      create: {
        electricity_fetch_settings: {
          connect: {
            id: fetchSettingId,
          },
        },
        fetch_status_types: {
          connect: {
            type_name: "success",
          },
        },
        last_successful_at: now,
      },
      update: {
        fetch_status_types: {
          connect: {
            type_name: "success",
          },
        },
        last_successful_at: now,
        updated_at: now,
      },
    });
  }

  async upsertElectricityFetchStatusFailure(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void> {
    await this.prisma.electricity_fetch_statuses.upsert({
      where: {
        electricity_fetch_setting_id: fetchSettingId,
      },
      create: {
        electricity_fetch_settings: {
          connect: {
            id: fetchSettingId,
          },
        },
        fetch_status_types: {
          connect: {
            type_name: "failure",
          },
        },
        last_failure_at: now,
      },
      update: {
        fetch_status_types: {
          connect: {
            type_name: "failure",
          },
        },
        last_failure_at: now,
        updated_at: now,
      },
    });
  }

  async upsertGasFetchStatusSuccess(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void> {
    await this.prisma.gas_fetch_statuses.upsert({
      where: {
        gas_fetch_setting_id: fetchSettingId,
      },
      create: {
        gas_fetch_settings: {
          connect: {
            id: fetchSettingId,
          },
        },
        fetch_status_types: {
          connect: {
            type_name: "success",
          },
        },
        last_successful_at: now,
      },
      update: {
        fetch_status_types: {
          connect: {
            type_name: "success",
          },
        },
        last_successful_at: now,
        updated_at: now,
      },
    });
  }

  async upsertGasFetchStatusFailure(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void> {
    await this.prisma.gas_fetch_statuses.upsert({
      where: {
        gas_fetch_setting_id: fetchSettingId,
      },
      create: {
        gas_fetch_settings: {
          connect: {
            id: fetchSettingId,
          },
        },
        fetch_status_types: {
          connect: {
            type_name: "failure",
          },
        },
        last_failure_at: now,
      },
      update: {
        fetch_status_types: {
          connect: {
            type_name: "failure",
          },
        },
        last_failure_at: now,
        updated_at: now,
      },
    });
  }

  async upsertWaterFetchStatusSuccess(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void> {
    await this.prisma.water_fetch_statuses.upsert({
      where: {
        water_fetch_setting_id: fetchSettingId,
      },
      create: {
        water_fetch_settings: {
          connect: {
            id: fetchSettingId,
          },
        },
        fetch_status_types: {
          connect: {
            type_name: "success",
          },
        },
        last_successful_at: now,
      },
      update: {
        fetch_status_types: {
          connect: {
            type_name: "success",
          },
        },
        last_successful_at: now,
        updated_at: now,
      },
    });
  }

  async upsertWaterFetchStatusFailure(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void> {
    await this.prisma.water_fetch_statuses.upsert({
      where: {
        water_fetch_setting_id: fetchSettingId,
      },
      create: {
        water_fetch_settings: {
          connect: {
            id: fetchSettingId,
          },
        },
        fetch_status_types: {
          connect: {
            type_name: "failure",
          },
        },
        last_failure_at: now,
      },
      update: {
        fetch_status_types: {
          connect: {
            type_name: "failure",
          },
        },
        last_failure_at: now,
        updated_at: now,
      },
    });
  }
}
