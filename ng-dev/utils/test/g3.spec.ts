/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SpawnSyncReturns} from 'child_process';
import fs from 'fs';
import path from 'path';

import {AuthenticatedGitClient} from '../git/authenticated-git-client.js';
import {GitClient} from '../git/git-client.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../testing/index.js';
import {GoogleSyncConfig} from '../config.js';

import {G3Stats, G3StatsData} from '../g3.js';

describe('G3Stats', () => {
  let getLatestShas: jasmine.Spy;
  let getDiffStats: jasmine.Spy;
  let git: AuthenticatedGitClient;

  beforeEach(async () => {
    installVirtualGitClientSpies();
    getLatestShas = spyOn(G3Stats, 'getLatestShas' as any).and.returnValue(null);
    getDiffStats = spyOn(G3Stats, 'getDiffStats' as any).and.returnValue(null);
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
      const data = G3Stats.retrieveDiffStats(git, {caretaker: {}, ...mockNgDevConfig});

      expect(getDiffStats).not.toHaveBeenCalled();
    });

    it('unless the branch shas are not able to be retrieved', async () => {
      getLatestShas.and.returnValue(null);
      const data = G3Stats.retrieveDiffStats(git, {
        caretaker: {
          g3SyncConfigPath: setupFakeSyncConfig({
            syncedFilePatterns: ['file1'],
            primitivesFilePatterns: [],
            alwaysExternalFilePatterns: [],
          }),
        },
        ...mockNgDevConfig,
      });

      expect(getDiffStats).not.toHaveBeenCalled();
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

      const data = await G3Stats.retrieveDiffStats(git, {
        caretaker: {
          g3SyncConfigPath: setupFakeSyncConfig({
            syncedFilePatterns: ['project1/*'],
            primitivesFilePatterns: [],
            alwaysExternalFilePatterns: [],
          }),
        },
        ...mockNgDevConfig,
      });
      const {insertions, deletions, files, primitivesFiles, commits} = data!;

      expect(insertions).toBe(12);
      expect(deletions).toBe(7);
      expect(files).toBe(2);
      expect(primitivesFiles).toBe(0);
      expect(commits).toBe(3);
    });

    it('for the primitives files which are being synced to g3', async () => {
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

      const data = await G3Stats.retrieveDiffStats(git, {
        caretaker: {
          g3SyncConfigPath: setupFakeSyncConfig({
            syncedFilePatterns: [''],
            primitivesFilePatterns: ['project1/*'],
            alwaysExternalFilePatterns: [],
          }),
        },
        ...mockNgDevConfig,
      });
      const {insertions, deletions, files, primitivesFiles, commits} = data!;

      expect(insertions).toBe(12);
      expect(deletions).toBe(7);
      expect(files).toBe(0);
      expect(primitivesFiles).toBe(2);
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

      const data = await G3Stats.retrieveDiffStats(git, {
        caretaker: {
          g3SyncConfigPath: setupFakeSyncConfig({
            syncedFilePatterns: ['project1/*'],
            primitivesFilePatterns: [],
            alwaysExternalFilePatterns: [],
          }),
        },
        ...mockNgDevConfig,
      });
      const {insertions, deletions, files, primitivesFiles, commits} = data!;

      expect(insertions).toBe(0);
      expect(deletions).toBe(0);
      expect(files).toBe(0);
      expect(primitivesFiles).toBe(0);
      expect(commits).toBe(0);
    });
  });
});
