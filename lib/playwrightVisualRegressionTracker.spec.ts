import {
  Config,
  VisualRegressionTracker,
} from "@visual-regression-tracker/sdk-js";
import { Browser, BrowserContext, Page, chromium } from "playwright";
import {
  PlaywrightVisualRegressionTracker,
  PageTrackOptions,
  ElementHandleTrackOptions,
} from ".";
import { mocked } from "ts-jest/utils";
import { MaybeMocked } from "ts-jest/dist/utils/testing";

let browserType = chromium;
let browser: Browser;
let context: BrowserContext;
let page: Page;
let vrt: PlaywrightVisualRegressionTracker;

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
  vrt = new PlaywrightVisualRegressionTracker(browserType, config);
});

afterAll(async () => {
  await browser.close();
});

describe("playwright", () => {
  it("start", async () => {
    const startMock = jest.fn();
    VisualRegressionTracker.prototype.start = startMock;

    await vrt.start();

    expect(startMock).toHaveBeenCalled();
  });

  it("stop", async () => {
    const stopMock = jest.fn();
    VisualRegressionTracker.prototype.stop = stopMock;

    await vrt.stop();

    expect(stopMock).toHaveBeenCalled();
  });

  describe("track", () => {
    let trackMock: jest.Mock<any, any>;
    let pageMocked: MaybeMocked<Page>;
    const screenshot: Buffer = Buffer.from("image mocked");

    beforeEach(() => {
      vrt["vrt"]["isStarted"] = jest.fn().mockReturnValueOnce(true);
      trackMock = jest.fn();
      VisualRegressionTracker.prototype.track = trackMock;
      pageMocked = mocked(page);
      pageMocked.screenshot = jest.fn().mockResolvedValueOnce(screenshot);
    });

    describe("trackPage", () => {
      it("track all fields", async () => {
        const imageName = "test name";
        const trackOptions: PageTrackOptions = {
          diffTollerancePercent: 12.31,
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

        await vrt.trackPage(page, imageName, trackOptions);

        expect(pageMocked.screenshot).toHaveBeenCalledWith(
          trackOptions.screenshotOptions
        );
        expect(trackMock).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserType.name(),
          viewport: `1800x1600`,
          os: trackOptions.agent?.os,
          device: trackOptions.agent?.device,
          diffTollerancePercent: trackOptions.diffTollerancePercent,
          ignoreAreas: trackOptions.ignoreAreas,
        });
      });

      it("track default fields", async () => {
        const imageName = "test name";
        pageMocked.viewportSize = jest.fn().mockReturnValueOnce(null);

        await vrt.trackPage(page, imageName);

        expect(pageMocked.screenshot).toHaveBeenCalledWith(undefined);
        expect(trackMock).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserType.name(),
          viewport: undefined,
          os: undefined,
          device: undefined,
          diffTollerancePercent: undefined,
        });
      });
    });

    describe("trackElementHandle", () => {
      it("track all fields", async () => {
        const imageName = "test name";
        const trackOptions: ElementHandleTrackOptions = {
          diffTollerancePercent: 12.31,
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
        };
        pageMocked.$ = jest.fn().mockResolvedValueOnce({});
        const elementHandle = await page.$("#test");
        const elementHandleMocked = mocked(elementHandle);
        elementHandleMocked!.screenshot = jest
          .fn()
          .mockResolvedValueOnce(screenshot);

        await vrt.trackElementHandle(elementHandle, imageName, trackOptions);

        expect(elementHandleMocked!.screenshot).toHaveBeenCalledWith(
          trackOptions.screenshotOptions
        );
        expect(trackMock).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserType.name(),
          viewport: trackOptions.agent?.viewport,
          os: trackOptions.agent?.os,
          device: trackOptions.agent?.device,
          diffTollerancePercent: trackOptions.diffTollerancePercent,
          ignoreAreas: trackOptions.ignoreAreas,
        });
      });

      it("track default fields", async () => {
        const imageName = "test name";
        pageMocked.$ = jest.fn().mockResolvedValueOnce({});
        const elementHandle = await page.$("#test");
        const elementHandleMocked = mocked(elementHandle);
        elementHandleMocked!.screenshot = jest
          .fn()
          .mockResolvedValueOnce(screenshot);

        await vrt.trackElementHandle(elementHandle, imageName);

        expect(elementHandleMocked!.screenshot).toHaveBeenCalledWith(undefined);
        expect(trackMock).toHaveBeenCalledWith({
          name: imageName,
          imageBase64: screenshot.toString("base64"),
          browser: browserType.name(),
          viewport: undefined,
          os: undefined,
          device: undefined,
          diffTollerancePercent: undefined,
        });
      });

      it("should throw if no elementHandle", async () => {
        const imageName = "test name";
        pageMocked.$ = jest.fn().mockResolvedValueOnce(null);
        const elementHandle = await page.$("#test");

        await expect(
          vrt.trackElementHandle(elementHandle, imageName)
        ).rejects.toThrowError(new Error("ElementHandle is null"));
      });
    });
  });
});
