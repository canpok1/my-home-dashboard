import { FetcherFactory, UsageFetcher } from "../domain/Electricity";
import { CommonEnv, Env } from "../Env";
import { KireiLifePlusClient } from "./electricity/KireiLifePlusClient";

export class ElectricityFactory implements FetcherFactory {
  constructor(
    readonly commonEnv: CommonEnv,
    readonly env: Env
  ) {}

  create(siteId: bigint): UsageFetcher {
    switch (siteId) {
      case 1n:
        return new KireiLifePlusClient(
          this.commonEnv,
          "https://www.kireilife.net/pages/",
          this.env.screenshotDir,
          this.env.timeoutMs
        );
      default:
        throw new Error(`unsupported siteId[${siteId}]`);
    }
  }
}
