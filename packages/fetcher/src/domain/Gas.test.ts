import { mock } from "jest-mock-extended";
import {
  MonthlyUsageModel,
  UsageFetcher,
  UsageRepository,
  UsageService,
} from "./Gas";
import { Scheduler } from "./Scheduler";
import { Env } from "../Env";
import Logger from "bunyan";

function makeMockScheduler(): Scheduler {
  return {
    async schedule(
      logger: Logger,
      cron: string,
      f: () => Promise<void>
    ): Promise<void> {
      await f();
    },
  };
}

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
      const service = new UsageService(
        mock<Env>(),
        fetcher,
        repository,
        makeMockScheduler()
      );
      await service.run(mock<Logger>());

      // 検証
      expect(repository.saveGasMonthlyUsages).toHaveBeenNthCalledWith(
        1,
        monthlyUsages,
        expect.any(Date)
      );
    });
  });
});
