import { IgnoreArea } from "@visual-regression-tracker/sdk-js";
import { Page, ElementHandle } from "@playwright/test";

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
  screenshotOptions?: Parameters<Page["screenshot"]>[0];
}

export interface ElementHandleTrackOptions extends BaseTrackOptions {
  screenshotOptions?: Parameters<ElementHandle["screenshot"]>[0];
}
