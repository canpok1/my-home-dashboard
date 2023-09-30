import Logger from "bunyan";
import { Env } from "../Env";
import { Scheduler } from "./Scheduler";

export interface MonthlyUsageModel {
  year: number;
  month: number;
  begin: string;
  end: string;
  amount: number;
  yen: number;
}

export interface UsageFetcher {
  fetchMonthly(logger: Logger): Promise<MonthlyUsageModel[]>;
}

export interface UsageRepository {
  saveGasMonthlyUsages(usages: MonthlyUsageModel[], now: Date): Promise<void>;
}

export class UsageService {
  readonly env: Env;
  readonly fetcher: UsageFetcher;
  readonly repository: UsageRepository;
  readonly scheduler: Scheduler;

  constructor(
    env: Env,
    fetcher: UsageFetcher,
    repository: UsageRepository,
    scheduler: Scheduler
  ) {
    this.env = env;
    this.fetcher = fetcher;
    this.repository = repository;
    this.scheduler = scheduler;
  }

  async run(logger: Logger): Promise<void> {
    await this.scheduler.schedule(logger, this.env.cron, async () => {
      const now = new Date();
      await this.fetchAndSave(logger, now);
    });
  }

  async fetchAndSave(logger: Logger, now: Date): Promise<void> {
    const models = await this.fetcher.fetchMonthly(logger);
    await this.repository.saveGasMonthlyUsages(models, now);
  }
}