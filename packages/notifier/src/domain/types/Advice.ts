import { SecretString } from "lib";
import { DailyUsage } from "./Electricity";

export type Advice = string;

export interface AdviceRepository {
  generateElectricityAdvice(
    apikey: SecretString,
    year: number,
    month: number,
    yen: number,
    dailyUsages: DailyUsage[]
  ): Promise<Advice>;
}
