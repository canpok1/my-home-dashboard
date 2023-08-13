import { SecretString } from "../../lib/output/Index";
export class Env {
  readonly loginUrl: string;
  readonly user: string;
  readonly password: SecretString;
  readonly navigationTimeoutMs: number;

  constructor(env: NodeJS.ProcessEnv) {
    this.loginUrl = this.getStringValue(env, "ELECTRICITY_LOGIN_URL");
    this.user = this.getStringValue(env, "ELECTRICITY_USER");
    this.password = new SecretString(
      this.getStringValue(env, "ELECTRICITY_PASSWORD")
    );
    this.navigationTimeoutMs = this.getNumberValue(
      env,
      "ELECTRICITY_NAVIGATION_TIMEOUT_MS"
    );
  }

  getStringValue(env: NodeJS.ProcessEnv, key: string): string {
    const value = env[key];
    if (value === undefined) {
      throw new Error(`environment[${key}] is not found`);
    }
    return value;
  }

  getNumberValue(env: NodeJS.ProcessEnv, key: string): number {
    return Number(this.getStringValue(env, key));
  }
}
