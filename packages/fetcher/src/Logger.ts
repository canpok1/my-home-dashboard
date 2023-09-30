import { LogLevelString, levelFromName } from "bunyan";

const LogLevelStrings = ["trace", "debug", "info", "warn", "error", "fatal"];

export function isLogLevelString(s: string): s is LogLevelString {
  return LogLevelStrings.some((v) => v === s);
}

export function toLogLevel(s: string): number {
  if (isLogLevelString(s)) {
    return levelFromName[s];
  }
  throw new Error(`cannot convert to log level, string[${s}] is not supported`);
}
