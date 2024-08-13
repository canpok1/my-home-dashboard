import Logger from "bunyan";
import { Env } from "../Env";
import { SecretString } from "lib";

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

export interface FetchStatusRepository {
  upsertElectricityFetchStatusSuccess(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void>;
  upsertElectricityFetchStatusFailure(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void>;
}

export interface RunResult {
  successfulCount: number;
  failureCount: number;
}

export class UsageService {
  readonly env: Env;
  readonly fetcher: UsageFetcher;
  readonly fetchSettingRepo: FetchSettingRepository;
  readonly usageRepo: UsageRepository;
  readonly fetchStatusRepo: FetchStatusRepository;

  constructor(
    env: Env,
    fetcher: UsageFetcher,
    fetchSettingRepo: FetchSettingRepository,
    usageRepo: UsageRepository,
    fetchStatusRepo: FetchStatusRepository
  ) {
    this.env = env;
    this.fetcher = fetcher;
    this.fetchSettingRepo = fetchSettingRepo;
    this.usageRepo = usageRepo;
    this.fetchStatusRepo = fetchStatusRepo;
  }

  async run(parentLogger: Logger): Promise<RunResult> {
    const now = new Date();
    const settings =
      await this.fetchSettingRepo.findAllElectricityFetchSettings();
    parentLogger.info(
      "loaded electricity_fetch_settings, count %d",
      settings.length
    );

    const result = {
      successfulCount: 0,
      failureCount: 0,
    };

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
        result.successfulCount++;
      } catch (err) {
        logger.error({ err }, "fetch electricity failed");
        result.failureCount++;
      } finally {
        logger.info(
          "fetch electricity end by setting[%s, %s]",
          setting.id.toString(),
          setting.userName
        );
      }
    }

    return result;
  }

  private async fetchAndSave(
    logger: Logger,
    now: Date,
    setting: FetchSettingModel
  ): Promise<void> {
    try {
      const monthlyUsages = await this.fetcher.fetchMonthly(logger, setting);
      await this.usageRepo.saveElectricityMonthlyUsages(monthlyUsages, now);

      const dailyUsages = await this.fetcher.fetchDaily(logger, setting);
      await this.usageRepo.saveElectricityDailyUsages(dailyUsages, now);

      await this.fetchStatusRepo.upsertElectricityFetchStatusSuccess(
        setting.id,
        new Date()
      );
    } catch (err) {
      await this.fetchStatusRepo.upsertElectricityFetchStatusFailure(
        setting.id,
        new Date()
      );
      throw err;
    }
  }
}
