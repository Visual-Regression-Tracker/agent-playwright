import {
  Config,
  VisualRegressionTracker,
} from "@visual-regression-tracker/sdk-js";
import { Browser, BrowserContext, Page, chromium } from "playwright";
import { PlaywrightVisualRegressionTracker, TrackOptions } from ".";
import { mocked } from "ts-jest/utils";

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

describe("playwright", () => {
  beforeAll(async () => {
    browser = await browserType.launch();
    context = await browser.newContext({
      viewport: {
        width: 1800,
        height: 1600,
      },
    });
    page = await context.newPage();
    vrt = new PlaywrightVisualRegressionTracker(config, browserType);
  });

  afterAll(async () => {
    await browser.close();
  });

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

  it("track all fields", async () => {
    const imageName = "test name";
    const trackOptions: TrackOptions = {
      diffTollerancePercent: 12.31,
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
    vrt["vrt"]["isStarted"] = jest.fn().mockReturnValueOnce(true);
    const trackMock = jest.fn();
    VisualRegressionTracker.prototype.track = trackMock;
    const pageMocked = mocked(page);
    const screenshot: Buffer = new Buffer("image mocked");
    const screenshotMock = jest.fn().mockResolvedValueOnce(screenshot);
    pageMocked.screenshot = screenshotMock;
    await vrt.track(page, imageName, trackOptions);

    expect(pageMocked.screenshot).toHaveBeenCalledWith(
      trackOptions.screenshotOptions
    );
    expect(trackMock).toHaveBeenCalledWith({
      name: imageName,
      imageBase64: screenshot.toString("base64"),
      browser: browserType.name(),
      viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
      os: trackOptions.agent?.os,
      device: trackOptions.agent?.device,
      diffTollerancePercent: trackOptions.diffTollerancePercent,
    });
  });

  it("track default fields", async () => {
    const imageName = "test name";
    vrt["vrt"]["isStarted"] = jest.fn().mockReturnValueOnce(true);
    const trackMock = jest.fn();
    VisualRegressionTracker.prototype.track = trackMock;
    const pageMocked = mocked(page);
    const screenshot: Buffer = new Buffer("image mocked");
    const screenshotMock = jest.fn().mockResolvedValueOnce(screenshot);
    pageMocked.screenshot = screenshotMock;
    pageMocked.viewportSize = jest.fn().mockReturnValueOnce(null);

    await vrt.track(page, imageName);

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
