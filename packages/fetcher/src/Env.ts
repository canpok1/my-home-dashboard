import { SecretString } from "../../lib/output/Index";

export class Env {
  readonly loginUrl: string;
  readonly user: string;
  readonly password: SecretString;
  readonly timeoutMs: number;
  readonly cron: string;

  constructor(env: NodeJS.ProcessEnv, prefix: string) {
    this.loginUrl = this.getStringValue(env, prefix + "_LOGIN_URL");
    this.user = this.getStringValue(env, prefix + "_USER");
    this.password = new SecretString(
      this.getStringValue(env, prefix + "_PASSWORD")
    );
    this.timeoutMs = this.getNumberValue(env, prefix + "_TIMEOUT_MS");
    this.cron = this.getStringValue(env, prefix + "_CRON_JST", false);
  }

  getStringValue(
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

  getNumberValue(env: NodeJS.ProcessEnv, key: string): number {
    return Number(this.getStringValue(env, key));
  }
}
