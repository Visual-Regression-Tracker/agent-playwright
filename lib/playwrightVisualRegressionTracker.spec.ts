import {
  Config,
  VisualRegressionTracker,
} from "@visual-regression-tracker/sdk-js";
import { Browser, BrowserContext, ElementHandle, Page, chromium } from "@playwright/test";
import {
  PlaywrightVisualRegressionTracker,
  PageTrackOptions,
  ElementHandleTrackOptions,
} from "./index";
import type { Mocked } from "vitest";

vi.mock("@visual-regression-tracker/sdk-js");

let browserName = chromium.name();
let browserType = chromium;
let browser: Browser;
let context: BrowserContext;
let page: Page;
let playwrightVrt: PlaywrightVisualRegressionTracker;

const config: Config = {
  apiUrl: "http://localhost:4200",
  branchName: "develop",
  project: "Default project",
  apiKey: "BAZ0EG0PRH4CRQPH19ZKAVADBP9E",
  enableSoftAssert: false,
};

beforeAll(async () => {
  browser = await browserType.launch();
  context = await browser.newContext({
    viewport: {
      width: 1800,
      height: 1600,
    },
  });
  page = await context.newPage();
});

afterAll(async () => {
  await browser.close();
});

describe("playwright", () => {
  beforeEach(() => {
    playwrightVrt = new PlaywrightVisualRegressionTracker(browserName, config);
  });

  it("constructor", async () => {
    expect(playwrightVrt["browser"]).toBe(browserName);
    expect(VisualRegressionTracker).toHaveBeenCalledWith(config);
  });

  describe("sourceBranch", () => {
    const INIT_ENV = process.env;

    beforeEach(() => {
      process.env = { ...INIT_ENV, VRT_SOURCEBRANCH: "release" };
    });

    afterEach(() => {
      process.env = INIT_ENV;
    });

    it.each([
      ["add VRT_SOURCEBRANCH to an explicit config", undefined, "release"],
      ["prefer sourceBranch from the explicit config", "fromConfig", "fromConfig"],
    ])("constructor should %s", (_, sourceBranch, expected) => {
      new PlaywrightVisualRegressionTracker(browserName, { ...config, sourceBranch });

      expect(VisualRegressionTracker).toHaveBeenLastCalledWith({
        ...config,
        sourceBranch: expected,
      });
    });

    it("constructor should prefer deprecated baselineBranchName from the explicit config", () => {
      new PlaywrightVisualRegressionTracker(browserName, {
        ...config,
        baselineBranchName: "fromConfig",
      });

      expect(VisualRegressionTracker).toHaveBeenLastCalledWith({
        ...config,
        baselineBranchName: "fromConfig",
        sourceBranch: "fromConfig",
      });
    });

    it("constructor without config should leave env to sdk-js", () => {
      new PlaywrightVisualRegressionTracker(browserName);

      expect(VisualRegressionTracker).toHaveBeenLastCalledWith(undefined);
    });
  });

  it("start", async () => {
    await playwrightVrt.start();

    expect(VisualRegressionTracker.prototype.start).toHaveBeenCalled();
  });

  it("stop", async () => {
    await playwrightVrt.stop();

    expect(VisualRegressionTracker.prototype.stop).toHaveBeenCalled();
  });

  describe("track", () => {
    let pageMocked: Mocked<Page>;
    const screenshot: Buffer = Buffer.from("image mocked");

    beforeEach(() => {
      playwrightVrt["vrt"]["isStarted"] = vi.fn().mockReturnValueOnce(true);
      pageMocked = vi.mocked(page);
      pageMocked.screenshot = vi.fn().mockResolvedValueOnce(screenshot) as any;
    });

    describe("trackPage", () => {
      it("track all fields", async () => {
        const imageName = "test name";
        const trackOptions: PageTrackOptions = {
          comment: "Test comment",
          diffTollerancePercent: 12.31,
          customTags: "smoke,dark",
          ignoreAreas: [
            {
              x: 1,
              y: 2,
              width: 300,
              height: 400,
            },
          ],
          agent: {
            os: "OS",
            device: "device ",
          },
          screenshotOptions: {
            fullPage: true,
            clip: {
              x: 1,
              y: 2,
              width: 3,
              height: 4,
            },
            omitBackground: true,
          },
        };

        await playwrightVrt.trackPage(page, imageName, trackOptions);

        expect(pageMocked.screenshot).toHaveBeenCalledWith(
          trackOptions.screenshotOptions
        );
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith(
          {
            name: imageName,
            imageBuffer: screenshot,
            browser: browserName,
            viewport: `1800x1600`,
            os: trackOptions.agent?.os,
            device: trackOptions.agent?.device,
            customTags: trackOptions.customTags,
            diffTollerancePercent: trackOptions.diffTollerancePercent,
            ignoreAreas: trackOptions.ignoreAreas,
            comment: trackOptions.comment,
          },
          2
        );
      });

      it("track default fields", async () => {
        const imageName = "test name";
        pageMocked.viewportSize = vi.fn().mockReturnValueOnce(null) as any;

        await playwrightVrt.trackPage(page, imageName);

        expect(pageMocked.screenshot).toHaveBeenCalledWith(undefined);
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith(
          {
            name: imageName,
            imageBuffer: screenshot,
            browser: browserName,
            viewport: undefined,
            os: undefined,
            device: undefined,
            customTags: undefined,
            diffTollerancePercent: undefined,
            comment: undefined,
          },
          2
        );
      });
    });

    describe("trackElementHandle", () => {
      it("track all fields", async () => {
        const imageName = "test name";
        const trackOptions: ElementHandleTrackOptions = {
          diffTollerancePercent: 12.31,
          customTags: "smoke,dark",
          ignoreAreas: [
            {
              x: 1,
              y: 2,
              width: 300,
              height: 400,
            },
          ],
          agent: {
            os: "OS",
            device: "device ",
            viewport: "viewport",
          },
          screenshotOptions: {
            omitBackground: true,
            timeout: 12,
          },
          comment: "Test comment",
        };
        pageMocked.$ = vi.fn().mockResolvedValueOnce({} as ElementHandle<HTMLElement>) as any;
        const elementHandle = await page.$("#test");
        const elementHandleMocked = vi.mocked(elementHandle as object as ElementHandle<HTMLElement>);
        elementHandleMocked!.screenshot = vi.fn().mockResolvedValueOnce(screenshot) as any;

        await playwrightVrt.trackElementHandle(
          elementHandle,
          imageName,
          trackOptions
        );

        expect(elementHandleMocked!.screenshot).toHaveBeenCalledWith(
          trackOptions.screenshotOptions
        );
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith(
          {
            name: imageName,
            imageBuffer: screenshot,
            browser: browserName,
            viewport: trackOptions.agent?.viewport,
            os: trackOptions.agent?.os,
            device: trackOptions.agent?.device,
            customTags: trackOptions.customTags,
            diffTollerancePercent: trackOptions.diffTollerancePercent,
            ignoreAreas: trackOptions.ignoreAreas,
            comment: trackOptions.comment,
          },
          2
        );
      });

      it("track default fields", async () => {
        const imageName = "test name";
        pageMocked.$ = vi.fn().mockResolvedValueOnce({} as ElementHandle<HTMLElement>) as any;
        const elementHandle = await page.$("#test");
        const elementHandleMocked = vi.mocked(elementHandle as object as ElementHandle<HTMLElement>);
        elementHandleMocked!.screenshot = vi.fn().mockResolvedValueOnce(screenshot) as any;

        await playwrightVrt.trackElementHandle(elementHandle, imageName);

        expect(elementHandleMocked!.screenshot).toHaveBeenCalledWith(undefined);
        expect(VisualRegressionTracker.prototype.track).toHaveBeenCalledWith(
          {
            name: imageName,
            imageBuffer: screenshot,
            browser: browserName,
            viewport: undefined,
            os: undefined,
            device: undefined,
            customTags: undefined,
            diffTollerancePercent: undefined,
            comment: undefined,
          },
          2
        );
      });

      it("should throw if no elementHandle", async () => {
        const imageName = "test name";
        pageMocked.$ = vi.fn().mockResolvedValueOnce(null) as any;
        const elementHandle = await page.$("#test");

        await expect(
          playwrightVrt.trackElementHandle(elementHandle, imageName)
        ).rejects.toThrow(new Error("ElementHandle is null"));
      });
    });
  });
});
