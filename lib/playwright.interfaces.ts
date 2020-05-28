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

export interface TrackOptions {
  diffTollerancePercent?: number;
  screenshotOptions?: PageScreenshotOptions;
  agent?: Agent;
}

export interface Agent {
  os?: string;
  device?: string;
}
