/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {Log} from '../../utils/logging.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing/index.js';

import {services, ServicesModule} from './services.js';

describe('ServicesModule', () => {
  let getStatusFromStandardApiSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let infoGroupSpy: jasmine.Spy;
  let git: AuthenticatedGitClient;

  services.splice(0, Infinity, {
    url: 'fakeStatus.com/api.json',
    prettyUrl: 'fakeStatus.com',
    name: 'Service Name',
  });

  beforeEach(async () => {
    getStatusFromStandardApiSpy = spyOn(ServicesModule.prototype, 'getStatusFromStandardApi');
    installVirtualGitClientSpies();
    infoGroupSpy = spyOn(Log.info, 'group');
    infoSpy = spyOn(Log, 'info');
    git = await AuthenticatedGitClient.get();
  });

  describe('gathering status', () => {
    it('for each of the services', async () => {
      new ServicesModule(git, {caretaker: {}, ...mockNgDevConfig});

      expect(getStatusFromStandardApiSpy).toHaveBeenCalledWith({
        url: 'fakeStatus.com/api.json',
        name: 'Service Name',
        prettyUrl: 'fakeStatus.com',
      });
    });
  });

  describe('printing the data retrieved', () => {
    it('for each service ', async () => {
      const fakeData = Promise.resolve([
        {
          name: 'Service 1',
          status: 'passing',
          description: 'Everything is working great',
          lastUpdated: new Date(0),
          statusUrl: 'http://google.com',
        },
        {
          name: 'Service 2',
          status: 'failing',
          description: 'Literally everything is broken',
          lastUpdated: new Date(0),
          statusUrl: 'http://notgoogle.com',
        },
      ]);

      const module = new ServicesModule(git, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});
      await module.printToTerminal();

      expect(infoGroupSpy).toHaveBeenCalledWith('Service Statuses');
      expect(infoSpy).toHaveBeenCalledWith('Service 1 ✅');
      expect(infoGroupSpy).toHaveBeenCalledWith(
        `Service 2 ❌ (Updated: ${new Date(0).toLocaleString()})`,
      );
      expect(infoSpy).toHaveBeenCalledWith('  Details: Literally everything is broken');
      expect(infoSpy).toHaveBeenCalledWith('  Status URL: http://notgoogle.com');
    });
  });
});
