/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig, GoogleSyncConfig, NgDevConfig} from '../../../utils/config.js';
import {targetLabels} from '../labels/target.js';

import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {requiresLabels} from '../labels/requires.js';

import {assertValidPullRequest} from '../validation/validate-pull-request.js';
import {PullRequestValidationConfig} from '../validation/validation-config.js';
import {PullRequestConfig} from '../../config/index.js';
import {PullRequestTarget} from '../targeting/target-label.js';

describe('pull request validation', () => {
  let ngDevConfig: NgDevConfig<{pullRequest: PullRequestConfig; github: GithubConfig}>;
  let prTarget: PullRequestTarget;
  let googleSyncConfig: GoogleSyncConfig;
  beforeEach(() => {
    ngDevConfig = {
      pullRequest: {
        githubApiMerge: false,
      },
      github: {owner: 'angular', name: 'dev-infra-test', mainBranchName: 'main'},
      __isNgDevConfigObject: true,
    };
    prTarget = {branches: ['main'], label: targetLabels.TARGET_PATCH};
    googleSyncConfig = {
      syncedFilePatterns: ['packages/**'],
      alwaysExternalFilePatterns: ['**/BUILD.bazel', '**/*.md'],
      primitivesFilePatterns: ['packages/core/primitives/**'],
    };
  });

  describe('assert-enforce-tested', () => {
    it('should require a TGP when label is present', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      const files: string[] = [];
      const diffStats = {insertions: 0, deletions: 0, files: 1, primitivesFiles: 0, commits: 3};
      pr.labels.nodes.push({name: requiresLabels.REQUIRES_TGP.name});
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        null,
      );
      expect(results.length).toBe(1);
      expect(results[0].message).toBe(
        'Pull Request requires a TGP and does not have one. Either run a TGP or specify the PR is fully tested by adding a comment with "TESTED=[reason]".',
      );
    });

    it('should pass when label is present and TESTED comment exists', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      const files: string[] = [];
      const diffStats = {insertions: 0, deletions: 0, files: 1, primitivesFiles: 0, commits: 3};
      pr.reviews.nodes.push({
        commit: {oid: '4321'},
        authorAssociation: 'MEMBER',
        bodyText: 'TESTED="blah"',
      });
      pr.labels.nodes.push({name: requiresLabels.REQUIRES_TGP.name});
      debugger;
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        null,
      );
      expect(results.length).toBe(0);
    });

    it('should not pass when label is present and TESTED comment exists on old commit sha', async () => {
      const config = createIsolatedValidationConfig({assertEnforceTested: true});
      let pr = createTestPullRequest();
      const files: string[] = [];
      const diffStats = {insertions: 0, deletions: 0, files: 1, primitivesFiles: 0, commits: 3};
      pr.reviews.nodes.push({
        commit: {oid: '1234'},
        authorAssociation: 'MEMBER',
        bodyText: 'TESTED="blah"',
      });
      pr.labels.nodes.push({name: requiresLabels.REQUIRES_TGP.name});
      debugger;
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        null,
      );
      expect(results.length).toBe(1);
    });
  });

  describe('assert-isolate-primitives', () => {
    it('should pass when no google sync config present', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts'];
      const diffStats = {insertions: 0, deletions: 0, files: 1, primitivesFiles: 0, commits: 3};
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        null,
      );
      expect(results.length).toBe(0);
    });

    it('should prevent merging when primitives have been merged already and PR does not include primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/router/blah.ts'];
      const diffStats = {insertions: 0, deletions: 0, files: 1, primitivesFiles: 2, commits: 3};
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        googleSyncConfig,
      );
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
      const diffStats = {insertions: 0, deletions: 0, files: 1, primitivesFiles: 0, commits: 3};
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        googleSyncConfig,
      );
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
      const diffStats = {insertions: 0, deletions: 0, files: 1, primitivesFiles: 0, commits: 3};
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        googleSyncConfig,
      );
      expect(results.length).toBe(0);
    });

    it('should allow merging when primitives changes have been merged already and PR includes primitives files', async () => {
      const config = createIsolatedValidationConfig({assertIsolatePrimitives: true});
      let pr = createTestPullRequest();
      const files = ['packages/core/primitives/rando.ts'];
      const diffStats = {insertions: 0, deletions: 0, files: 0, primitivesFiles: 1, commits: 3};
      const results = await assertValidPullRequest(
        pr,
        files,
        diffStats,
        config,
        ngDevConfig,
        null,
        prTarget,
        googleSyncConfig,
      );
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
    commits: {
      totalCount: 0,
      nodes: [
        {
          commit: {
            oid: '1234',
            authoredDate: '2024-01-10T13:15:20Z',
            message: 'blah',
          },
        },
        {
          commit: {
            oid: '4321',
            authoredDate: '2024-02-18T09:22:54Z',
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
