import {
  VisualRegressionTracker,
  Config,
} from "@visual-regression-tracker/sdk-js";
import { Page, Browser, BrowserType } from "playwright";
import { TrackOptions } from "./playwright.interfaces";

export class PlaywrightVisualRegressionTracker {
  private vrt: VisualRegressionTracker;
  private browser: BrowserType<Browser>;

  constructor(config: Config, browser: BrowserType<Browser>) {
    this.vrt = new VisualRegressionTracker(config);
    this.browser = browser;
  }

  async start() {
    return this.vrt.start();
  }

  async stop() {
    return this.vrt.stop();
  }

  async track(page: Page, name: string, options?: TrackOptions) {
    const viewportSize = page.viewportSize();
    return this.vrt.track({
      name,
      imageBase64: (await page.screenshot(options?.screenshotOptions)).toString(
        "base64"
      ),
      browser: this.browser.name(),
      viewport: viewportSize
        ? `${viewportSize.width}x${viewportSize.height}`
        : undefined,
      os: options?.agent?.os,
      device: options?.agent?.device,
      diffTollerancePercent: options?.diffTollerancePercent,
    });
  }
}
