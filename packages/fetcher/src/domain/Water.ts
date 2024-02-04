import { Env } from "../Env";
import Logger from "bunyan";

export interface MonthlyUsageModel {
  year: number;
  month: number;
  begin: string | null;
  end: string;
  amount: number;
  yen: number;
}

export interface UsageFetcher {
  fetchMonthly(logger: Logger): Promise<MonthlyUsageModel[]>;
}

export interface UsageRepository {
  saveWaterMonthlyUsages(usages: MonthlyUsageModel[], now: Date): Promise<void>;
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
    const usages = await this.fetcher.fetchMonthly(logger);
    await this.repository.saveWaterMonthlyUsages(usages, now);
  }
}
