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
import {UserAbortedMergeToolError} from './failures.js';
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
});
