# Playwright agent for [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

[![npm](https://img.shields.io/npm/v/@visual-regression-tracker/agent-playwright)](https://www.npmjs.com/package/@visual-regression-tracker/agent-playwright)

Tracks [Playwright](https://playwright.dev) page and element screenshots. The agent is built on [sdk-js](https://github.com/Visual-Regression-Tracker/sdk-js).

## Requirements

- `@playwright/test` 1.x
- Node.js 26 or later
- Visual Regression Tracker server 5.0.8 or later; 6 is recommended

## Install

```sh
npm install --save-dev @visual-regression-tracker/agent-playwright
```

## Configuration

| Option | Environment variable | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `apiUrl` | `VRT_APIURL` | yes | | URL of the server API, e.g. `http://localhost:4200` |
| `apiKey` | `VRT_APIKEY` | yes | | API key of a user with access to the project |
| `project` | `VRT_PROJECT` | yes | | Project name or ID |
| `branchName` | `VRT_BRANCHNAME` | yes | | Current git branch |
| `sourceBranch` | `VRT_SOURCEBRANCH` | no | project's main branch | Branch to take baselines from while `branchName` has none of its own |
| `ciBuildId` | `VRT_CIBUILDID` | no | | ID of one CI build; machines with the same ID share a build |
| `enableSoftAssert` | `VRT_ENABLESOFTASSERT` | no | `false` | Log failed comparisons instead of throwing |

Pass the options to the constructor, after the browser name:

```ts
import { chromium } from "@playwright/test";
import { PlaywrightVisualRegressionTracker, Config } from "@visual-regression-tracker/agent-playwright";

const config: Config = {
  apiUrl: "http://localhost:4200",
  apiKey: "tXZVHX0EA4YQM1MGDD",
  project: "Default project",
  branchName: "develop",
};
const vrt = new PlaywrightVisualRegressionTracker(chromium.name(), config);
```

Or leave the config out. The options are then read from `vrt.json` in the working directory, with the same keys:

```json
{
  "apiUrl": "http://localhost:4200",
  "apiKey": "tXZVHX0EA4YQM1MGDD",
  "project": "Default project",
  "branchName": "develop",
  "sourceBranch": "release",
  "ciBuildId": "commit_sha",
  "enableSoftAssert": false
}
```

Environment variables override `vrt.json` key by key. With an explicit config, only `VRT_SOURCEBRANCH` is read from the environment.

`baselineBranchName` (`VRT_BASELINEBRANCHNAME`) is a deprecated alias of `sourceBranch`. It still works and logs a warning once.

## Usage

```ts
await vrt.start();

await page.goto("https://the-internet.herokuapp.com");

await vrt.trackPage(page, "Home page");

await vrt.trackElementHandle(page.locator("h1"), "Heading", {
  diffTollerancePercent: 1,
  agent: { os: "linux", device: "desktop" },
});

await vrt.stop();
```

`trackPage(page, name, options, retryCount)` and `trackElementHandle(elementHandleOrLocator, name, options, retryCount)` take the screenshot and upload it as multipart, so the server's JSON body limit does not apply.
`retryCount` is how many more times to submit the same screenshot while the result is `unresolved`. The default is 2.
Every option is optional:

| Option | Description |
| --- | --- |
| `agent.os`, `agent.device`, `agent.viewport` | Tell baselines of the same name apart; `trackPage` takes the viewport from the page |
| `customTags` | Tells baselines of the same name apart, e.g. `"smoke,dark"` |
| `diffTollerancePercent` | Allowed difference, in percent of all pixels (the spelling is the API's) |
| `ignoreAreas` | `[{ x, y, width, height }]` in pixels, left out of the comparison |
| `comment` | Shown with the test run |
| `screenshotOptions` | Passed to Playwright's [`page.screenshot()`](https://playwright.dev/docs/api/class-page#page-screenshot) or [`locator.screenshot()`](https://playwright.dev/docs/api/class-locator#locator-screenshot) |

The browser is the name passed to the constructor.

## Results and statuses

Both methods resolve to sdk-js's `TestRunResult`:

- `testRunResponse` holds the server's answer, including `id`, `status` and `url`.
- `imageUrl`, `diffUrl` and `baselineUrl` link to the images.

| Status | Outcome |
| --- | --- |
| `new` | No baseline yet: throws, or logs with `enableSoftAssert` |
| `unresolved` | Differs from the baseline: throws, or logs with `enableSoftAssert` |
| `ok`, `approved`, `autoApproved` | Passes |
| `failed` | A reviewer rejected it: passes with a warning |
| anything else | Passes with a warning |

## Errors

Request errors name the HTTP status and the server's message, and add a hint for common causes, such as a wrong `apiKey` (401) or an image over the server's limits (413, 422). See [sdk-js](https://github.com/Visual-Regression-Tracker/sdk-js#errors).

## Examples

[examples-js](https://github.com/Visual-Regression-Tracker/examples-js)

## Releasing

Every push to `master` runs [semantic-release](https://semantic-release.gitbook.io). It reads the [Conventional Commits](https://www.conventionalcommits.org) since the last `v*` tag:

| Commit | Release |
| --- | --- |
| `fix:` | patch |
| `feat:` | minor |
| `feat!:` or a `BREAKING CHANGE:` footer | major |
| `chore:`, `ci:`, `docs:`, `test:` | none |

It then publishes to npm through trusted publishing with provenance, tags `vX.Y.Z`, and writes the GitHub release.
The `version` field in `package.json` is a placeholder. The released version lives in the tags and on npm.

### Release candidates

Every push to `next` releases a pre-release of the next version, `X.Y.Z-rc.N` (`6.0.0-rc.1` once a breaking change is in). It goes to npm under the `next` dist-tag, never `latest`: `npm install @visual-regression-tracker/agent-playwright@next` installs the candidate, and a plain install keeps getting the last stable release. Its GitHub release is marked as a pre-release.

Breaking changes go into `next` through pull requests that target it. Merge `master` into `next` when `master` gets new commits.

To release the final version, merge `next` into `master` with a merge commit, not a squash, so that semantic-release still sees the breaking commits. That push releases it to `latest`. The repository deletes merged branches, so create `next` again from `master` before the next round of candidates.

## License

[Apache-2.0](LICENSE)
