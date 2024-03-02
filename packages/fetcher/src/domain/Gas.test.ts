import { mock } from "jest-mock-extended";
import {
  FetchSettingRepository,
  FetchStatusRepository,
  MonthlyUsageModel,
  UsageFetcher,
  UsageRepository,
  UsageService,
} from "./Gas";
import { Env } from "../Env";
import Logger from "bunyan";
import { SecretString } from "lib/src/Secret";

function makeMonthlyUsage(): MonthlyUsageModel {
  return {
    fetchSettingId: 0n,
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
      const fetchSettingRepo = mock<FetchSettingRepository>();
      const usageRepo = mock<UsageRepository>();
      const fetchStatusRepo = mock<FetchStatusRepository>();

      const monthlyUsages: MonthlyUsageModel[] = [makeMonthlyUsage()];
      fetcher.fetchMonthly.mockReturnValueOnce(Promise.resolve(monthlyUsages));

      fetchSettingRepo.findAllGasFetchSettings.mockReturnValue(
        Promise.resolve([
          {
            id: 0n,
            siteId: 0n,
            userName: "dummy",
            password: new SecretString("dummy"),
          },
        ])
      );

      fetchStatusRepo.upsertGasFetchStatusSuccess.mockReturnValueOnce(
        Promise.resolve()
      );

      const logger = mock<Logger>();
      logger.info.mockReturnValue();
      logger.child.mockReturnValue(logger);

      // テスト
      const service = new UsageService(
        mock<Env>(),
        fetcher,
        fetchSettingRepo,
        usageRepo,
        fetchStatusRepo
      );
      await service.run(logger);

      // 検証
      expect(usageRepo.saveGasMonthlyUsages).toHaveBeenNthCalledWith(
        1,
        monthlyUsages,
        expect.any(Date)
      );
    });
  });
});
