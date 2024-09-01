import { SecretString } from "lib";
import type { Advice, AdviceRepository } from "../domain/types/Advice";
import type { DailyUsage } from "../domain/types/Electricity";
import axios from "axios";

export class DifyClient implements AdviceRepository {
  readonly userName: string;

  constructor(userName: string) {
    this.userName = userName;
  }

  async generateElectricityAdvice(
    apikey: SecretString,
    year: number,
    month: number,
    yen: number,
    dailyUsages: DailyUsage[]
  ): Promise<Advice> {
    const dailyKwh = dailyUsages
      .map((usage) => `${usage.date}日:${usage.kwh}`)
      .join(",");
    const reqBody = {
      inputs: {
        year,
        month,
        yen,
        daily_kwh: dailyKwh,
      },
      response_mode: "blocking",
      user: this.userName,
    };
    const reqHeaders = {
      Authorization: `Bearer ${apikey.value()}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://api.dify.ai/v1/completion-messages",
      reqBody,
      {
        headers: reqHeaders,
      }
    );
    return response.data.answer;
  }
}
