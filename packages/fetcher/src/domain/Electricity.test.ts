import { mock } from "jest-mock-extended";
import {
  DailyUsageModel,
  MonthlyUsageModel,
  UsageFetcher,
  UsageRepository,
  UsageService,
} from "./Electricity";
import { Scheduler } from "./Scheduler";
import { Env } from "../Env";
import Logger from "bunyan";

describe("UsageServiceクラス", () => {
  it("run()", async () => {
    const env = mock<Env>();
    const fetcher = mock<UsageFetcher>();
    const repository = mock<UsageRepository>();
    const scheduler = mock<Scheduler>();
    const logger = mock<Logger>();

    // テスト
    const service = new UsageService(env, fetcher, repository, scheduler);
    await service.run(logger);

    // 検証
    expect(scheduler.schedule).toHaveBeenCalledTimes(1);
  });

  it("fetchAndSave()", async () => {
    const env = mock<Env>();
    const fetcher = mock<UsageFetcher>();
    const repository = mock<UsageRepository>();
    const scheduler = mock<Scheduler>();
    const logger = mock<Logger>();
    const now = new Date();

    const monthlyUsages: MonthlyUsageModel[] = [
      {
        year: 0,
        month: 0,
        dayCount: 0,
        kwh: 0,
        yen: 0,
      },
    ];
    const dailyUsages: DailyUsageModel[] = [
      {
        year: 0,
        month: 0,
        date: 0,
        amount: 0,
      },
    ];

    fetcher.fetchMonthly.mockReturnValueOnce(Promise.resolve(monthlyUsages));
    fetcher.fetchDaily.mockReturnValueOnce(Promise.resolve(dailyUsages));

    // テスト
    const service = new UsageService(env, fetcher, repository, scheduler);
    await service.fetchAndSave(logger, now);

    // 検証
    expect(repository.saveElectricityMonthlyUsages).toHaveBeenNthCalledWith(
      1,
      monthlyUsages,
      now
    );
    expect(repository.saveElectricityDailyUsages).toHaveBeenNthCalledWith(
      1,
      dailyUsages,
      now
    );
  });
});
