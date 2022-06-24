import { IgnoreArea } from "@visual-regression-tracker/sdk-js";

export interface ElementHandleScreenshotOptions {
  /**
   * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images. Defaults to `false`.
   */
  omitBackground?: boolean;

  /**
   * Maximum time in milliseconds, defaults to 30 seconds, pass `0` to disable timeout. The default value can be changed by using the browserContext.setDefaultTimeout(timeout) or page.setDefaultTimeout(timeout) methods.
   */
  timeout?: number;
}

export interface PageScreenshotOptionsClip {
  /**
   * x-coordinate of top-left corner of clip area
   */
  x: number;

  /**
   * y-coordinate of top-left corner of clip area
   */
  y: number;

  /**
   * width of clipping area
   */
  width: number;

  /**
   * height of clipping area
   */
  height: number;
}

export interface PageScreenshotOptions {
  /**
   * When true, takes a screenshot of the full scrollable page, instead of the currently visibvle viewport. Defaults to `false`.
   */
  fullPage: boolean;

  /**
   * An object which specifies clipping of the resulting image. Should have the following fields:
   */
  clip?: PageScreenshotOptionsClip;

  /**
   * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images. Defaults to `false`.
   */
  omitBackground?: boolean;

  /**
   * Maximum time in milliseconds, defaults to 30 seconds, pass `0` to disable timeout. The default value can be changed by using the browserContext.setDefaultTimeout(timeout) or page.setDefaultTimeout(timeout) methods.
   */
  timeout?: number;
}

export interface Agent {
  os?: string;
  device?: string;
  viewport?: string;
}

interface BaseTrackOptions {
  diffTollerancePercent?: number;
  ignoreAreas?: IgnoreArea[];
  agent?: Agent;
  comment?: string;
}

export interface PageTrackOptions extends BaseTrackOptions {
  screenshotOptions?: PageScreenshotOptions;
}

export interface ElementHandleTrackOptions extends BaseTrackOptions {
  screenshotOptions?: ElementHandleScreenshotOptions;
}
