import { Page } from "@playwright/test";
import playwright from "playwright-core";
import { Env } from "../Env";
import { Logger } from "pino";

export async function withBrowser(
  env: Env,
  f: (browser: Browser) => Promise<void>
) {
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  try {
    await f(new Browser(env, browser));
  } finally {
    await browser.close();
  }
}

export class Browser {
  readonly env: Env;
  readonly browser: playwright.Browser;

  constructor(env: Env, browser: playwright.Browser) {
    this.env = env;
    this.browser = browser;
  }

  async newPage(logger: Logger): Promise<Page> {
    const page = await this.browser.newPage();

    const browserLogger = logger.child({}, { msgPrefix: "[browser]" });
    page.on("requestfailed", (req) => {
      browserLogger.debug(
        {
          error: req.failure()?.errorText,
          method: req.method(),
          url: req.url(),
        },
        "request failed"
      );
    });
    page.on("response", (res) => {
      const status = res.status();
      if (status >= 400) {
        browserLogger.debug(
          { status: status, method: res.request().method(), url: res.url() },
          "%d error",
          status
        );
      }
    });
    page.on("console", (msg) => browserLogger.debug(msg.text()));
    await page.setDefaultTimeout(this.env.timeoutMs);

    return page;
  }
}
