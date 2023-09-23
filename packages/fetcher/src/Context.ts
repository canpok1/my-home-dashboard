import { PrismaClient } from "@prisma/client";
import { Logger } from "pino";
import { Env } from "./Env";

/**
 * アプリケーション単位で不変な値
 */
export interface AppContext {
  prisma: PrismaClient;
  env: Env;
}

/**
 * 実行で不変な値
 */
export interface RunContext {
  logger: Logger;
}
