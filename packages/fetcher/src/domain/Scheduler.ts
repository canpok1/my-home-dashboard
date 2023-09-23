import { Logger } from "pino";

export interface Scheduler {
  schedule(logger: Logger, cron: string, f: () => Promise<void>): Promise<void>;
}
