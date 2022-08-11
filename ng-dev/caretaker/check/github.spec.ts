/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {AuthenticatedGithubClient} from '../../utils/git/github.js';
import {Log} from '../../utils/logging.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing/index.js';

import {GithubQueriesModule} from './github.js';

describe('GithubQueriesModule', () => {
  let githubApiSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let infoGroupSpy: jasmine.Spy;
  let git: AuthenticatedGitClient;

  beforeEach(async () => {
    githubApiSpy = spyOn(AuthenticatedGithubClient.prototype, 'graphql').and.throwError(
      'The graphql query response must always be manually defined in a test.',
    );
    installVirtualGitClientSpies();
    infoGroupSpy = spyOn(Log.info, 'group');
    infoSpy = spyOn(Log, 'info');
    git = await AuthenticatedGitClient.get();
  });

  describe('gathering stats', () => {
    it('unless githubQueries are `undefined`', async () => {
      const module = new GithubQueriesModule(git, {
        ...mockNgDevConfig,
        caretaker: {githubQueries: undefined},
      });

      expect(await module.data).toBe(undefined);
    });

    it('unless githubQueries are an empty array', async () => {
      const module = new GithubQueriesModule(git, {
        ...mockNgDevConfig,
        caretaker: {githubQueries: []},
      });

      expect(await module.data).toBe(undefined);
    });

    it('for the requested Github queries', async () => {
      githubApiSpy.and.returnValue({
        'keynamewithspaces': {
          issueCount: 1,
          nodes: [{url: 'http://github.com/owner/name/issue/1'}],
        },
        'query_with_colon': {
          issueCount: 0,
          nodes: [],
        },
      });
      const module = new GithubQueriesModule(git, {
        ...mockNgDevConfig,
        caretaker: {
          githubQueries: [
            {name: 'key name with spaces', query: 'issue: yes'},
            {name: 'query_with_colon', query: 'is:milestone'},
          ],
        },
      });

      expect(await module.data).toEqual([
        {
          queryName: 'key name with spaces',
          count: 1,
          queryUrl: 'https://github.com/owner/name/issues?q=issue%3A%20yes',
          matchedUrls: ['http://github.com/owner/name/issue/1'],
        },
        {
          queryName: 'query_with_colon',
          count: 0,
          queryUrl: 'https://github.com/owner/name/issues?q=is%3Amilestone',
          matchedUrls: [],
        },
      ]);
    });
  });

  describe('printing the data retrieved', () => {
    it('if there are no matches of the query', async () => {
      const fakeData = Promise.resolve([
        {
          queryName: 'query1',
          count: 0,
          queryUrl: 'https://github.com/owner/name/issues?q=issue:%20no',
          matchedUrls: [],
        },
        {
          queryName: 'query2',
          count: 0,
          queryUrl: 'https://github.com/owner/name/issues?q=something',
          matchedUrls: [],
        },
      ]);

      const module = new GithubQueriesModule(git, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});

      await module.printToTerminal();

      expect(infoGroupSpy).toHaveBeenCalledWith('Github Tasks');
      expect(infoSpy).toHaveBeenCalledWith('query1  0');
      expect(infoSpy).toHaveBeenCalledWith('query2  0');
    });

    it('if there are maches of the query', async () => {
      const fakeData = Promise.resolve([
        {
          queryName: 'query1',
          count: 1,
          queryUrl: 'https://github.com/owner/name/issues?q=issue:%20yes',
          matchedUrls: ['http://github.com/owner/name/issue/1'],
        },
        {
          queryName: 'query2',
          count: 0,
          queryUrl: 'https://github.com/owner/name/issues?q=something',
          matchedUrls: [],
        },
      ]);

      const module = new GithubQueriesModule(git, {caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});

      await module.printToTerminal();

      expect(infoGroupSpy).toHaveBeenCalledWith('Github Tasks');
      expect(infoSpy).toHaveBeenCalledWith('query1  1');
      expect(infoGroupSpy).toHaveBeenCalledWith(
        'https://github.com/owner/name/issues?q=issue:%20yes',
      );
      expect(infoSpy).toHaveBeenCalledWith('- http://github.com/owner/name/issue/1');
      expect(infoSpy).toHaveBeenCalledWith('query2  0');
    });
  });
});
