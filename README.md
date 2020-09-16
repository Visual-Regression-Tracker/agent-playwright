# Native integration for [Playwright](https://github.com/microsoft/playwright) with [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7c9f8095909c4220bff56b66b4cb728d)](https://www.codacy.com/gh/Visual-Regression-Tracker/agent-playwright?utm_source=github.com&utm_medium=referral&utm_content=Visual-Regression-Tracker/agent-playwright&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/7c9f8095909c4220bff56b66b4cb728d)](https://www.codacy.com/gh/Visual-Regression-Tracker/agent-playwright?utm_source=github.com&utm_medium=referral&utm_content=Visual-Regression-Tracker/agent-playwright&utm_campaign=Badge_Coverage)

## Npm

https://www.npmjs.com/package/@visual-regression-tracker/agent-playwright

## Install

`npm install @visual-regression-tracker/agent-playwright`

## Usage

### Import

```js
import {
  PlaywrightVisualRegressionTracker,
  Config,
} from "@visual-regression-tracker/agent-playwright";
import { chromium, Browser, Page, BrowserContext } from "playwright";
```

### Configure connection

```js
const browserType = chromium; // any BrowserType supported by Playwright

const config: Config = {
  // apiUrl - URL where backend is running
  apiUrl: "http://localhost:4200",

  // project - Project name or ID
  project: "Default project",

  // apiKey - User apiKey
  apiKey: "tXZVHX0EA4YQM1MGDD",

  // branch - Current git branch
  branchName: "develop",

  // enableSoftAssert - Log errors instead of exceptions
  enableSoftAssert: false,
};

const vrt = new PlaywrightVisualRegressionTracker(config, browserType);
```

### Start build

```js
vrt.start();
```

### Navigate to needed page

```js
// set up Playwright
const browser = await browserType.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

// navigate to url
await page.goto("https://google.com/");
```

### Track page

```js
await vrt.trackPage(page, imageName[, options])
```

- `page` <[Page](https://playwright.dev/#version=v1.0.2&path=docs%2Fapi.md&q=class-page)> Playwright page
- `imageName` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> name for the taken screenshot image
- `options` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> optional configuration with:
- - `diffTollerancePercent` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> specify acceptable difference from baseline, between `0-100`.
- - `screenshotOptions` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> configuration for Playwrights `screenshot` method
- - - `fullPage` <[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)> When true, takes a screenshot of the full scrollable page, instead of the currently visibvle viewport. Defaults to `false`.
- - - `omitBackground` <[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)> Hides default white background and allows capturing screenshots with transparency. Defaults to `false`.
- - - `clip` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> An object which specifies clipping of the resulting image. Should have the following fields:
- - - - `x` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> x-coordinate of top-left corner of clip area
- - - - `y` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> y-coordinate of top-left corner of clip area
- - - - `width` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> width of clipping area
- - - - `height` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> height of clipping area
- - `agent` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> Additional information to mark baseline across agents that have different:
- - - `os` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> operating system name, like Windows, Mac, etc.
- - - `device` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> device name, PC identifier, mobile identifier etc.
- - - `viewport` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> viewport size.

### Track elementHandle

```js
await vrt.trackElementHandle(elementHandle, imageName[, options])
```

- `elementHandle` <[ElementHandle](https://playwright.dev/#version=v1.4.0&path=docs%2Fapi.md&q=class-elementhandle)> Playwright ElementHandle
- `imageName` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> name for the taken screenshot image
- `options` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> optional configuration with:
- - `diffTollerancePercent` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> specify acceptable difference from baseline, between `0-100`.
- - `screenshotOptions` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> configuration for Playwrights `screenshot` method
- - - `omitBackground` <[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)> Hides default white background and allows capturing screenshots with transparency. Defaults to `false`.
- - `agent` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> Additional information to mark baseline across agents that have different:
- - - `os` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> operating system name, like Windows, Mac, etc.
- - - `device` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> device name, PC identifier, mobile identifier etc.
- - - `viewport` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> viewport size.

### Stop build

```js
vrt.stop();
```
