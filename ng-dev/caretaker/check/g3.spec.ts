/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {Log} from '../../utils/logging.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing/index.js';

import {G3Module} from './g3.js';

describe('G3Module', () => {
  let infoSpy: jasmine.Spy;
  let git: AuthenticatedGitClient;

  beforeEach(async () => {
    installVirtualGitClientSpies();
    infoSpy = spyOn(Log, 'info');
    git = await AuthenticatedGitClient.get();
  });

  describe('printing the data retrieved', () => {
    it('if files are discovered needing to sync', async () => {
      const fakeData = Promise.resolve({
        insertions: 25,
        deletions: 10,
        files: 2,
        primitivesFiles: 0,
        commits: 2,
      });

      const module = new G3Module(git, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});
      await module.printToTerminal();

      expect(infoSpy).toHaveBeenCalledWith(
        '2 Angular files changed, 0 primitives files changed, 25 insertions(+), 10 deletions(-) from 2 commits will be included in the next sync',
      );
    });

    it('if primitives files are discovered needing to sync', async () => {
      const fakeData = Promise.resolve({
        insertions: 25,
        deletions: 10,
        files: 0,
        primitivesFiles: 2,
        commits: 2,
      });

      const module = new G3Module(git, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});
      await module.printToTerminal();

      expect(infoSpy).toHaveBeenCalledWith(
        '2 primitives files changed, 0 Angular files changed, 25 insertions(+), 10 deletions(-) from 2 commits will be included in the next sync\n' +
          `Note: Shared primivites code has been merged. Only more Shared Primitives code can be ` +
          `merged until the next sync is landed`,
      );
    });

    it('if no files need to sync', async () => {
      const fakeData = Promise.resolve({
        insertions: 0,
        deletions: 0,
        files: 0,
        primitivesFiles: 0,
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
