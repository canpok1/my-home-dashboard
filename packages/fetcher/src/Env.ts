import { LogLevel } from "bunyan";
import { SecretString } from "../../lib/output/Index";
import { toLogLevel } from "./Logger";

export class CommonEnv {
  readonly logLevel: string;
  readonly slackLogLevel: LogLevel;
  readonly slackWebhookUrl: string;
  readonly slackChannel: string;
  readonly slackUser: string;
  readonly slackIconEmoji: string;
  readonly dbUrlForPrisma: string;

  constructor(env: NodeJS.ProcessEnv) {
    this.logLevel = getStringValue(env, "LOG_LEVEL");
    this.slackLogLevel = getLogLevel(env, "SLACK_LOG_LEVEL");
    this.slackWebhookUrl = getStringValue(env, "SLACK_WEBHOOK_URL");
    this.slackChannel = getStringValue(env, "SLACK_CHANNEL");
    this.slackUser = getStringValue(env, "SLACK_USER");
    this.slackIconEmoji = getStringValue(env, "SLACK_ICON_EMOJI");
    this.dbUrlForPrisma = getStringValue(env, "DB_URL_FOR_PRISMA");
  }
}

export class Env {
  readonly loginUrl: string;
  readonly user: string;
  readonly password: SecretString;
  readonly timeoutMs: number;
  readonly cron: string;
  readonly screenshotDir: string;
  readonly logLevel: LogLevel;

  constructor(env: NodeJS.ProcessEnv, prefix: string) {
    this.loginUrl = getStringValue(env, prefix + "_LOGIN_URL");
    this.user = getStringValue(env, prefix + "_USER");
    this.password = new SecretString(getStringValue(env, prefix + "_PASSWORD"));
    this.timeoutMs = getNumberValue(env, prefix + "_TIMEOUT_MS");
    this.cron = getStringValue(env, prefix + "_CRON_JST", false);
    this.screenshotDir = getStringValue(env, prefix + "_SCREENSHOT_DIR");
    this.logLevel = getLogLevel(env, prefix + "_LOG_LEVEL");
  }
}

function getStringValue(
  env: NodeJS.ProcessEnv,
  key: string,
  required: boolean = true
): string {
  const value = env[key];
  if (value === undefined) {
    if (required) {
      throw new Error(`environment[${key}] is not found`);
    }
    return "";
  }
  return value;
}

function getNumberValue(env: NodeJS.ProcessEnv, key: string): number {
  return Number(getStringValue(env, key));
}

function getLogLevel(env: NodeJS.ProcessEnv, key: string): LogLevel {
  const s = getStringValue(env, key);
  try {
    return toLogLevel(s);
  } catch (err) {
    throw new Error(`environment[${key}] is invalid value[${s}]`, {
      cause: err,
    });
  }
}
