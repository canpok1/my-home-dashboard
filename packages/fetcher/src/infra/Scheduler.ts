import Logger from "bunyan";
import * as cron from "node-cron";

export class Scheduler {
  async schedule(logger: Logger, cronValue: string, f: () => Promise<void>) {
    if (!cron.validate(cronValue)) {
      logger.info("cron schedule[%s] is invalid, run at once", cronValue);
      try {
        await f();
      } catch (err) {
        logger.error(err);
      }
    } else {
      logger.info("setup cron schedule [%s]", cronValue);
      cron.schedule(
        cronValue,
        async () => {
          try {
            await f();
          } catch (err) {
            logger.error(err);
          }
        },
        {
          timezone: "Asia/Tokyo",
        }
      );
    }
  }
}
