/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';

import {ActiveReleaseTrains, ReleaseTrain} from '../../release/versioning/index.js';
import {Log} from '../../utils/logging.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing/index.js';

import {CiModule} from './ci.js';

describe('CiModule', () => {
  let fetchActiveReleaseTrainsSpy: jasmine.Spy;
  let getBranchStatusFromCiSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let debugSpy: jasmine.Spy;

  beforeEach(() => {
    installVirtualGitClientSpies();
    fetchActiveReleaseTrainsSpy = spyOn(ActiveReleaseTrains, 'fetch');
    getBranchStatusFromCiSpy = spyOn(CiModule.prototype, 'getBranchStatusFromCi' as any);
    infoSpy = spyOn(Log, 'info');
    debugSpy = spyOn(Log, 'debug');
  });

  describe('getting data for active trains', () => {
    it('handles active rc train', async () => {
      const trains = buildMockActiveReleaseTrains(true);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      const module = new CiModule({caretaker: {}, ...mockNgDevConfig});
      await module.data;

      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.releaseCandidate.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.latest.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.next.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledTimes(3);
    });

    it('handles an inactive rc train', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      const module = new CiModule({caretaker: {}, ...mockNgDevConfig});
      await module.data;

      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.latest.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledWith(trains.next.branchName);
      expect(getBranchStatusFromCiSpy).toHaveBeenCalledTimes(2);
    });

    it('aggregates information into a useful structure', async () => {
      const trains = buildMockActiveReleaseTrains(false);
      fetchActiveReleaseTrainsSpy.and.resolveTo(trains);
      getBranchStatusFromCiSpy.and.returnValue('success');
      const module = new CiModule({caretaker: {}, ...mockNgDevConfig});
      const data = await module.data;

      expect(data[0]).toEqual({
        active: false,
        name: 'releaseCandidate',
        label: '',
        status: 'not found',
      });
      expect(data[1]).toEqual({
        active: true,
        name: 'latest-branch',
        label: 'latest (latest-branch)',
        status: 'success',
      });
    });
  });

  it('prints the data retrieved', async () => {
    const fakeData = Promise.resolve([
      {
        active: true,
        name: 'name0',
        label: 'label0',
        status: 'success',
      },
      {
        active: false,
        name: 'name1',
        label: 'label1',
        status: 'failed',
      },
    ]);
    const trains = buildMockActiveReleaseTrains(true);
    fetchActiveReleaseTrainsSpy.and.resolveTo(trains);

    const module = new CiModule({caretaker: {}, ...mockNgDevConfig});
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
  });
}
