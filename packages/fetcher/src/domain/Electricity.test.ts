import { mock } from "jest-mock-extended";
import {
  DailyUsageModel,
  FetcherFactory,
  FetchSettingRepository,
  FetchStatusRepository,
  MonthlyUsageModel,
  UsageFetcher,
  UsageRepository,
  UsageService,
} from "./Electricity";
import { Env } from "../Env";
import Logger from "bunyan";
import { SecretString } from "lib";

function makeMonthlyUsage(): MonthlyUsageModel {
  return {
    fetchSettingId: 0n,
    year: 0,
    month: 0,
    dayCount: 0,
    kwh: 0,
    yen: 0,
  };
}

function makeDailyUsage(): DailyUsageModel {
  return {
    fetchSettingId: 0n,
    year: 0,
    month: 0,
    date: 0,
    amount: 0,
  };
}

describe("UsageServiceクラス", () => {
  describe("run()", () => {
    it("fetcherで取得した情報をrepositoryに渡していること", async () => {
      const factory = mock<FetcherFactory>();
      const fetcher = mock<UsageFetcher>();
      factory.create.mockReturnValue(fetcher);

      const fetchSettingRepo = mock<FetchSettingRepository>();
      const usageRepo = mock<UsageRepository>();
      const fetchStatusRepo = mock<FetchStatusRepository>();

      const monthlyUsages: MonthlyUsageModel[] = [makeMonthlyUsage()];
      const dailyUsages: DailyUsageModel[] = [makeDailyUsage()];
      fetcher.fetchMonthly.mockReturnValueOnce(Promise.resolve(monthlyUsages));
      fetcher.fetchDaily.mockReturnValueOnce(Promise.resolve(dailyUsages));

      fetchSettingRepo.findAllElectricityFetchSettings.mockReturnValue(
        Promise.resolve([
          {
            id: 0n,
            siteId: 0n,
            userName: "dummy",
            password: new SecretString("dummy"),
          },
        ])
      );

      fetchStatusRepo.upsertElectricityFetchStatusSuccess.mockReturnValue(
        Promise.resolve()
      );

      const logger = mock<Logger>();
      logger.info.mockReturnValue();
      logger.child.mockReturnValue(logger);

      // テスト
      const service = new UsageService(
        mock<Env>(),
        fetchSettingRepo,
        factory,
        usageRepo,
        fetchStatusRepo
      );
      await service.run(logger);

      // 検証
      expect(usageRepo.saveElectricityMonthlyUsages).toHaveBeenNthCalledWith(
        1,
        monthlyUsages,
        expect.any(Date)
      );
      expect(usageRepo.saveElectricityDailyUsages).toHaveBeenNthCalledWith(
        1,
        dailyUsages,
        expect.any(Date)
      );
    });
  });
});
