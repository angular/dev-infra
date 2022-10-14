/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SpawnSyncReturns} from 'child_process';
import fs from 'fs';
import path from 'path';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {GitClient} from '../../utils/git/git-client.js';
import {Log} from '../../utils/logging.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing/index.js';
import {GoogleSyncConfig} from '../g3-sync-config.js';

import {G3Module, G3StatsData} from './g3.js';

describe('G3Module', () => {
  let getLatestShas: jasmine.Spy;
  let getDiffStats: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let git: AuthenticatedGitClient;

  beforeEach(async () => {
    installVirtualGitClientSpies();
    getLatestShas = spyOn(G3Module.prototype, 'getLatestShas' as any).and.returnValue(null);
    getDiffStats = spyOn(G3Module.prototype, 'getDiffStats' as any).and.returnValue(null);
    infoSpy = spyOn(Log, 'info');
    git = await AuthenticatedGitClient.get();
  });

  function setupFakeSyncConfig(config: GoogleSyncConfig): string {
    const configFileName = 'sync-test-conf.json';
    fs.writeFileSync(path.join(git.baseDir, configFileName), JSON.stringify(config));
    return configFileName;
  }

  describe('gathering stats', () => {
    it('unless the g3 merge config is not defined in the caretaker config', async () => {
      getLatestShas.and.returnValue({g3: 'abc123', master: 'zxy987'});
      const module = new G3Module(git, {caretaker: {}, ...mockNgDevConfig});

      expect(getDiffStats).not.toHaveBeenCalled();
      expect(await module.data).toBe(undefined);
    });

    it('unless the branch shas are not able to be retrieved', async () => {
      getLatestShas.and.returnValue(null);
      const module = new G3Module(git, {
        caretaker: {
          g3SyncConfigPath: setupFakeSyncConfig({
            syncedFilePatterns: ['file1'],
            alwaysExternalFilePatterns: [],
          }),
        },
        ...mockNgDevConfig,
      });

      expect(getDiffStats).not.toHaveBeenCalled();
      expect(await module.data).toBe(undefined);
    });

    it('for the files which are being synced to g3', async () => {
      getLatestShas.and.returnValue({g3: 'abc123', master: 'zxy987'});
      getDiffStats.and.callThrough();
      spyOn(GitClient.prototype, 'run').and.callFake((args: string[]): any => {
        const output: Partial<SpawnSyncReturns<string>> = {};
        if (args[0] === 'rev-list') {
          output.stdout = '3';
        }
        if (args[0] === 'diff') {
          output.stdout = '5\t6\tproject1/file1\n2\t3\tproject2/file2\n7\t1\tproject1/file3\n';
        }
        return output;
      });

      const module = new G3Module(git, {
        caretaker: {
          g3SyncConfigPath: setupFakeSyncConfig({
            syncedFilePatterns: ['project1/*'],
            alwaysExternalFilePatterns: [],
          }),
        },
        ...mockNgDevConfig,
      });
      const {insertions, deletions, files, commits} = (await module.data) as G3StatsData;

      expect(insertions).toBe(12);
      expect(deletions).toBe(7);
      expect(files).toBe(2);
      expect(commits).toBe(3);
    });

    it('should not throw when there is no diff between the g3 and main branch', async () => {
      getLatestShas.and.returnValue({g3: 'abc123', master: 'zxy987'});
      getDiffStats.and.callThrough();

      spyOn(GitClient.prototype, 'run').and.callFake((args: string[]): any => {
        const output: Partial<SpawnSyncReturns<string>> = {};
        if (args[0] === 'rev-list') {
          output.stdout = '0';
        }
        if (args[0] === 'diff') {
          output.stdout = '';
        }
        return output;
      });

      const module = new G3Module(git, {
        caretaker: {
          g3SyncConfigPath: setupFakeSyncConfig({
            syncedFilePatterns: ['project1/*'],
            alwaysExternalFilePatterns: [],
          }),
        },
        ...mockNgDevConfig,
      });
      const {insertions, deletions, files, commits} = (await module.data) as G3StatsData;

      expect(insertions).toBe(0);
      expect(deletions).toBe(0);
      expect(files).toBe(0);
      expect(commits).toBe(0);
    });
  });

  describe('printing the data retrieved', () => {
    it('if files are discovered needing to sync', async () => {
      const fakeData = Promise.resolve({
        insertions: 25,
        deletions: 10,
        files: 2,
        commits: 2,
      });

      const module = new G3Module(git, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});
      await module.printToTerminal();

      expect(infoSpy).toHaveBeenCalledWith(
        '2 files changed, 25 insertions(+), 10 deletions(-) from 2 commits will be included in the next sync',
      );
    });

    it('if no files need to sync', async () => {
      const fakeData = Promise.resolve({
        insertions: 0,
        deletions: 0,
        files: 0,
        commits: 25,
      });

      const module = new G3Module(git, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});
      await module.printToTerminal();

      expect(infoSpy).toHaveBeenCalledWith('25 commits between g3 and master');
      expect(infoSpy).toHaveBeenCalledWith('✅  No sync is needed at this time');
    });
  });
});
