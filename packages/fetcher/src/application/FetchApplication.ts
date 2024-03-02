import * as electricity from "../domain/Electricity";
import * as gas from "../domain/Gas";
import * as water from "../domain/Water";
import { ElectricityClient } from "../infra/ElectricityClient";
import { MySqlClient } from "../infra/MySqlClient";
import { CommonEnv, Env } from "../Env";
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
  readonly commonEnv: CommonEnv;
  readonly electricityEnv: Env;
  readonly gasEnv: Env;
  readonly waterEnv: Env;
  readonly params: Params;
  readonly mysqlClient: MySqlClient;

  constructor(
    commonEnv: CommonEnv,
    electricityEnv: Env,
    gasEnv: Env,
    waterEnv: Env,
    prisma: PrismaClient,
    params: Params
  ) {
    this.commonEnv = commonEnv;
    this.electricityEnv = electricityEnv;
    this.gasEnv = gasEnv;
    this.waterEnv = waterEnv;
    this.params = params;

    this.mysqlClient = new MySqlClient(
      prisma,
      this.commonEnv.encryptionPassword
    );
  }

  async run(logger: Logger): Promise<void> {
    try {
      await this.mysqlClient.upsertRunning(this.commonEnv.appName, new Date());

      let success = true;
      if (this.params.enableElectricity) {
        const result = await this.runElectricity(logger);
        if (!result) {
          success = false;
        }
      } else {
        logger.info("skip electricity");
      }

      if (this.params.enableGas) {
        const result = await this.runGas(logger);
        if (!result) {
          success = false;
        }
      } else {
        logger.info("skip gas");
      }

      if (this.params.enableWater) {
        const result = await this.runWater(logger);
        if (!result) {
          success = false;
        }
      } else {
        logger.info("skip water");
      }

      if (success) {
        await this.mysqlClient.upsertStopped(
          this.commonEnv.appName,
          new Date()
        );
      } else {
        await this.mysqlClient.upsertError(this.commonEnv.appName, new Date());
      }
    } catch (err) {
      await this.mysqlClient.upsertError(this.commonEnv.appName, new Date());
      throw err;
    }
  }

  private async runElectricity(parentLogger: Logger): Promise<boolean> {
    const service = new electricity.UsageService(
      this.electricityEnv,
      new ElectricityClient(this.commonEnv, this.electricityEnv),
      this.mysqlClient,
      this.mysqlClient,
      this.mysqlClient
    );

    const logger = parentLogger.child({ usage_type: "electricity" });

    const result = await service.run(logger);
    return result.failureCount === 0;
  }

  private async runGas(parentLogger: Logger): Promise<boolean> {
    const service = new gas.UsageService(
      this.gasEnv,
      new GasClient(this.commonEnv, this.gasEnv),
      this.mysqlClient,
      this.mysqlClient,
      this.mysqlClient
    );

    const logger = parentLogger.child({ usage_type: "gas" });

    const result = await service.run(logger);
    return result.failureCount === 0;
  }

  private async runWater(parentLogger: Logger): Promise<boolean> {
    const service = new water.UsageService(
      this.waterEnv,
      new WaterClient(this.commonEnv, this.waterEnv),
      this.mysqlClient,
      this.mysqlClient,
      this.mysqlClient
    );

    const logger = parentLogger.child({ usage_type: "water" });

    const result = await service.run(logger);
    return result.failureCount === 0;
  }
}
