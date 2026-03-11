/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolveBuildId, Browser, BrowserPlatform} from '@puppeteer/browsers';
import {mkdtemp} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {downloadAndHashBinariesForBrowser} from './download.mjs';
import {generateRepoInfo, generateVersionsBzlFile, sortVersions, Versions} from './generation.mjs';
import fs from 'node:fs/promises';
import {getChromeMilestones, getFirefoxMilestones} from './versions.mjs';
import {exec} from 'node:child_process';

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

interface WriteVersionsOptions {
  browser: Browser;
  milestones: string[];
  tmpDir: string;
  workspaceRoot: string;
  excludeFilesForPerformance?: Partial<Record<BrowserPlatform, string[]>>;
  buildIdToVersion?: (buildId: string) => string;
}

// We treat chrome-headless-shell as Chromium in the module. This function
// ensures browser name is written to files as expected.
function getReadableBrowserName(browser: Browser): string {
  return browser === Browser.CHROMEHEADLESSSHELL ? 'chromium' : browser;
}

async function downloadMilestonesAndWriteVersionsFiles({
  browser,
  milestones,
  tmpDir,
  workspaceRoot,
  excludeFilesForPerformance,
  buildIdToVersion,
}: WriteVersionsOptions): Promise<void> {
  buildIdToVersion = buildIdToVersion ?? ((buildId) => buildId);

  const buildIds = await Promise.all(
    milestones.map((milestone) => resolveBuildId(browser, null!, milestone)),
  );

  const fileBasePath = path.join(
    workspaceRoot,
    'browsers/private/versions',
    getReadableBrowserName(browser),
  );
  // We keep a JSON file around that only holds the versions without any of the
  // additional content in the `.bzl` file. This enables merging of existing
  // versions with newly fetched one's without having to do string gymnastics on
  // the `.bzl` file.
  const jsonFilePath = fileBasePath + '.json';
  const bzlFilePath = fileBasePath + '.bzl';

  let versions: Versions = {};

  // Fetch the existing set of versions from the JSON. We _never_ delete a
  // version we previously provided, even if a new version is available on the
  // same milestone. If the new version has a different build ID, we will
  // provide both versions. Otherwise the old version will remain.
  try {
    const currentVersionsRaw = await fs.readFile(jsonFilePath, 'utf8');
    const currentVersions = JSON.parse(currentVersionsRaw) as Versions;
    versions = currentVersions;
  } catch (err: unknown) {
    console.warn('Failed to read versions JSON file:', (err as Error).message);
  }

  // Don't download versions we downloaded previously again. This would not
  // catch cases where the binaries under an existing build ID changes, although
  // this should ideally never happen (at least for Chrome).
  const existingVersions = new Set(Object.keys(versions));
  const filteredNewBuildIds = buildIds.filter(
    (buildId) => !existingVersions.has(buildIdToVersion(buildId)),
  );

  // Fetch the binaries for each build ID. The only reason we do this is to
  // calculate the integrity of the files.
  const binariesForBuilds = await Promise.all(
    filteredNewBuildIds.map((buildId) =>
      downloadAndHashBinariesForBrowser(tmpDir, browser, buildId, {}, excludeFilesForPerformance),
    ),
  );

  for (const binariesForBuild of binariesForBuilds) {
    const repoInfo = generateRepoInfo(binariesForBuild);
    const version = buildIdToVersion(binariesForBuild[0].buildId);
    versions[version] = repoInfo;
  }

  // Sort versions since old versions will keep getting added after newer ones
  // are already out.
  versions = sortVersions(versions);

  const allVersions = [...Object.keys(versions)];
  const defaultVersion = allVersions[allVersions.length - 1];

  // Write both the JSON and the `.bzl` file. They both contain the same
  // versions list. The `.bzl` file just has some additional syntax.
  await fs.writeFile(jsonFilePath, JSON.stringify(versions, null, 2) + '\n');
  await fs.writeFile(
    bzlFilePath,
    generateVersionsBzlFile(getReadableBrowserName(browser), defaultVersion, versions),
  );

  // Format the resulting `.json` file. Prettier may apply some formatting that
  // isn't consistent with default stringification (e.g. line length).
  exec(`npx prettier --write ${jsonFilePath}`, (err, stdout, stderr) => {
    if (err) {
      console.log(stdout);
      console.log(stderr);
      console.warn(`Formatting of ${jsonFilePath} failed: ${err.message}`);
    }
  });

  // Format the resulting `.bzl` file. JSON is valid here, but it's not
  // formatted quite right (e.g. no trailing comma).
  exec(`buildifier ${bzlFilePath}`, (err, stdout, stderr) => {
    if (err) {
      console.log(stdout);
      console.log(stderr);
      console.warn(`Formatting of ${bzlFilePath} failed: ${err.message}`);
    }
  });
}

async function main() {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'rules_browsers_tmp-'));
  const workspaceRoot = process.env['BUILD_WORKING_DIRECTORY']!;

  // Fetch the last 15 milestones for each browser. This is mostly relevant when
  // browsers haven't been updated in a long time and we want to backfill. All
  // browsers already present in the relevant versions file will be kept.
  const [chromeMilestones, firefoxMilestones] = await Promise.all([
    getChromeMilestones(15),
    getFirefoxMilestones(15),
  ]);

  await Promise.all([
    downloadMilestonesAndWriteVersionsFiles({
      browser: Browser.CHROMEHEADLESSSHELL,
      milestones: chromeMilestones,
      tmpDir,
      workspaceRoot,
      excludeFilesForPerformance: {
        // Exclude log files that Chrome might write to— causing remote cache misses.
        [BrowserPlatform.LINUX]: ['**/*.log'],
        [BrowserPlatform.MAC]: ['**/*.log'],
        [BrowserPlatform.MAC_ARM]: ['**/*.log'],
        [BrowserPlatform.WIN64]: ['**/*.log'],
      },
    }),
    downloadMilestonesAndWriteVersionsFiles({
      browser: Browser.CHROMEDRIVER,
      milestones: chromeMilestones,
      tmpDir,
      workspaceRoot,
    }),
    downloadMilestonesAndWriteVersionsFiles({
      browser: Browser.FIREFOX,
      milestones: firefoxMilestones,
      tmpDir,
      workspaceRoot,
      // We want Firefox to be addressable with "120.0" instead of
      // "stable_120.0", so we rewrite the build ID.
      buildIdToVersion: (buildId: string) => buildId.replace(/^stable_/, ''),
    }),
  ]);

  await fs.rm(tmpDir, {recursive: true, maxRetries: 2});
}
