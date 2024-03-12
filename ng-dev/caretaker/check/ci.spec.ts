/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {ActiveReleaseTrains, ReleaseTrain} from '../../release/versioning/index.js';
import {Log} from '../../utils/logging.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing/index.js';

import {CiModule} from './ci.js';
import {AuthenticatedGithubClient} from '../../utils/git/github.js';

describe('CiModule', () => {
  let fetchActiveReleaseTrainsSpy: jasmine.Spy;
  let combinedStatusesSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let debugSpy: jasmine.Spy;
  let git: AuthenticatedGitClient;

  beforeEach(async () => {
    installVirtualGitClientSpies();
    combinedStatusesSpy = spyOn(
      AuthenticatedGithubClient.prototype,
      'getCombinedChecksAndStatusesForRef',
    ).and.resolveTo({result: null, results: []});
    fetchActiveReleaseTrainsSpy = spyOn(ActiveReleaseTrains, 'fetch');
    infoSpy = spyOn(Log, 'info');
    debugSpy = spyOn(Log, 'debug');
    git = await AuthenticatedGitClient.get();
  });

  describe('getting data for active trains', () => {
    it('handles active rc train', async () => {
      const trains = buildMockActiveReleaseTrains(true);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      const module = new CiModule(git, {caretaker: {}, ...mockNgDevConfig});
      await module.data;

      expect(combinedStatusesSpy).toHaveBeenCalledWith({
        ...git.remoteParams,
        ref: trains.releaseCandidate.branchName,
      });
      expect(combinedStatusesSpy).toHaveBeenCalledWith({
        ...git.remoteParams,
        ref: trains.latest.branchName,
      });
      expect(combinedStatusesSpy).toHaveBeenCalledWith({
        ...git.remoteParams,
        ref: trains.next.branchName,
      });
      expect(combinedStatusesSpy).toHaveBeenCalledTimes(3);
    });

    it('handles an inactive rc train', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      const module = new CiModule(git, {caretaker: {}, ...mockNgDevConfig});
      await module.data;

      expect(combinedStatusesSpy).toHaveBeenCalledWith({
        ...git.remoteParams,
        ref: trains.latest.branchName,
      });
      expect(combinedStatusesSpy).toHaveBeenCalledWith({
        ...git.remoteParams,
        ref: trains.next.branchName,
      });
      expect(combinedStatusesSpy).toHaveBeenCalledTimes(2);
    });

    it('aggregates information into a useful structure', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      combinedStatusesSpy.and.resolveTo({result: 'passing', results: []});
      const module = new CiModule(git, {caretaker: {}, ...mockNgDevConfig});
      const data = await module.data;

      expect(data[0]).toEqual({
        active: false,
        name: 'releaseCandidate',
        label: '',
        status: null,
      });
      expect(data[1]).toEqual({
        active: false,
        name: 'exceptionalMinor',
        label: '',
        status: null,
      });
      expect(data[2]).toEqual({
        active: true,
        name: 'latest-branch',
        label: 'latest (latest-branch)',
        status: 'passing',
      });
    });
  });

  it('prints the data retrieved', async () => {
    const fakeData = Promise.resolve([
      {
        active: true,
        name: 'name0',
        label: 'label0',
        status: 'passing',
      },
      {
        active: false,
        name: 'name1',
        label: 'label1',
        status: 'failing',
      },
    ]);
    const trains = buildMockActiveReleaseTrains(true);
    fetchActiveReleaseTrainsSpy.and.resolveTo(trains);

    const module = new CiModule(git, {caretaker: {}, ...mockNgDevConfig});
    Object.defineProperty(module, 'data', {value: fakeData});

    await module.printToTerminal();

    expect(debugSpy).toHaveBeenCalledWith('No active release train for name1');
    expect(infoSpy).toHaveBeenCalledWith('label0 ✅');
  });
});

/** Build a mock set of ActiveReleaseTrains. */
function buildMockActiveReleaseTrains(
  withRc: false,
): ActiveReleaseTrains & {releaseCandidate: null};
function buildMockActiveReleaseTrains(
  withRc: true,
): ActiveReleaseTrains & {releaseCandidate: ReleaseTrain};
function buildMockActiveReleaseTrains(withRc: boolean): ActiveReleaseTrains {
  const baseResult = {
    isMajor: false,
    version: new semver.SemVer('0.0.0'),
  };
  return new ActiveReleaseTrains({
    releaseCandidate: withRc ? {branchName: 'rc-branch', ...baseResult} : null,
    latest: {branchName: 'latest-branch', ...baseResult},
    next: {branchName: 'next-branch', ...baseResult},
    // TODO: Consider testing exceptional minor status too.
    exceptionalMinor: null,
  });
}
