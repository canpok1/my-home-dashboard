import { PrismaClient } from "@prisma/client";
import * as electricity from "../domain/Electricity";
import * as gas from "../domain/Gas";
import * as water from "../domain/Water";
import { SecretString } from "lib/src/Secret";
import { EncryptedValue } from "lib/src/Encrypt";

export class MySqlClient
  implements
    electricity.UsageRepository,
    electricity.FetchSettingRepository,
    gas.UsageRepository,
    gas.FetchSettingRepository,
    water.UsageRepository,
    water.FetchSettingRepository
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
    const settings = await this.prisma.electricity_fetch_settings.findMany();
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
    const settings = await this.prisma.gas_fetch_settings.findMany();
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
    const settings = await this.prisma.water_fetch_settings.findMany();
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
      await this.prisma.electricity_monthly_usages.upsert({
        where: {
          electricity_fetch_setting_id_usage_year_usage_month: {
            electricity_fetch_setting_id: usage.fetchSettingId,
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
        create: {
          electricity_fetch_setting_id: usage.fetchSettingId,
          usage_year: usage.year,
          usage_month: usage.month,
          usage_day_count: usage.dayCount,
          usage_kwh: usage.kwh,
          usage_yen: usage.yen,
        },
        update: {
          usage_day_count: usage.dayCount,
          usage_kwh: usage.kwh,
          usage_yen: usage.yen,
          updated_at: now,
        },
      });
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
}
