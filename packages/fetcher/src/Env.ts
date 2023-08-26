import { SecretString } from "../../lib/output/Index";
export class Env {
  readonly loginUrl: string;
  readonly user: string;
  readonly password: SecretString;
  readonly timeoutMs: number;
  readonly cron: string;

  constructor(env: NodeJS.ProcessEnv) {
    this.loginUrl = this.getStringValue(env, "ELECTRICITY_LOGIN_URL");
    this.user = this.getStringValue(env, "ELECTRICITY_USER");
    this.password = new SecretString(
      this.getStringValue(env, "ELECTRICITY_PASSWORD")
    );
    this.timeoutMs = this.getNumberValue(env, "ELECTRICITY_TIMEOUT_MS");
    this.cron = this.getStringValue(env, "ELECTRICITY_CRON", false);
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
