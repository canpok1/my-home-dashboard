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
  begin: string;
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
  findAllGasFetchSettings(): Promise<FetchSettingModel[]>;
}

export interface UsageRepository {
  saveGasMonthlyUsages(usages: MonthlyUsageModel[], now: Date): Promise<void>;
}

export interface FetchStatusRepository {
  upsertGasFetchStatusSuccess(fetchSettingId: bigint, now: Date): Promise<void>;
  upsertGasFetchStatusFailure(fetchSettingId: bigint, now: Date): Promise<void>;
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
    const settings = await this.fetchSettingRepo.findAllGasFetchSettings();
    parentLogger.info("loaded gas_fetch_settings, count %d", settings.length);

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
        "fetch gas start by setting[%s, %s]",
        setting.id.toString(),
        setting.userName
      );
      try {
        await this.fetchAndSave(logger, now, setting);
        result.successfulCount++;
      } catch (err) {
        logger.error({ err }, "fetch gas failed");
        result.failureCount++;
      } finally {
        logger.info(
          "fetch gas end by setting[%s, %s]",
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
      const models = await this.fetcher.fetchMonthly(logger, setting);
      await this.usageRepo.saveGasMonthlyUsages(models, now);

      await this.fetchStatusRepo.upsertGasFetchStatusSuccess(
        setting.id,
        new Date()
      );
    } catch (err) {
      await this.fetchStatusRepo.upsertGasFetchStatusFailure(
        setting.id,
        new Date()
      );
    }
  }
}
