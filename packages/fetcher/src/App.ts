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

const fetchElectricity = async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  const prisma = new PrismaClient();

  try {
    const fetcher = new ElectricityFetcher(electricityEnv, "tmp", prisma);
    await fetcher.fetch(browser);
  } finally {
    await prisma.$disconnect();
    await browser.close();
  }
};

const fetchGas = async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  const prisma = new PrismaClient();

  try {
    const fetcher = new GasFetcher(gasEnv, "tmp", prisma);
    await fetcher.fetch(browser);
  } finally {
    await prisma.$disconnect();
    await browser.close();
  }
};

const fetchWater = async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  const prisma = new PrismaClient();

  try {
    const fetcher = new WaterFetcher(waterEnv, "tmp", prisma);
    await fetcher.fetch(browser);
  } finally {
    await prisma.$disconnect();
    await browser.close();
  }
};

(async () => {
  console.log("[Electricity] env: %s", electricityEnv);
  console.log("[Gas] env: %s", gasEnv);
  console.log("[Water] env: %s", waterEnv);

  // 電気料金
  if (electricityEnv.cron === "") {
    console.log("[Electricity] run at once");
    await fetchElectricity();
  } else {
    console.log("[Electricity] setup cron schedule [%s]", electricityEnv.cron);
    schedule(electricityEnv.cron, async () => {
      await fetchElectricity();
    });
  }

  // ガス料金
  if (gasEnv.cron === "") {
    console.log("[Gas] run at once");
    await fetchGas();
  } else {
    console.log("[Gas] setup cron schedule [%s]", gasEnv.cron);
    schedule(gasEnv.cron, async () => {
      await fetchGas();
    });
  }

  // 水道料金
  if (waterEnv.cron === "") {
    console.log("[Water] run at once");
    await fetchWater();
  } else {
    console.log("[Water] setup cron schedule [%s]", waterEnv.cron);
    schedule(waterEnv.cron, async () => {
      await fetchWater();
    });
  }
})();
