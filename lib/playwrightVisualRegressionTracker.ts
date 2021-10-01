import {
  VisualRegressionTracker,
  BuildResponse,
  Config,
} from "@visual-regression-tracker/sdk-js";
import { Page, ElementHandle } from "playwright";
import {
  PageTrackOptions,
  ElementHandleTrackOptions,
} from "./playwright.interfaces";

export class PlaywrightVisualRegressionTracker {
  private vrt: VisualRegressionTracker;
  private browser: string;

  constructor(browserName: string, config?: Config) {
    this.vrt = new VisualRegressionTracker(config);
    this.browser = browserName;
  }

  async start(): Promise<BuildResponse> {
    return this.vrt.start();
  }

  async stop() {
    return this.vrt.stop();
  }

  async trackPage(
    page: Pick<Page, "viewportSize" | "screenshot">,
    name: string,
    options?: PageTrackOptions
  ) {
    const viewportSize = page.viewportSize();
    return this.vrt.track({
      name,
      imageBase64: (await page.screenshot(options?.screenshotOptions)).toString(
        "base64"
      ),
      browser: this.browser,
      viewport: viewportSize
        ? `${viewportSize.width}x${viewportSize.height}`
        : undefined,
      os: options?.agent?.os,
      device: options?.agent?.device,
      diffTollerancePercent: options?.diffTollerancePercent,
      ignoreAreas: options?.ignoreAreas,
    });
  }

  async trackElementHandle(
    elementHandle: ElementHandle | null,
    name: string,
    options?: ElementHandleTrackOptions
  ) {
    if (!elementHandle) {
      throw new Error("ElementHandle is null");
    }
    return this.vrt.track({
      name,
      imageBase64: (
        await elementHandle.screenshot(options?.screenshotOptions)
      ).toString("base64"),
      browser: this.browser,
      viewport: options?.agent?.viewport,
      os: options?.agent?.os,
      device: options?.agent?.device,
      diffTollerancePercent: options?.diffTollerancePercent,
      ignoreAreas: options?.ignoreAreas,
    });
  }
}
