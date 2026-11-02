import {
  VisualRegressionTracker,
  BuildResponse,
  Config,
} from "@visual-regression-tracker/sdk-js";
import { Page, ElementHandle, Locator } from "@playwright/test";
import {
  PageTrackOptions,
  ElementHandleTrackOptions,
} from "./playwright.interfaces";

export class PlaywrightVisualRegressionTracker {
  private vrt: VisualRegressionTracker;
  private browser: string;

  constructor(browserName: string, config?: Config) {
    // sdk-js skips VRT_* variables when given an explicit config
    this.vrt = new VisualRegressionTracker(
      config && {
        ...config,
        sourceBranch:
          config.sourceBranch ||
          config.baselineBranchName ||
          process.env.VRT_SOURCEBRANCH,
      }
    );
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
    options?: PageTrackOptions,
    retryCount = 2
  ) {
    const viewportSize = page.viewportSize();
    return this.vrt.track(
      {
        name,
        imageBuffer: await page.screenshot(options?.screenshotOptions),
        browser: this.browser,
        viewport: viewportSize
          ? `${viewportSize.width}x${viewportSize.height}`
          : undefined,
        os: options?.agent?.os,
        device: options?.agent?.device,
        customTags: options?.customTags,
        diffTollerancePercent: options?.diffTollerancePercent,
        ignoreAreas: options?.ignoreAreas,
        comment: options?.comment,
      },
      retryCount
    );
  }

  async trackElementHandle(
    elementHandle: ElementHandle | Locator | null,
    name: string,
    options?: ElementHandleTrackOptions,
    retryCount = 2
  ) {
    if (!elementHandle) {
      throw new Error("ElementHandle is null");
    }
    return this.vrt.track(
      {
        name,
        imageBuffer: await elementHandle.screenshot(options?.screenshotOptions),
        browser: this.browser,
        viewport: options?.agent?.viewport,
        os: options?.agent?.os,
        device: options?.agent?.device,
        customTags: options?.customTags,
        diffTollerancePercent: options?.diffTollerancePercent,
        ignoreAreas: options?.ignoreAreas,
        comment: options?.comment,
      },
      retryCount
    );
  }
}
