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

import {CaretakerConfig, GithubConfig, NgDevConfig} from '../../../utils/config.js';
import {GoogleSyncConfig} from '../../../utils/g3-sync-config.js';
import {targetLabels} from '../labels/target.js';
import {Log} from '../../../utils/logging.js';

import {
  getStatusesForPullRequest,
  PullRequestFromGithub,
  PullRequestStatus,
} from '../fetch-pull-request.js';
import {mergeLabels} from '../labels/merge.js';
import {requiresLabels} from '../labels/requires.js';

import {assertValidPullRequest} from '../validation/validate-pull-request.js';
import {PullRequestConfig, PullRequestValidationConfig} from '../../config/index.js';
import {PullRequestTarget} from '../targeting/target-label.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {
  cleanTestTmpDir,
  installVirtualGitClientSpies,
  mockNgDevConfig,
} from '../../../utils/testing/index.js';
import {PullRequestFiles} from '../validation/assert-isolated-separate-files.js';
import {G3Stats} from '../../../utils/g3.js';
import {PullRequestComments} from '../validation/assert-enforce-tested.js';
import type {CommentAuthorAssociation} from '@octokit/graphql-schema';

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
    cleanTestTmpDir();
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
    prTarget = {branches: ['main'], label: targetLabels['TARGET_PATCH']};
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

  describe('assert-signed-cla', () => {
    it('should pass when cla/google commit status is passing', async () => {
      const config = createIsolatedValidationConfig({assertSignedCla: true});
      const pr = createTestPullRequest();
      pr.commits.nodes[1].commit.statusCheckRollup = {
        state: 'SUCCESS',
        contexts: {
          nodes: [
            {
              __typename: 'StatusContext',
              context: 'cla/google',
              state: 'SUCCESS',
              createdAt: '2026-07-13T10:00:00Z',
            } as any,
          ],
        },
      };

      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
    });

    it('should fail when only a CheckRun named cla/google is passing', async () => {
      const config = createIsolatedValidationConfig({assertSignedCla: true});
      const pr = createTestPullRequest();
      pr.commits.nodes[1].commit.statusCheckRollup = {
        state: 'SUCCESS',
        contexts: {
          nodes: [
            {
              __typename: 'CheckRun',
              name: 'cla/google',
              status: 'COMPLETED',
              conclusion: 'SUCCESS',
              completedAt: '2026-07-13T10:05:00Z',
            } as any,
          ],
        },
      };

      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
      expect(results[0].message).toBe('CLA is not signed by the contributor.');
    });

    it('should not allow a passing CheckRun named cla/google to overwrite a failing StatusContext', async () => {
      const config = createIsolatedValidationConfig({assertSignedCla: true});
      const pr = createTestPullRequest();
      pr.commits.nodes[1].commit.statusCheckRollup = {
        state: 'FAILURE',
        contexts: {
          nodes: [
            {
              __typename: 'StatusContext',
              context: 'cla/google',
              state: 'FAILURE',
              createdAt: '2026-07-13T10:00:00Z',
            } as any,
            {
              __typename: 'CheckRun',
              name: 'cla/google',
              status: 'COMPLETED',
              conclusion: 'SUCCESS',
              completedAt: '2026-07-13T10:05:00Z',
            } as any,
          ],
        },
      };

      const {statuses} = getStatusesForPullRequest(pr);
      expect(statuses).toEqual([
        {type: 'status', name: 'cla/google', status: PullRequestStatus.FAILING},
        {type: 'check', name: 'cla/google', status: PullRequestStatus.PASSING},
      ]);

      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
      expect(results[0].message).toBe('CLA is not signed by the contributor.');
    });
  });

  describe('assert-allowed-target-label', () => {
    const fakeReleaseTrains = {isFeatureFreeze: () => false} as any;

    it('should reject target: automation when author is not an automation bot', async () => {
      const config = createIsolatedValidationConfig({assertChangesAllowForTargetLabel: true});
      const pr = createTestPullRequest();
      pr.author = {login: 'external-user'};
      const automationTarget = {branches: ['main'], label: targetLabels['TARGET_AUTOMATION']};

      const results = await assertValidPullRequest(
        pr,
        config,
        ngDevConfig,
        fakeReleaseTrains,
        automationTarget,
        git,
      );
      expect(results.length).toBe(1);
      expect(results[0].message).toContain(
        'Cannot merge into branch for "target: automation" as the pull request is authored by "external-user"',
      );
    });

    it('should reject target: automation for non-bot author even when merge: fix commit message is applied', async () => {
      const config = createIsolatedValidationConfig({assertChangesAllowForTargetLabel: true});
      const pr = createTestPullRequest();
      pr.author = {login: 'external-user'};
      pr.labels.nodes.push({name: mergeLabels['MERGE_FIX_COMMIT_MESSAGE'].name});
      const automationTarget = {branches: ['main'], label: targetLabels['TARGET_AUTOMATION']};

      const results = await assertValidPullRequest(
        pr,
        config,
        ngDevConfig,
        fakeReleaseTrains,
        automationTarget,
        git,
      );
      expect(results.length).toBe(1);
      expect(results[0].message).toContain(
        'Cannot merge into branch for "target: automation" as the pull request is authored by "external-user"',
      );
    });

    it('should allow target: automation when author is angular-robot', async () => {
      const config = createIsolatedValidationConfig({assertChangesAllowForTargetLabel: true});
      const pr = createTestPullRequest();
      pr.author = {login: 'angular-robot'};
      const automationTarget = {branches: ['main'], label: targetLabels['TARGET_AUTOMATION']};

      const results = await assertValidPullRequest(
        pr,
        config,
        ngDevConfig,
        fakeReleaseTrains,
        automationTarget,
        git,
      );
      expect(results.length).toBe(0);
    });

    it('should still skip commit message validation for non-automation labels when merge: fix commit message is applied', async () => {
      const config = createIsolatedValidationConfig({assertChangesAllowForTargetLabel: true});
      const pr = createTestPullRequest();
      pr.commits.nodes = [
        {
          commit: {
            oid: '1234',
            message: 'feat(ng-dev): add new feature',
          } as any,
        },
      ];
      pr.labels.nodes.push({name: mergeLabels['MERGE_FIX_COMMIT_MESSAGE'].name});

      const results = await assertValidPullRequest(
        pr,
        config,
        ngDevConfig,
        fakeReleaseTrains,
        prTarget,
        git,
      );
      expect(results.length).toBe(0);
    });
  });

  describe('assert-enforce-tested', () => {
    it('should require a TGP when label is present', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      const commentHelper = PullRequestComments.create(git, pr.number);
      spyOn(PullRequestComments, 'create').and.returnValue(commentHelper);
      spyOn(commentHelper, 'loadPullRequestComments').and.returnValue(Promise.resolve([]));
      pr.labels.nodes.push({name: requiresLabels['REQUIRES_TGP'].name});
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
      expect(results[0].message).toBe(
        'Pull Request requires a TGP and does not have one. Either run a TGP or specify the PR is fully tested by adding a comment with "TESTED=[reason]".',
      );
    });

    it('should pass when label is present and TESTED comment exists', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      const comments = [
        {
          authorAssociation: 'MEMBER' as CommentAuthorAssociation,
          author: {
            login: 'fakelogin',
          },
          bodyText: 'TESTED="blah"',
        },
      ];
      const commentHelper = PullRequestComments.create(git, pr.number);
      spyOn(PullRequestComments, 'create').and.returnValue(commentHelper);
      spyOn(commentHelper, 'loadPullRequestComments').and.returnValue(Promise.resolve(comments));

      pr.labels.nodes.push({name: requiresLabels['REQUIRES_TGP'].name});
      interceptOrgsMembershipRequest('fakelogin', true);
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
    });

    it('should not pass when label is present and TESTED comment exists from non-googler', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      const comments = [
        {
          authorAssociation: 'MEMBER' as CommentAuthorAssociation,
          author: {
            login: 'fakelogin',
          },
          bodyText: 'TESTED="blah"',
        },
      ];
      const commentHelper = PullRequestComments.create(git, pr.number);
      spyOn(PullRequestComments, 'create').and.returnValue(commentHelper);
      spyOn(commentHelper, 'loadPullRequestComments').and.returnValue(Promise.resolve(comments));
      pr.labels.nodes.push({name: requiresLabels['REQUIRES_TGP'].name});
      interceptOrgsMembershipRequest('fakelogin', false);
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
    });

    it('should handle comments with null author without crashing', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      const comments = [
        {
          authorAssociation: 'MEMBER' as CommentAuthorAssociation,
          author: null as any,
          bodyText: 'TESTED="blah"',
        },
      ];
      const commentHelper = PullRequestComments.create(git, pr.number);
      spyOn(PullRequestComments, 'create').and.returnValue(commentHelper);
      spyOn(commentHelper, 'loadPullRequestComments').and.returnValue(Promise.resolve(comments));

      pr.labels.nodes.push({name: requiresLabels['REQUIRES_TGP'].name});
      // Should not throw, should return validation error since no googler tested it
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(1);
      expect(results[0].message).toContain('Pull Request requires a TGP');
    });
  });

  describe('assert-isolate-primitives', () => {
    it('should pass when no google sync config present', async () => {
      const config = createIsolatedValidationConfig({assertIsolatedSeparateFiles: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
    });

    it('should warn when primitives have been merged already and PR does not include primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatedSeparateFiles: true});
      let pr = createTestPullRequest();
      const files = ['packages/router/blah.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      const diffStats = {insertions: 0, deletions: 0, files: 1, separateFiles: 2, commits: 3};
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      spyOn(G3Stats, 'getDiffStats').and.returnValue(diffStats);
      const warnSpy = spyOn(Log, 'warn');
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        `Note: framework code and shared primitives code have both been merged. This is a little more risky. So be careful.`,
      );
    });

    it('should warn when framework changes have been merged already and PR includes primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatedSeparateFiles: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      const diffStats = {insertions: 0, deletions: 0, files: 1, separateFiles: 0, commits: 3};
      spyOn(PullRequestFiles, 'create').and.returnValue(fileHelper);
      spyOn(fileHelper, 'loadPullRequestFiles').and.returnValue(Promise.resolve(files));
      spyOn(G3Stats, 'getDiffStats').and.returnValue(diffStats);
      const warnSpy = spyOn(Log, 'warn');
      const results = await assertValidPullRequest(pr, config, ngDevConfig, null, prTarget, git);
      expect(results.length).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        `Note: framework code and shared primitives code have both been merged. This is a little more risky. So be careful.`,
      );
    });

    it('should allow merging when framework changes have been merged already and PR does not include primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatedSeparateFiles: true});
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
      const config = createIsolatedValidationConfig({assertIsolatedSeparateFiles: true});
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

    it('should allow merging when primitives changes have been merged already and PR has primitives and fw code', async () => {
      const config = createIsolatedValidationConfig({assertIsolatedSeparateFiles: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts', 'packages/router/blah.ts'];
      const fileHelper = PullRequestFiles.create(git, pr.number, googleSyncConfig);
      const diffStats = {insertions: 0, deletions: 0, files: 1, separateFiles: 1, commits: 3};
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

  return {...config, ...overrides};
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
