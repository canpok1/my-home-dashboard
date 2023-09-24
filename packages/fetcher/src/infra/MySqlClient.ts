import { PrismaClient } from "@prisma/client";
import * as electricity from "../domain/Electricity";
import * as gas from "../domain/Gas";
import * as water from "../domain/Water";

export class MySqlClient {
  readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async saveElectricityMonthlyUsages(
    usages: electricity.MonthlyUsageModel[],
    now: Date
  ): Promise<void> {
    for (const usage of usages) {
      await this.prisma.electricity_monthly_usages.upsert({
        where: {
          usage_year_usage_month: {
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
        create: {
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
          usage_year_usage_month_usage_date: {
            usage_year: usage.year,
            usage_month: usage.month,
            usage_date: usage.date,
          },
        },
        create: {
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
          usage_year_usage_month: {
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
        create: {
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
          usage_year_usage_month: {
            usage_year: usage.year,
            usage_month: usage.month,
          },
        },
        create: {
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
