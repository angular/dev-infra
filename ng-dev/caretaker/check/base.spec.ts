/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {installVirtualGitClientSpies} from '../../utils/testing/index.js';
import {BaseModule} from './base.js';

/** Data mocking as the "retrieved data". */
const exampleData = 'this is example data' as const;

/** A simple usage of the BaseModule to illustrate the workings built into the abstract class. */
class ConcreteBaseModule extends BaseModule<typeof exampleData> {
  override async retrieveData() {
    return exampleData;
  }
  override async printToTerminal() {}
}

describe('BaseModule', () => {
  let retrieveDataSpy: jasmine.Spy;
  let git: AuthenticatedGitClient;

  beforeEach(async () => {
    retrieveDataSpy = spyOn(ConcreteBaseModule.prototype, 'retrieveData');
    installVirtualGitClientSpies();
    git = await AuthenticatedGitClient.get();
  });

  it('begins retrieving data during construction', () => {
    new ConcreteBaseModule(git, {} as any);

    expect(retrieveDataSpy).toHaveBeenCalled();
  });

  it('makes the data available via the data attribute', async () => {
    retrieveDataSpy.and.callThrough();
    const module = new ConcreteBaseModule(git, {} as any);

    expect(await module.data).toBe(exampleData);
  });
});
