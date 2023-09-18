import { chromium } from "playwright-core";
import "dotenv/config";
import { Env } from "./Env";
import { ElectricityFetcher } from "./ElectricityFetcher";
import { schedule } from "node-cron";
import { GasFetcher } from "./GasFetcher";
import { WaterFetcher } from "./WaterFetcher";
import { PrismaClient } from "@prisma/client";

const electricityEnv = new Env(process.env, "ELECTRICITY");
const gasEnv = new Env(process.env, "GAS");
const waterEnv = new Env(process.env, "WATER");

const fetchElectricity = async (prisma: PrismaClient) => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  try {
    const fetcher = new ElectricityFetcher(electricityEnv, "tmp");
    await fetcher.fetch(browser, prisma);
  } finally {
    await browser.close();
  }
};

const fetchGas = async (prisma: PrismaClient) => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  try {
    const fetcher = new GasFetcher(gasEnv, "tmp");
    await fetcher.fetch(browser, prisma);
  } finally {
    await browser.close();
  }
};

const fetchWater = async (prisma: PrismaClient) => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  try {
    const fetcher = new WaterFetcher(waterEnv, "tmp");
    await fetcher.fetch(browser, prisma);
  } finally {
    await browser.close();
  }
};

(async () => {
  console.log("[Electricity] env: %s", electricityEnv);
  console.log("[Gas] env: %s", gasEnv);
  console.log("[Water] env: %s", waterEnv);

  const prisma = new PrismaClient();

  // 電気料金
  if (electricityEnv.cron === "") {
    console.log("[Electricity] run at once");
    await fetchElectricity(prisma);
  } else {
    console.log("[Electricity] setup cron schedule [%s]", electricityEnv.cron);
    schedule(electricityEnv.cron, async () => {
      await fetchElectricity(prisma);
    });
  }

  // ガス料金
  if (gasEnv.cron === "") {
    console.log("[Gas] run at once");
    await fetchGas(prisma);
  } else {
    console.log("[Gas] setup cron schedule [%s]", gasEnv.cron);
    schedule(gasEnv.cron, async () => {
      await fetchGas(prisma);
    });
  }

  // 水道料金
  if (waterEnv.cron === "") {
    console.log("[Water] run at once");
    await fetchWater(prisma);
  } else {
    console.log("[Water] setup cron schedule [%s]", waterEnv.cron);
    schedule(waterEnv.cron, async () => {
      await fetchWater(prisma);
    });
  }
})();
