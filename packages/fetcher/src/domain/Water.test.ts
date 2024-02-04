import { mock } from "jest-mock-extended";
import {
  MonthlyUsageModel,
  UsageFetcher,
  UsageRepository,
  UsageService,
} from "./Water";
import { Env } from "../Env";
import Logger from "bunyan";

function makeMonthlyUsage(): MonthlyUsageModel {
  return {
    year: 0,
    month: 0,
    begin: "yyyy-mm-dd",
    end: "yyyy-mm-dd",
    amount: 0,
    yen: 0,
  };
}

describe("UsageServiceクラス", () => {
  describe("run()", () => {
    it("fetcherで取得した情報をrepositoryに渡していること", async () => {
      const fetcher = mock<UsageFetcher>();
      const repository = mock<UsageRepository>();

      const monthlyUsages: MonthlyUsageModel[] = [makeMonthlyUsage()];
      fetcher.fetchMonthly.mockReturnValueOnce(Promise.resolve(monthlyUsages));

      // テスト
      const service = new UsageService(mock<Env>(), fetcher, repository);
      await service.run(mock<Logger>());

      // 検証
      expect(repository.saveWaterMonthlyUsages).toHaveBeenNthCalledWith(
        1,
        monthlyUsages,
        expect.any(Date)
      );
    });
  });
});
