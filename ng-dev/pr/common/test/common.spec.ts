/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import nock from 'nock';
import fs from 'fs';
import path from 'path';

import {
  CaretakerConfig,
  GithubConfig,
  GoogleSyncConfig,
  NgDevConfig,
} from '../../../utils/config.js';
import {targetLabels} from '../labels/target.js';

import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {requiresLabels} from '../labels/requires.js';

import {assertValidPullRequest} from '../validation/validate-pull-request.js';
import {PullRequestValidationConfig} from '../validation/validation-config.js';
import {PullRequestConfig} from '../../config/index.js';
import {PullRequestTarget} from '../targeting/target-label.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../../utils/testing/index.js';
import {PullRequestFiles} from '../validation/assert-isolate-primitives.js';
import {G3Stats} from '../../../utils/g3.js';

const API_ENDPOINT = `https://api.github.com`;

describe('pull request validation', () => {
  let ngDevConfig: NgDevConfig<{
    pullRequest: PullRequestConfig;
    github: GithubConfig;
    caretaker: CaretakerConfig;
  }>;
  let prTarget: PullRequestTarget;
  let googleSyncConfig: GoogleSyncConfig;
  let git: AuthenticatedGitClient;

  beforeEach(async () => {
    installVirtualGitClientSpies();
    git = await AuthenticatedGitClient.get();
    googleSyncConfig = {
      syncedFilePatterns: ['packages/**'],
      alwaysExternalFilePatterns: ['**/BUILD.bazel', '**/*.md'],
      separateFilePatterns: ['packages/core/primitives/**'],
    };
    ngDevConfig = {
      pullRequest: {
        githubApiMerge: false,
      },
      __isNgDevConfigObject: true,
      caretaker: {
        g3SyncConfigPath: setupFakeSyncConfig(googleSyncConfig),
      },
      ...mockNgDevConfig,
    };
    prTarget = {branches: ['main'], label: targetLabels.TARGET_PATCH};
  });

  afterEach(() => nock.cleanAll());

  function getOrgsApiRequestUrl(): string {
    return `${API_ENDPOINT}/orgs`;
  }

  /**
   * Mocks a repository branch list API request.
   * https://docs.github.com/en/rest/reference/repos#list-branches.
   */
  function interceptOrgsMembershipRequest(username: string, result: boolean) {
    const mock = nock(getOrgsApiRequestUrl());
    const responseCode = result ? 204 : 302;
    mock.get(`/googlers/members/${username}`).reply(responseCode);
  }

  function setupFakeSyncConfig(config: GoogleSyncConfig): string {
    const configFileName = 'sync-test-conf.json';
    fs.writeFileSync(path.join(git.baseDir, configFileName), JSON.stringify(config));
    return configFileName;
  }

  describe('assert-enforce-tested', () => {
    it('should require a TGP when label is present', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      pr.labels.nodes.push({name: requiresLabels.REQUIRES_TGP.name});
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
      expect(results[0].message).toBe(
        'Pull Request requires a TGP and does not have one. Either run a TGP or specify the PR is fully tested by adding a comment with "TESTED=[reason]".',
      );
    });

    it('should pass when label is present and TESTED comment exists', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      pr.reviews.nodes.push({
        commit: {oid: '4321'},
        authorAssociation: 'MEMBER',
        author: {
          login: 'fakelogin',
        },
        bodyText: 'TESTED="blah"',
      });
      pr.labels.nodes.push({name: requiresLabels.REQUIRES_TGP.name});
      interceptOrgsMembershipRequest('fakelogin', true);
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
    });

    it('should not pass when label is present and TESTED comment exists from non-googler', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      pr.reviews.nodes.push({
        commit: {oid: '4321'},
        authorAssociation: 'MEMBER',
        author: {
          login: 'fakelogin',
        },
        bodyText: 'TESTED="blah"',
      });
      pr.labels.nodes.push({name: requiresLabels.REQUIRES_TGP.name});
      interceptOrgsMembershipRequest('fakelogin', false);
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
    });

    it('should not pass when label is present and TESTED comment exists on old commit sha', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      pr.reviews.nodes.push({
        commit: {oid: '1234'},
        authorAssociation: 'MEMBER',
        author: {
          login: 'fakelogin',
        },
        bodyText: 'TESTED="blah"',
      });
      interceptOrgsMembershipRequest('fakelogin', true);
      pr.labels.nodes.push({name: requiresLabels.REQUIRES_TGP.name});
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
    });
  });

  describe('assert-isolate-primitives', () => {
    it('should pass when no google sync config present', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
    });

    it('should prevent merging when primitives have been merged already and PR does not include primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/router/blah.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      const diffStats = {insertions: 0, deletions: 0, files: 1, separateFiles: 2, commits: 3};
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      spyOn(G3Stats, 'getDiffStats').and.returnValue(diffStats);
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
      expect(results[0].message).toBe(
        `This PR cannot be merged as Shared Primitives code has already been merged. ` +
          `Primitives and Framework code must be merged and synced separately. Try again after a g3sync has finished.`,
      );
    });

    it('should prevent merging when framework changes have been merged already and PR includes primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      const diffStats = {insertions: 0, deletions: 0, files: 1, separateFiles: 0, commits: 3};
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      spyOn(G3Stats, 'getDiffStats').and.returnValue(diffStats);
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
      expect(results[0].message).toBe(
        `This PR cannot be merged as Angular framework code has already been merged. ` +
          `Primitives and Framework code must be merged and synced separately. Try again after a g3sync has finished.`,
      );
    });

    it('should allow merging when framework changes have been merged already and PR does not include primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/router/blah.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      const diffStats = {insertions: 0, deletions: 0, files: 1, separateFiles: 0, commits: 3};
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(G3Stats, 'getDiffStats').and.returnValue(diffStats);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
    });

    it('should allow merging when primitives changes have been merged already and PR includes primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      const diffStats = {insertions: 0, deletions: 0, files: 0, separateFiles: 1, commits: 3};
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(G3Stats, 'getDiffStats').and.returnValue(diffStats);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
    });
  });
});

function createIsolatedValidationConfig(
  overrides: Partial<PullRequestValidationConfig>,
): PullRequestValidationConfig {
  const config = {
    assertPending: false,
    assertMergeReady: false,
    assertSignedCla: false,
    assertChangesAllowForTargetLabel: false,
    assertPassingCi: false,
    assertCompletedReviews: false,
    assertEnforcedStatuses: false,
    assertMinimumReviews: false,
    assertIsolatePrimitive: false,
    assertEnforceTested: false,
  };

  return PullRequestValidationConfig.create({...config, ...overrides});
}

function createTestPullRequest(): PullRequestFromGithub {
  return {
    url: 'https://github.com/angular/angular',
    isDraft: false,
    state: 'OPEN',
    number: 12345,
    mergeable: 'MERGEABLE',
    updatedAt: '',
    headRefOid: '4321',
    commits: {
      totalCount: 0,
      nodes: [
        {
          commit: {
            oid: '1234',
            login: 'fakelogin',
            message: 'blah',
          },
        },
        {
          commit: {
            oid: '4321',
            login: 'fakelogin',
            message: 'fixup',
          },
        },
      ],
    },
    reviewRequests: {totalCount: 0},
    reviews: {nodes: []},
    maintainerCanModify: true,
    viewerDidAuthor: true,
    baseRefName: '',
    title: 'test: pull request',
    labels: {
      nodes: [],
    },
  } as unknown as PullRequestFromGithub;
}
