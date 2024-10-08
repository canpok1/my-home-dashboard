import { LogLevel } from "bunyan";
import { SecretString } from "lib";
import { toLogLevel } from "./Logger";

export class CommonEnv {
  readonly appName: string;
  readonly logLevel: LogLevel;
  readonly slackLogLevel: LogLevel;
  readonly slackWebhookUrl: string;
  readonly dbUrlForPrisma: string;
  readonly encryptionPassword: SecretString;

  constructor(env: NodeJS.ProcessEnv) {
    this.appName = getStringValue(env, "APP_NAME");
    this.logLevel = getLogLevel(env, "LOG_LEVEL");
    this.slackLogLevel = getLogLevel(env, "SLACK_LOG_LEVEL");
    this.slackWebhookUrl = getStringValue(env, "SLACK_WEBHOOK_URL");
    this.dbUrlForPrisma = getStringValue(env, "DB_URL_FOR_PRISMA");
    this.encryptionPassword = new SecretString(
      getStringValue(env, "ENCRYPTION_PASSWORD")
    );
  }
}

export class Env {
  readonly loginUrl: string;
  readonly timeoutMs: number;
  readonly screenshotDir: string;

  constructor(env: NodeJS.ProcessEnv, prefix: string) {
    this.loginUrl = getStringValue(env, prefix + "_LOGIN_URL");
    this.timeoutMs = getNumberValue(env, prefix + "_TIMEOUT_MS");
    this.screenshotDir = getStringValue(env, prefix + "_SCREENSHOT_DIR");
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
