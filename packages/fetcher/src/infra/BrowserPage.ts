import playwright from "playwright-core";
import path from "path";

export class BrowserPage {
  readonly instance: playwright.Page;
  readonly screenshotDir: string;
  readonly screenshotSubDir: string;
  readonly screenshotPrefix: string;

  private screenshotNo = 0;

  constructor(
    page: playwright.Page,
    screenshotDir: string,
    screenshotSubDir: string,
    screenshotPrefix: string
  ) {
    this.instance = page;
    this.screenshotDir = screenshotDir;
    this.screenshotSubDir = screenshotSubDir;
    this.screenshotPrefix = screenshotPrefix;
  }

  async screenshot(name: string, subdir: string = ""): Promise<void> {
    const padded = String(this.screenshotNo + 1).padStart(2, "0"); // 0埋め
    const fileName = `${this.screenshotPrefix}${padded}-${name}`;
    const filePath = path.join(
      this.screenshotDir,
      this.screenshotSubDir,
      subdir,
      fileName
    );
    await this.instance.screenshot({
      path: filePath,
      fullPage: true,
    });
    this.screenshotNo++;
  }

  async screenshotForError(subdir: string = ""): Promise<void> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const fileName = `error-${year}${month}${day}-${hours}${minutes}${seconds}.png`;

    await this.screenshot(fileName, subdir);
  }
}
