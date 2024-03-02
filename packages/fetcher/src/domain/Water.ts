import { SecretString } from "lib/src/Secret";
import { Env } from "../Env";
import Logger from "bunyan";

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
  begin: string | null;
  end: string;
  amount: number;
  yen: number;
}

export interface UsageFetcher {
  fetchMonthly(
    logger: Logger,
    setting: FetchSettingModel
  ): Promise<MonthlyUsageModel[]>;
}

export interface FetchSettingRepository {
  findAllWaterFetchSettings(): Promise<FetchSettingModel[]>;
}

export interface UsageRepository {
  saveWaterMonthlyUsages(usages: MonthlyUsageModel[], now: Date): Promise<void>;
}

export interface FetchStatusRepository {
  upsertWaterFetchStatusSuccess(
    fetchSettingId: bigint,
    now: Date
  ): Promise<void>;
  upsertWaterFetchStatusFailure(
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
    const settings = await this.fetchSettingRepo.findAllWaterFetchSettings();
    parentLogger.info("loaded water_fetch_settings, count %d", settings.length);

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
        "fetch water start by setting[%s, %s]",
        setting.id.toString(),
        setting.userName
      );
      try {
        await this.fetchAndSave(logger, now, setting);
        result.successfulCount++;
      } catch (err) {
        logger.error({ err }, "fetch water failed");
        result.failureCount++;
      } finally {
        logger.info(
          "fetch water end by setting[%s, %s]",
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
      const usages = await this.fetcher.fetchMonthly(logger, setting);
      await this.usageRepo.saveWaterMonthlyUsages(usages, now);

      await this.fetchStatusRepo.upsertWaterFetchStatusSuccess(
        setting.id,
        new Date()
      );
    } catch (err) {
      await this.fetchStatusRepo.upsertWaterFetchStatusFailure(
        setting.id,
        new Date()
      );
    }
  }
}
