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
    const settings = await this.fetchSettingRepo.findAllWaterFetchSettings();
    parentLogger.info("loaded water_fetch_settings, count %d", settings.length);

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
      } catch (err) {
        logger.error({ err }, "fetch water failed");
      } finally {
        logger.info(
          "fetch water end by setting[%s, %s]",
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
    const usages = await this.fetcher.fetchMonthly(logger, setting);
    await this.usageRepo.saveWaterMonthlyUsages(usages, now);
  }
}
