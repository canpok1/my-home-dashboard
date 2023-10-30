import { toLogLevel } from "./Logger";
import { LogLevel } from "bunyan";

export function getStringValue(
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

export function getNumberValue(env: NodeJS.ProcessEnv, key: string): number {
  return Number(getStringValue(env, key));
}

export function getLogLevel(env: NodeJS.ProcessEnv, key: string): LogLevel {
  const s = getStringValue(env, key);
  try {
    return toLogLevel(s);
  } catch (err) {
    throw new Error(`environment[${key}] is invalid value[${s}]`, {
      cause: err,
    });
  }
}
