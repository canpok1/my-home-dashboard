import { Page } from "@playwright/test";
import playwright from "playwright-core";
import Logger from "bunyan";

export async function withBrowser(
  timeoutMs: number,
  f: (browser: Browser) => Promise<void>
) {
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--single-process", "--disable-features=dbus", "--disable-gpu"],
  });

  try {
    await f(new Browser(timeoutMs, browser));
  } finally {
    await browser.close();
  }
}

export class Browser {
  constructor(
    readonly timeoutMs: number,
    readonly browser: playwright.Browser
  ) {}

  async newPage(logger: Logger): Promise<Page> {
    const page = await this.browser.newPage();

    page.on("requestfailed", (req) => {
      logger.debug(
        {
          error: req.failure()?.errorText,
          method: req.method(),
          url: req.url(),
        },
        "[browser]request failed"
      );
    });
    page.on("response", (res) => {
      const status = res.status();
      if (status >= 400) {
        logger.debug(
          { status: status, method: res.request().method(), url: res.url() },
          "[browser]response: %d error",
          status
        );
      }
    });
    page.on("console", (msg) =>
      logger.debug(`[browser]console: ${msg.text()}`)
    );
    await page.setDefaultTimeout(this.timeoutMs);

    return page;
  }
}
