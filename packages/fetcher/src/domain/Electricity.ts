import Logger from "bunyan";
import { Env } from "../Env";

export interface MonthlyUsageModel {
  year: number;
  month: number;
  dayCount: number;
  kwh: number;
  yen: number;
}

export interface DailyUsageModel {
  year: number;
  month: number;
  date: number;
  amount: number;
}

export interface UsageFetcher {
  fetchMonthly(logger: Logger): Promise<MonthlyUsageModel[]>;
  fetchDaily(logger: Logger): Promise<DailyUsageModel[]>;
}

export interface UsageRepository {
  saveElectricityMonthlyUsages(
    usages: MonthlyUsageModel[],
    now: Date
  ): Promise<void>;

  saveElectricityDailyUsages(
    usages: DailyUsageModel[],
    now: Date
  ): Promise<void>;
}

export class UsageService {
  readonly env: Env;
  readonly fetcher: UsageFetcher;
  readonly repository: UsageRepository;

  constructor(env: Env, fetcher: UsageFetcher, repository: UsageRepository) {
    this.env = env;
    this.fetcher = fetcher;
    this.repository = repository;
  }

  async run(logger: Logger): Promise<void> {
    const now = new Date();
    await this.fetchAndSave(logger, now);
  }

  private async fetchAndSave(logger: Logger, now: Date): Promise<void> {
    const monthlyUsages = await this.fetcher.fetchMonthly(logger);
    await this.repository.saveElectricityMonthlyUsages(monthlyUsages, now);

    const dailyUsages = await this.fetcher.fetchDaily(logger);
    await this.repository.saveElectricityDailyUsages(dailyUsages, now);
  }
}
