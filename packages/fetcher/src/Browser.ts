import { Page } from "@playwright/test";
import playwright from "playwright-core";
import { AppContext, RunContext } from "./Context";

export class Browser {
  readonly appCtx: AppContext;
  readonly browser: playwright.Browser;

  constructor(appCtx: AppContext, browser: playwright.Browser) {
    this.appCtx = appCtx;
    this.browser = browser;
  }

  async newPage(ctx: RunContext): Promise<Page> {
    const page = await this.browser.newPage();

    const browserLogger = ctx.logger.child({}, { msgPrefix: "[browser]" });
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
    await page.setDefaultTimeout(this.appCtx.env.timeoutMs);

    return page;
  }
}
