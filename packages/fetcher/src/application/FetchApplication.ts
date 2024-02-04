import * as electricity from "../domain/Electricity";
import * as gas from "../domain/Gas";
import * as water from "../domain/Water";
import { ElectricityClient } from "../infra/ElectricityClient";
import { MySqlClient } from "../infra/MySqlClient";
import { Env } from "../Env";
import { PrismaClient } from "@prisma/client";
import { GasClient } from "../infra/GasClient";
import { WaterClient } from "../infra/WaterClient";
import Logger from "bunyan";

export interface Params {
  enableElectricity: boolean;
  enableGas: boolean;
  enableWater: boolean;
}

export class FetchApplication {
  readonly electricityEnv: Env;
  readonly gasEnv: Env;
  readonly waterEnv: Env;
  readonly prisma: PrismaClient;
  readonly params: Params;

  constructor(
    electricityEnv: Env,
    gasEnv: Env,
    waterEnv: Env,
    prisma: PrismaClient,
    params: Params
  ) {
    this.electricityEnv = electricityEnv;
    this.gasEnv = gasEnv;
    this.waterEnv = waterEnv;
    this.prisma = prisma;
    this.params = params;
  }

  async run(logger: Logger): Promise<void> {
    if (this.params.enableElectricity) {
      await this.runElectricity(logger);
    } else {
      logger.info("skip electricity");
    }

    if (this.params.enableGas) {
      await this.runGas(logger);
    } else {
      logger.info("skip gas");
    }

    if (this.params.enableWater) {
      await this.runWater(logger);
    } else {
      logger.info("skip water");
    }
  }

  private async runElectricity(parentLogger: Logger): Promise<void> {
    const service = new electricity.UsageService(
      this.electricityEnv,
      new ElectricityClient(this.electricityEnv),
      new MySqlClient(this.prisma)
    );

    const logger = parentLogger.child({ usage_type: "electricity" });

    await service.run(logger);
  }

  private async runGas(parentLogger: Logger): Promise<void> {
    const service = new gas.UsageService(
      this.gasEnv,
      new GasClient(this.gasEnv),
      new MySqlClient(this.prisma)
    );

    const logger = parentLogger.child({ usage_type: "gas" });

    await service.run(logger);
  }

  private async runWater(parentLogger: Logger): Promise<void> {
    const service = new water.UsageService(
      this.waterEnv,
      new WaterClient(this.waterEnv),
      new MySqlClient(this.prisma)
    );

    const logger = parentLogger.child({ usage_type: "water" });

    await service.run(logger);
  }
}
