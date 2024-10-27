import Logger from "bunyan";
import { AppStatusRepository } from "./types/AppStatus";

export class BatchSearvice {
  constructor(
    private appName: string,
    private appStatusRepo: AppStatusRepository
  ) {}

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
