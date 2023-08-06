import { SecretString } from "../../lib/output/Index";
export class Env {
  readonly loginUrl: string;
  readonly user: string;
  readonly password: SecretString;

  constructor(env: NodeJS.ProcessEnv) {
    this.loginUrl = this.getStringValue(env, "ELECTRICITY_LOGIN_URL");
    this.user = this.getStringValue(env, "ELECTRICITY_USER");
    this.password = new SecretString(
      this.getStringValue(env, "ELECTRICITY_PASSWORD")
    );
  }

  getStringValue(env: NodeJS.ProcessEnv, key: string): string {
    const value = env[key];
    if (value === undefined) {
      throw new Error(`environment[${key}] is not found`);
    }
    return value;
  }
}
