import { Logger } from "pino";
import * as electricity from "../domain/Electricity";
import * as gas from "../domain/Gas";
import * as water from "../domain/Water";
import { ElectricityClient } from "../infra/ElectricityClient";
import { MySqlClient } from "../infra/MySqlClient";
import { Env } from "../Env";
import { PrismaClient } from "@prisma/client";
import { Scheduler } from "../infra/Scheduler";
import { GasClient } from "../infra/GasClient";
import { WaterClient } from "../infra/WaterClient";

export class FetchApplication {
  readonly electricityEnv: Env;
  readonly gasEnv: Env;
  readonly waterEnv: Env;
  readonly prisma: PrismaClient;

  constructor(
    electricityEnv: Env,
    gasEnv: Env,
    waterEnv: Env,
    prisma: PrismaClient
  ) {
    this.electricityEnv = electricityEnv;
    this.gasEnv = gasEnv;
    this.waterEnv = waterEnv;
    this.prisma = prisma;
  }

  async run(logger: Logger): Promise<void> {
    await this.runElectricity(logger);
    await this.runGas(logger);
    await this.runWater(logger);
  }

  private async runElectricity(parentLogger: Logger): Promise<void> {
    const service = new electricity.UsageService(
      this.electricityEnv,
      new ElectricityClient(this.electricityEnv),
      new MySqlClient(this.prisma),
      new Scheduler()
    );

    const logger = parentLogger.child({}, { msgPrefix: "[electricity]" });
    logger.level = this.electricityEnv.logLevel;

    await service.run(logger);
  }

  private async runGas(parentLogger: Logger): Promise<void> {
    const service = new gas.UsageService(
      this.gasEnv,
      new GasClient(this.gasEnv),
      new MySqlClient(this.prisma),
      new Scheduler()
    );
    const logger = parentLogger.child({}, { msgPrefix: "[gas]" });
    logger.level = this.gasEnv.logLevel;
    await service.run(logger);
  }

  private async runWater(parentLogger: Logger): Promise<void> {
    const service = new water.UsageService(
      this.waterEnv,
      new WaterClient(this.waterEnv),
      new MySqlClient(this.prisma),
      new Scheduler()
    );
    const logger = parentLogger.child({}, { msgPrefix: "[water]" });
    logger.level = this.waterEnv.logLevel;
    await service.run(logger);
  }
}
