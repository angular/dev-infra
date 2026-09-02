/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {red, magenta} from '../../utils/logging.js';
import {PullRequestCommentsFromGithub} from '../common/fetch-pull-request.js';
import {
  CARETAKER_NOTE_COMMENT_REGEX,
  getCaretakerNoteFromComments,
  getCaretakerNotePromptMessage,
  getQuotedComment,
} from './messages.js';
import {PullRequest} from './pull-request.js';

describe('caretaker note prompt messages', () => {
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

  describe('CARETAKER_NOTE_COMMENT_REGEX', () => {
    it('should match comments beginning with "caretaker:" (case-insensitive)', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Caretaker: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('CARETAKER: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker:do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker : do something')).toBeTrue();
    });

    it('should match comments beginning with "caretaker note:" (case-insensitive)', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker note: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Caretaker Note: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Caretaker note: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('CARETAKER NOTE: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker note : do something')).toBeTrue();
    });

    it('should match comments beginning with "caretaker notes:" (case-insensitive)', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker notes: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Caretaker Notes: do something')).toBeTrue();
    });

    it('should match comments beginning with "caretaker-note:" or "caretaker-notes:"', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker-note: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretaker-notes: do something')).toBeTrue();
    });

    it('should match comments beginning with "note for caretaker:" or "note to caretaker:"', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Note for caretaker: green')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('note for caretaker: green')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Note to caretaker: green')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Notes for caretaker: green')).toBeTrue();
    });

    it('should match comments with typo quote instead of colon', () => {
      expect(
        CARETAKER_NOTE_COMMENT_REGEX.test('caretaker note" Presubmit failure is pre-existing'),
      ).toBeTrue();
    });

    it('should match comments with leading markdown formatting', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('**caretaker note:** do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('**caretaker:** do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('**caretaker note**: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('_caretaker note:_ do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('### Caretaker Note: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('## Caretaker note: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('[caretaker note]: do something')).toBeTrue();
    });

    it('should match comments with leading whitespace or newlines', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('  caretaker note: do something')).toBeTrue();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('\ncaretaker note: do something')).toBeTrue();
    });

    it('should not match comments that do not begin with caretaker note prefixes', () => {
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('LGTM')).toBeFalse();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('TESTED="blah"')).toBeFalse();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('Random comment: hello')).toBeFalse();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('This has a caretaker note: inside')).toBeFalse();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('caretakers are great')).toBeFalse();
      expect(CARETAKER_NOTE_COMMENT_REGEX.test('note for reviewer:')).toBeFalse();
    });
  });

  describe('getCaretakerNoteFromComments', () => {
    function createFakeComment(bodyText: string): PullRequestCommentsFromGithub {
      return {
        bodyText,
        author: {login: 'testuser'},
        authorAssociation: 'MEMBER' as any,
      };
    }

    it('should return null if there are no comments', () => {
      expect(getCaretakerNoteFromComments([])).toBeNull();
    });

    it('should return null if no comments match the caretaker note prefix', () => {
      const comments = [createFakeComment('LGTM'), createFakeComment('TESTED="manual"')];
      expect(getCaretakerNoteFromComments(comments)).toBeNull();
    });

    it('should return the comment body if exactly one matching comment is found', () => {
      const comments = [
        createFakeComment('LGTM'),
        createFakeComment('caretaker note: Please run TGP manually before merging.'),
        createFakeComment('Thanks!'),
      ];
      expect(getCaretakerNoteFromComments(comments)).toBe(
        'caretaker note: Please run TGP manually before merging.',
      );
    });

    it('should return null if multiple matching comments are found', () => {
      const comments = [
        createFakeComment('caretaker note: First note'),
        createFakeComment('caretaker: Second note'),
      ];
      expect(getCaretakerNoteFromComments(comments)).toBeNull();
    });

    it('should ignore comments with empty or nullish bodyText', () => {
      const comments = [
        createFakeComment(''),
        createFakeComment('caretaker note: Single valid note'),
      ];
      expect(getCaretakerNoteFromComments(comments)).toBe('caretaker note: Single valid note');
    });
  });

  describe('getQuotedComment', () => {
    it('should quote a single line comment', () => {
      expect(getQuotedComment('caretaker note: do not merge yet')).toBe(
        '> caretaker note: do not merge yet',
      );
    });

    it('should quote a multi-line comment', () => {
      const comment = 'caretaker note:\nPlease verify in google3\nThanks!';
      expect(getQuotedComment(comment)).toBe(
        '> caretaker note:\n> Please verify in google3\n> Thanks!',
      );
    });

    it('should handle blank lines in multi-line comments', () => {
      const comment = 'caretaker note:\n\nStep 1: check\nStep 2: merge';
      expect(getQuotedComment(comment)).toBe(
        '> caretaker note:\n>\n> Step 1: check\n> Step 2: merge',
      );
    });

    it('should trim leading and trailing whitespace and blank lines', () => {
      const comment = '\n\n  caretaker note: hello world  \n\n';
      expect(getQuotedComment(comment)).toBe('> caretaker note: hello world');
    });

    it('should handle Windows CRLF line endings', () => {
      const comment = 'caretaker note:\r\nLine 1\r\nLine 2';
      expect(getQuotedComment(comment)).toBe('> caretaker note:\n> Line 1\n> Line 2');
    });
  });

  describe('getCaretakerNotePromptMessage', () => {
    it('should surface the quoted comment when a caretaker note is provided', () => {
      const note = 'caretaker note:\nPlease hold off on merging until RC is out.';
      const message = getCaretakerNotePromptMessage(fakePullRequest, note);

      expect(message).toBe(
        red('Pull request has a caretaker note applied. Please make sure you read it:') +
          '\n\n' +
          magenta('> caretaker note:\n> Please hold off on merging until RC is out.') +
          '\n\nDo you want to proceed merging?',
      );
      // Ensure it does not point to the PR link
      expect(message).not.toContain('Quick link to PR:');
    });

    it('should use pullRequest.caretakerNote if set and parameter is omitted', () => {
      const prWithNote: PullRequest = {
        ...fakePullRequest,
        caretakerNote: 'caretaker: check this',
      };
      const message = getCaretakerNotePromptMessage(prWithNote);

      expect(message).toBe(
        red('Pull request has a caretaker note applied. Please make sure you read it:') +
          '\n\n' +
          magenta('> caretaker: check this') +
          '\n\nDo you want to proceed merging?',
      );
    });

    it("should keep today's behavior with quick link when no caretaker note is provided", () => {
      const message = getCaretakerNotePromptMessage(fakePullRequest);

      expect(message).toBe(
        red('Pull request has a caretaker note applied. Please make sure you read it.') +
          `\nQuick link to PR: ${fakePullRequest.url}\nDo you want to proceed merging?`,
      );
      expect(message).toContain(`Quick link to PR: ${fakePullRequest.url}`);
    });
  });
});
