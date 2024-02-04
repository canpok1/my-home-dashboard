import { mock } from "jest-mock-extended";
import {
  DailyUsageModel,
  MonthlyUsageModel,
  UsageFetcher,
  UsageRepository,
  UsageService,
} from "./Electricity";
import { Env } from "../Env";
import Logger from "bunyan";

function makeMonthlyUsage(): MonthlyUsageModel {
  return {
    year: 0,
    month: 0,
    dayCount: 0,
    kwh: 0,
    yen: 0,
  };
}

function makeDailyUsage(): DailyUsageModel {
  return {
    year: 0,
    month: 0,
    date: 0,
    amount: 0,
  };
}

describe("UsageServiceクラス", () => {
  describe("run()", () => {
    it("fetcherで取得した情報をrepositoryに渡していること", async () => {
      const fetcher = mock<UsageFetcher>();
      const repository = mock<UsageRepository>();

      const monthlyUsages: MonthlyUsageModel[] = [makeMonthlyUsage()];
      const dailyUsages: DailyUsageModel[] = [makeDailyUsage()];
      fetcher.fetchMonthly.mockReturnValueOnce(Promise.resolve(monthlyUsages));
      fetcher.fetchDaily.mockReturnValueOnce(Promise.resolve(dailyUsages));

      // テスト
      const service = new UsageService(mock<Env>(), fetcher, repository);
      await service.run(mock<Logger>());

      // 検証
      expect(repository.saveElectricityMonthlyUsages).toHaveBeenNthCalledWith(
        1,
        monthlyUsages,
        expect.any(Date)
      );
      expect(repository.saveElectricityDailyUsages).toHaveBeenNthCalledWith(
        1,
        dailyUsages,
        expect.any(Date)
      );
    });
  });
});
