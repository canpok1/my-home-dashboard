import Logger from "bunyan";
import { Env } from "../Env";
import { SecretString } from "lib/src/Secret";

export interface FetchSettingModel {
  id: bigint;
  siteId: bigint;
  userName: string;
  password: SecretString;
}

export interface MonthlyUsageModel {
  fetchSettingId: bigint;
  year: number;
  month: number;
  dayCount: number;
  kwh: number;
  yen: number;
}

export interface DailyUsageModel {
  fetchSettingId: bigint;
  year: number;
  month: number;
  date: number;
  amount: number;
}

export interface UsageFetcher {
  fetchMonthly(
    logger: Logger,
    setting: FetchSettingModel
  ): Promise<MonthlyUsageModel[]>;
  fetchDaily(
    logger: Logger,
    setting: FetchSettingModel
  ): Promise<DailyUsageModel[]>;
}

export interface FetchSettingRepository {
  findAllElectricityFetchSettings(): Promise<FetchSettingModel[]>;
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
  readonly fetchSettingRepo: FetchSettingRepository;
  readonly usageRepo: UsageRepository;

  constructor(
    env: Env,
    fetcher: UsageFetcher,
    fetchSettingRepo: FetchSettingRepository,
    usageRepo: UsageRepository
  ) {
    this.env = env;
    this.fetcher = fetcher;
    this.fetchSettingRepo = fetchSettingRepo;
    this.usageRepo = usageRepo;
  }

  async run(parentLogger: Logger): Promise<void> {
    const now = new Date();
    const settings =
      await this.fetchSettingRepo.findAllElectricityFetchSettings();
    parentLogger.info(
      "loaded electricity_fetch_settings, count %d",
      settings.length
    );

    for (const setting of settings) {
      const logger = parentLogger.child({
        setting_id: setting.id.toString(),
        user_name: setting.userName,
      });

      logger.info(
        "fetch electricity start by setting[%s, %s]",
        setting.id.toString(),
        setting.userName
      );
      try {
        await this.fetchAndSave(logger, now, setting);
      } catch (err) {
        logger.error({ err }, "fetch electricity failed");
      } finally {
        logger.info(
          "fetch electricity end by setting[%s, %s]",
          setting.id.toString(),
          setting.userName
        );
      }
    }
  }

  private async fetchAndSave(
    logger: Logger,
    now: Date,
    setting: FetchSettingModel
  ): Promise<void> {
    const monthlyUsages = await this.fetcher.fetchMonthly(logger, setting);
    await this.usageRepo.saveElectricityMonthlyUsages(monthlyUsages, now);

    const dailyUsages = await this.fetcher.fetchDaily(logger, setting);
    await this.usageRepo.saveElectricityDailyUsages(dailyUsages, now);
  }
}