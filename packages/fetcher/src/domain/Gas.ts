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
    const settings = await this.fetchSettingRepo.findAllGasFetchSettings();
    parentLogger.info("loaded gas_fetch_settings, count %d", settings.length);

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
      } catch (err) {
        logger.error({ err }, "fetch gas failed");
      } finally {
        logger.info(
          "fetch gas end by setting[%s, %s]",
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
    const models = await this.fetcher.fetchMonthly(logger, setting);
    await this.usageRepo.saveGasMonthlyUsages(models, now);
  }
}
