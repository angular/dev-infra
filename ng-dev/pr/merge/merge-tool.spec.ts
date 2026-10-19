/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {MergeTool} from './merge-tool.js';
import {PullRequest} from './pull-request.js';
import {Prompt} from '../../utils/prompt.js';
import {
  FatalMergeToolError,
  MergeConflictsFatalError,
  PullRequestValidationError,
  UserAbortedMergeToolError,
} from './failures.js';
import {MergeStrategy} from './strategies/strategy.js';
import {red} from '../../utils/logging.js';

describe('MergeTool caretaker note', () => {
  let git: jasmine.SpyObj<AuthenticatedGitClient>;
  let graphqlSpy: jasmine.Spy;
  let mergeTool: MergeTool;

  const fakeConfig = {
    pullRequest: {
      githubApiMerge: false,
    },
    github: {
      owner: 'angular',
      name: 'angular',
      mainBranchName: 'main',
    },
    __isNgDevConfigObject: true,
  } as any;

  const fakePullRequest: PullRequest = {
    url: 'https://github.com/angular/angular/pull/12345',
    prNumber: 12345,
    title: 'test: fake PR',
    labels: ['merge: caretaker note'],
    targetBranches: ['main'],
    githubTargetBranch: 'main',
    commitCount: 1,
    needsCommitMessageFixup: false,
    hasCaretakerNote: true,
    baseSha: 'abc',
    revisionRange: 'abc..def',
    validationFailures: [],
    headSha: 'def',
    closingIssuesReferences: [],
  };

  beforeEach(() => {
    graphqlSpy = jasmine.createSpy('graphql');
    git = {
      remoteConfig: {owner: 'angular', name: 'angular'},
      github: {graphql: graphqlSpy},
      userType: 'user',
      hasUncommittedChanges: () => false,
      isShallowRepo: () => false,
      hasOauthScopes: async () => true,
      getCurrentBranchOrRevision: () => 'main',
      run: () => ({stdout: ''}),
      runGraceful: () => ({stdout: ''}),
    } as any;

    mergeTool = new MergeTool(fakeConfig, git, {dryRun: true});
  });

  function mockComments(commentDefs: (string | {bodyText: string; authorAssociation?: string})[]) {
    graphqlSpy.and.resolveTo({
      repository: {
        pullRequest: {
          comments: {
            nodes: commentDefs.map((def) => {
              const bodyText = typeof def === 'string' ? def : def.bodyText;
              const authorAssociation =
                typeof def === 'string' ? 'MEMBER' : (def.authorAssociation ?? 'MEMBER');
              return {
                bodyText,
                author: {login: 'testuser'},
                authorAssociation,
              };
            }),
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    });
  }

  describe('getCaretakerNote', () => {
    it('returns undefined when no matching comments are found', async () => {
      mockComments(['LGTM!', 'Thanks for working on this!']);
      const note = await mergeTool.getCaretakerNote(fakePullRequest);
      expect(note).toBeUndefined();
    });

    it('returns the comment text when exactly 1 matching comment is found', async () => {
      mockComments(['LGTM!', 'caretaker note: please cherry-pick to 17.2.x']);
      const note = await mergeTool.getCaretakerNote(fakePullRequest);
      expect(note).toBe('caretaker note: please cherry-pick to 17.2.x');
    });

    it('returns undefined when multiple matching comments are found', async () => {
      mockComments(['caretaker note: first note', 'caretaker: second note']);
      const note = await mergeTool.getCaretakerNote(fakePullRequest);
      expect(note).toBeUndefined();
    });

    it('returns undefined when matching comment is from an untrusted author', async () => {
      mockComments([{bodyText: 'caretaker note: malicious note', authorAssociation: 'NONE'}]);
      const note = await mergeTool.getCaretakerNote(fakePullRequest);
      expect(note).toBeUndefined();
    });

    it('returns undefined when fetching comments fails', async () => {
      graphqlSpy.and.rejectWith(new Error('Network error'));
      const note = await mergeTool.getCaretakerNote(fakePullRequest);
      expect(note).toBeUndefined();
    });
  });

  describe('checkCaretakerNoteConfirmation', () => {
    it('does nothing when hasCaretakerNote is false', async () => {
      const confirmSpy = spyOn(Prompt, 'confirm');
      const pr = {...fakePullRequest, hasCaretakerNote: false};

      await mergeTool.checkCaretakerNoteConfirmation(pr);

      expect(graphqlSpy).not.toHaveBeenCalled();
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('prompts with the quoted caretaker note when exactly 1 note is found and proceeds if confirmed', async () => {
      mockComments(['caretaker note: please check X before merge']);
      const confirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);
      const pr = {...fakePullRequest, hasCaretakerNote: true};

      await mergeTool.checkCaretakerNoteConfirmation(pr);

      expect(pr.caretakerNote).toBe('caretaker note: please check X before merge');
      expect(confirmSpy).toHaveBeenCalledWith({
        message:
          red('Pull request has a caretaker note applied. Please make sure you read it:') +
          '\n\n> caretaker note: please check X before merge\n\nDo you want to proceed merging?',
      });
    });

    it('throws UserAbortedMergeToolError when prompt is denied with quoted note', async () => {
      mockComments(['caretaker note: please check X before merge']);
      spyOn(Prompt, 'confirm').and.resolveTo(false);
      const pr = {...fakePullRequest, hasCaretakerNote: true};

      await expectAsync(mergeTool.checkCaretakerNoteConfirmation(pr)).toBeRejectedWithError(
        UserAbortedMergeToolError,
      );
    });

    it('prompts with fallback url when no matching caretaker notes are found', async () => {
      mockComments(['LGTM!', 'Random comment']);
      const confirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);
      const pr = {...fakePullRequest, hasCaretakerNote: true};

      await mergeTool.checkCaretakerNoteConfirmation(pr);

      expect(pr.caretakerNote).toBeUndefined();
      expect(confirmSpy).toHaveBeenCalledWith({
        message:
          red('Pull request has a caretaker note applied. Please make sure you read it.') +
          `\nQuick link to PR: ${fakePullRequest.url}\nDo you want to proceed merging?`,
      });
    });

    it('prompts with fallback url when multiple matching caretaker notes are found', async () => {
      mockComments(['caretaker note: first', 'caretaker: second']);
      const confirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);
      const pr = {...fakePullRequest, hasCaretakerNote: true};

      await mergeTool.checkCaretakerNoteConfirmation(pr);

      expect(pr.caretakerNote).toBeUndefined();
      expect(confirmSpy).toHaveBeenCalledWith({
        message:
          red('Pull request has a caretaker note applied. Please make sure you read it.') +
          `\nQuick link to PR: ${fakePullRequest.url}\nDo you want to proceed merging?`,
      });
    });

    it('prompts with fallback url when fetching comments fails', async () => {
      graphqlSpy.and.rejectWith(new Error('Network error'));
      const confirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);
      const pr = {...fakePullRequest, hasCaretakerNote: true};

      await mergeTool.checkCaretakerNoteConfirmation(pr);

      expect(pr.caretakerNote).toBeUndefined();
      expect(confirmSpy).toHaveBeenCalledWith({
        message:
          red('Pull request has a caretaker note applied. Please make sure you read it.') +
          `\nQuick link to PR: ${fakePullRequest.url}\nDo you want to proceed merging?`,
      });
    });
  });

  describe('mergeMany', () => {
    function createFakePr(prNumber: number, overrides: Partial<PullRequest> = {}): PullRequest {
      return {
        url: `https://github.com/angular/angular/pull/${prNumber}`,
        prNumber,
        title: `test: PR #${prNumber}`,
        labels: [],
        targetBranches: ['main'],
        githubTargetBranch: 'main',
        commitCount: 1,
        needsCommitMessageFixup: false,
        hasCaretakerNote: false,
        baseSha: 'abc',
        revisionRange: 'abc..def',
        validationFailures: [],
        headSha: 'def',
        closingIssuesReferences: [],
        ...overrides,
      };
    }

    class MockMergeStrategy extends MergeStrategy {
      prepareSpy = jasmine.createSpy('prepare').and.resolveTo();
      checkSpy = jasmine.createSpy('check').and.resolveTo();
      mergeSpy = jasmine.createSpy('merge').and.resolveTo();
      cleanupSpy = jasmine.createSpy('cleanup').and.resolveTo();

      override async prepare(pr: PullRequest) {
        return this.prepareSpy(pr);
      }
      override async check(pr: PullRequest) {
        return this.checkSpy(pr);
      }
      override async merge(pr: PullRequest) {
        return this.mergeSpy(pr);
      }
      override async cleanup(pr: PullRequest) {
        return this.cleanupSpy(pr);
      }
    }

    let mockStrategy: MockMergeStrategy;

    beforeEach(() => {
      mergeTool = new MergeTool(fakeConfig, git, {branchPrompt: true, dryRun: false});
      mockStrategy = new MockMergeStrategy(git);
      spyOn(mergeTool, 'getMergeStrategy').and.returnValue(mockStrategy);
    });

    it('merges multiple pull requests successfully with a single confirmation prompt', async () => {
      const pr1 = createFakePr(123, {targetBranches: ['22.3.x', '23.0.x']});
      const pr2 = createFakePr(1234, {targetBranches: ['23.0.x']});

      spyOn(mergeTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        return prNum === 123 ? pr1 : pr2;
      });

      const confirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);
      const results = await mergeTool.mergeMany([123, 1234], {});

      // Exactly one confirmation prompt was shown
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(confirmSpy).toHaveBeenCalledWith({message: 'Do you want to proceed merging?'});

      // Both PRs were merged sequentially
      expect(mockStrategy.prepareSpy).toHaveBeenCalledWith(pr1);
      expect(mockStrategy.checkSpy).toHaveBeenCalledWith(pr1);
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr1);
      expect(mockStrategy.cleanupSpy).toHaveBeenCalledWith(pr1);

      expect(mockStrategy.prepareSpy).toHaveBeenCalledWith(pr2);
      expect(mockStrategy.checkSpy).toHaveBeenCalledWith(pr2);
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr2);
      expect(mockStrategy.cleanupSpy).toHaveBeenCalledWith(pr2);

      expect(results).toEqual([
        {prNumber: 123, status: 'success', targetBranches: ['22.3.x', '23.0.x']},
        {prNumber: 1234, status: 'success', targetBranches: ['23.0.x']},
      ]);
    });

    it('skips a PR with merge conflicts and continues merging subsequent PRs', async () => {
      const pr1 = createFakePr(1, {targetBranches: ['main']});
      const pr2 = createFakePr(2, {targetBranches: ['main']});
      const pr3 = createFakePr(3, {targetBranches: ['main']});

      spyOn(mergeTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        if (prNum === 1) return pr1;
        if (prNum === 2) return pr2;
        return pr3;
      });

      mockStrategy.checkSpy.and.callFake(async (pr: PullRequest) => {
        if (pr.prNumber === 2) {
          throw new MergeConflictsFatalError(['main']);
        }
      });

      spyOn(Prompt, 'confirm').and.resolveTo(true);
      const results = await mergeTool.mergeMany([1, 2, 3], {});

      // PR 1 succeeded
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr1);
      // PR 2 check threw conflict error, so mergeSpy was NOT called for PR 2
      expect(mockStrategy.mergeSpy).not.toHaveBeenCalledWith(pr2);
      // PR 3 still succeeded
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr3);

      // Cleanup was called for all 3 PRs
      expect(mockStrategy.cleanupSpy).toHaveBeenCalledWith(pr1);
      expect(mockStrategy.cleanupSpy).toHaveBeenCalledWith(pr2);
      expect(mockStrategy.cleanupSpy).toHaveBeenCalledWith(pr3);

      expect(results).toEqual([
        {prNumber: 1, status: 'success', targetBranches: ['main']},
        {
          prNumber: 2,
          status: 'failed',
          failureReason: 'Merge conflicts detected on target branches: main',
          targetBranches: ['main'],
        },
        {prNumber: 3, status: 'success', targetBranches: ['main']},
      ]);
    });

    it('aborts all merges when the user rejects the single confirmation prompt', async () => {
      const pr1 = createFakePr(123);
      const pr2 = createFakePr(1234);

      spyOn(mergeTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        return prNum === 123 ? pr1 : pr2;
      });

      spyOn(Prompt, 'confirm').and.resolveTo(false);

      await expectAsync(mergeTool.mergeMany([123, 1234], {})).toBeRejectedWithError(
        UserAbortedMergeToolError,
      );

      expect(mockStrategy.mergeSpy).not.toHaveBeenCalled();
    });

    it('rejects with FatalMergeToolError when forceManualBranches is used with multiple PRs', async () => {
      const manualTool = new MergeTool(fakeConfig, git, {
        forceManualBranches: true,
      });

      await expectAsync(manualTool.mergeMany([123, 1234], {})).toBeRejectedWithError(
        FatalMergeToolError,
        /Manual branch selection \(--force-manual-branches\) cannot be used when merging multiple pull requests\./,
      );
    });

    it('runs in dry run mode without prompting or calling strategy.merge', async () => {
      const dryRunTool = new MergeTool(fakeConfig, git, {dryRun: true});
      spyOn(dryRunTool, 'getMergeStrategy').and.returnValue(mockStrategy);

      const pr1 = createFakePr(123, {targetBranches: ['main']});
      const pr2 = createFakePr(1234, {targetBranches: ['23.0.x']});

      spyOn(dryRunTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        return prNum === 123 ? pr1 : pr2;
      });

      const confirmSpy = spyOn(Prompt, 'confirm');
      const results = await dryRunTool.mergeMany([123, 1234], {});

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockStrategy.checkSpy).toHaveBeenCalledWith(pr1);
      expect(mockStrategy.checkSpy).toHaveBeenCalledWith(pr2);
      expect(mockStrategy.mergeSpy).not.toHaveBeenCalled();

      expect(results).toEqual([
        {prNumber: 123, status: 'success', targetBranches: ['main']},
        {prNumber: 1234, status: 'success', targetBranches: ['23.0.x']},
      ]);
    });

    it('extracts caretaker notes in Phase 1 without prompting separately', async () => {
      const pr = createFakePr(123, {hasCaretakerNote: true});
      spyOn(mergeTool, 'loadAndValidatePullRequest').and.resolveTo(pr);
      const getNoteSpy = spyOn(mergeTool, 'getCaretakerNote').and.resolveTo(
        'caretaker note: remember this thing',
      );
      const confirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);

      const results = await mergeTool.mergeMany([123], {});

      expect(getNoteSpy).toHaveBeenCalledWith(pr);
      expect(pr.caretakerNote).toBe('caretaker note: remember this thing');
      // Only 1 confirmation prompt
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(results[0].status).toBe('success');
    });

    it('marks a PR with fatal validation failures as failed and allows valid PRs to merge', async () => {
      const pr1 = createFakePr(123, {
        validationFailures: [
          {
            message: 'PR is missing required approvals',
            canBeForceIgnored: false,
          } as any,
        ],
      });
      const pr2 = createFakePr(1234);

      spyOn(mergeTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        return prNum === 123 ? pr1 : pr2;
      });

      spyOn(Prompt, 'confirm').and.resolveTo(true);
      const results = await mergeTool.mergeMany([123, 1234], {});

      expect(mockStrategy.mergeSpy).not.toHaveBeenCalledWith(pr1);
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr2);

      expect(results).toEqual([
        {
          prNumber: 123,
          status: 'failed',
          failureReason: 'PR is missing required approvals',
        },
        {
          prNumber: 1234,
          status: 'success',
          targetBranches: ['main'],
        },
      ]);
    });

    it('permits non-fatal validation failures without prompting in Phase 1 and prompts once for the batch', async () => {
      const pr1 = createFakePr(123, {
        validationFailures: [
          {
            message: 'Pending status: "ci/angular: tests"',
            canBeForceIgnored: true,
          } as any,
        ],
      });
      const pr2 = createFakePr(1234);

      spyOn(mergeTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        return prNum === 123 ? pr1 : pr2;
      });

      const confirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);
      const results = await mergeTool.mergeMany([123, 1234], {});

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr1);
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr2);
      expect(results).toEqual([
        {prNumber: 123, status: 'success', targetBranches: ['main']},
        {prNumber: 1234, status: 'success', targetBranches: ['main']},
      ]);
    });

    it('re-throws UserAbortedMergeToolError when prompt is denied during Phase 1 forceManualBranches', async () => {
      const manualTool = new MergeTool(fakeConfig, git, {
        forceManualBranches: true,
      });
      const pr = createFakePr(123);
      spyOn(manualTool, 'loadAndValidatePullRequest').and.resolveTo(pr);
      spyOn(manualTool as any, 'updatePullRequestTargetedBranchesFromPrompt').and.rejectWith(
        new UserAbortedMergeToolError(),
      );

      await expectAsync(manualTool.mergeMany([123], {})).toBeRejectedWithError(
        UserAbortedMergeToolError,
      );
    });

    it('preserves the original input PR order in results even if some fail in Phase 1', async () => {
      const pr1 = createFakePr(100, {
        validationFailures: [
          {
            message: 'Fatal error',
            canBeForceIgnored: false,
          } as any,
        ],
      });
      const pr2 = createFakePr(200);

      spyOn(mergeTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        return prNum === 100 ? pr1 : pr2;
      });

      spyOn(Prompt, 'confirm').and.resolveTo(true);
      const results = await mergeTool.mergeMany([100, 200], {});

      expect(results.map((r) => r.prNumber)).toEqual([100, 200]);
    });

    it('delegates single PR merge() to mergeMany() and resolves on success', async () => {
      const pr = createFakePr(123);
      spyOn(mergeTool, 'loadAndValidatePullRequest').and.resolveTo(pr);
      spyOn(Prompt, 'confirm').and.resolveTo(true);

      await expectAsync(mergeTool.merge(123, {})).toBeResolved();
      expect(mockStrategy.mergeSpy).toHaveBeenCalledWith(pr);
    });

    it('delegates single PR merge() to mergeMany() and rejects on failure', async () => {
      const pr = createFakePr(123);
      spyOn(mergeTool, 'loadAndValidatePullRequest').and.resolveTo(pr);
      mockStrategy.checkSpy.and.rejectWith(new MergeConflictsFatalError(['main']));
      spyOn(Prompt, 'confirm').and.resolveTo(true);

      await expectAsync(mergeTool.merge(123, {})).toBeRejectedWithError(
        FatalMergeToolError,
        /Merge conflicts detected on target branches: main/,
      );
    });

    it('catches non-401 GithubApiError in Phase 1 and adds as a failure result', async () => {
      class RequestError extends Error {
        request = {method: 'GET', url: '', headers: {}};
        status = 404;
      }
      const apiError = new RequestError('Not Found');
      spyOn(mergeTool, 'loadAndValidatePullRequest').and.callFake(async (prNum) => {
        if (prNum === 100) {
          throw apiError;
        }
        return createFakePr(200);
      });

      spyOn(Prompt, 'confirm').and.resolveTo(true);
      const results = await mergeTool.mergeMany([100, 200], {});

      expect(results).toEqual([
        {
          prNumber: 100,
          status: 'failed',
          failureReason: 'Not Found',
        },
        {
          prNumber: 200,
          status: 'success',
          targetBranches: ['main'],
        },
      ]);
    });

    it('delegates single PR merge() to mergeMany() and rejects on validation failure', async () => {
      const pr = createFakePr(123, {
        validationFailures: [
          {
            message: 'Missing required approval',
            canBeForceIgnored: false,
          } as any,
        ],
      });
      spyOn(mergeTool, 'loadAndValidatePullRequest').and.resolveTo(pr);

      await expectAsync(mergeTool.merge(123, {})).toBeRejectedWithError(
        FatalMergeToolError,
        /Missing required approval/,
      );
    });

    it('cleans up in-flight rebase or cherry-pick in finally block on error', async () => {
      const pr = createFakePr(123);
      const runGracefulSpy = spyOn(git, 'runGraceful').and.returnValue({
        status: 0,
        stdout: '',
      } as any);
      spyOn(mergeTool, 'loadAndValidatePullRequest').and.resolveTo(pr);
      mockStrategy.checkSpy.and.rejectWith(new MergeConflictsFatalError(['main']));
      spyOn(Prompt, 'confirm').and.resolveTo(true);

      await mergeTool.mergeMany([123], {});

      expect(runGracefulSpy).toHaveBeenCalledWith(['rebase', '--abort']);
      expect(runGracefulSpy).toHaveBeenCalledWith(['cherry-pick', '--abort']);
      expect(runGracefulSpy).toHaveBeenCalledWith(['reset', '--hard']);
      expect(runGracefulSpy).toHaveBeenCalledWith(['checkout', '-f', 'main']);
      expect(mockStrategy.cleanupSpy).toHaveBeenCalledWith(pr);
    });
  });
});
