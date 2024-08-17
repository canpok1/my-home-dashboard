import Logger from "bunyan";
import { AppStatusRepository } from "./types/AppStatus";

export class BatchSearvice {
  readonly appName: string;
  readonly appStatusRepo: AppStatusRepository;

  constructor(appName: string, appStatusRepo: AppStatusRepository) {
    this.appName = appName;
    this.appStatusRepo = appStatusRepo;
  }

  async run(logger: Logger, fn: (logger: Logger) => Promise<void>) {
    try {
      logger.info("batch start");
      this.appStatusRepo.upsertAppStatusRunning(this.appName, new Date());
      await fn(logger);
      this.appStatusRepo.upsertAppStatusStopped(this.appName, new Date());
    } catch (err) {
      this.appStatusRepo.upsertAppStatusError(this.appName, new Date());
      logger.error({ err }, "error occured");
    } finally {
      logger.info("batch end");
    }
  }
}
