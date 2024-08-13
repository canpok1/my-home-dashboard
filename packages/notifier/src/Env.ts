import { LogLevel } from "bunyan";
import { getLogLevel, getStringValue, LoggerOption } from "lib";

export class Env implements LoggerOption {
  readonly appName: string;
  readonly logLevel: LogLevel;
  readonly slackLogLevel: LogLevel;
  readonly slackWebhookUrl: string;
  readonly dbUrlForPrisma: string;

  constructor(env: NodeJS.ProcessEnv) {
    this.appName = getStringValue(env, "APP_NAME");
    this.logLevel = getLogLevel(env, "LOG_LEVEL");
    this.slackLogLevel = getLogLevel(env, "SLACK_LOG_LEVEL");
    this.slackWebhookUrl = getStringValue(env, "SLACK_WEBHOOK_URL");
    this.dbUrlForPrisma = getStringValue(env, "DB_URL_FOR_PRISMA");
  }
}
