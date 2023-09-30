import Logger from "bunyan";

export interface Scheduler {
  schedule(logger: Logger, cron: string, f: () => Promise<void>): Promise<void>;
}
