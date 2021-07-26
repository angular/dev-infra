/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Imports
import * as utilConfig from '../utils/config';

import {validateCommitMessage} from './validate';


// Constants
const config = {
  'commitMessage': {
    'maxLineLength': 120,
    'minBodyLength': 0,
    'types': [
      'feat',
      'fix',
      'refactor',
      'release',
      'style',
    ],
    'scopes': [
      'common',
      'compiler',
      'core',
      'packaging',
    ]
  }
};
const TYPES = config.commitMessage.types.join(', ');
const SCOPES = config.commitMessage.scopes.join(', ');
const INVALID = false;
const VALID = true;

// TODO(josephperrott): Clean up tests to test script rather than for
// specific commit messages we want to use.
describe('validate-commit-message.js', () => {
  let lastError: string = '';

  beforeEach(() => {
    lastError = '';

    spyOn(console, 'error').and.callFake((msg: string) => lastError = msg);
    spyOn(utilConfig, 'getAngularDevConfig').and.returnValue(config);
  });

  describe('validateMessage()', () => {
    it('should be valid', () => {
      expect(validateCommitMessage('feat(packaging): something')).toBe(VALID);
      expect(lastError).toBe('');

      expect(validateCommitMessage('release(packaging): something')).toBe(VALID);
      expect(lastError).toBe('');

      expect(validateCommitMessage('fixup! release(packaging): something')).toBe(VALID);
      expect(lastError).toBe('');

      expect(validateCommitMessage('squash! release(packaging): something')).toBe(VALID);
      expect(lastError).toBe('');

      expect(validateCommitMessage('Revert: "release(packaging): something"')).toBe(VALID);
      expect(lastError).toBe('');
    });

    it('should validate max length', () => {
      const msg =
          'fix(compiler): something super mega extra giga tera long, maybe even longer and longer and longer and longer and longer and longer...';

      expect(validateCommitMessage(msg)).toBe(INVALID);
      expect(lastError).toContain(`The commit message header is longer than ${
          config.commitMessage.maxLineLength} characters`);
    });

    it('should validate "<type>(<scope>): <subject>" format', () => {
      const msg = 'not correct format';

      expect(validateCommitMessage(msg)).toBe(INVALID);
      expect(lastError).toContain(`The commit message header does not match the expected format.`);
    });

    it('should fail when type is invalid', () => {
      const msg = 'weird(core): something';

      expect(validateCommitMessage(msg)).toBe(INVALID);
      expect(lastError).toContain(`'weird' is not an allowed type.\n => TYPES: ${TYPES}`);
    });

    it('should fail when scope is invalid', () => {
      const errorMessageFor = (scope: string, header: string) =>
          `'${scope}' is not an allowed scope.\n => SCOPES: ${SCOPES}`;

      expect(validateCommitMessage('fix(Compiler): something')).toBe(INVALID);
      expect(lastError).toContain(errorMessageFor('Compiler', 'fix(Compiler): something'));

      expect(validateCommitMessage('feat(bah): something')).toBe(INVALID);
      expect(lastError).toContain(errorMessageFor('bah', 'feat(bah): something'));

      expect(validateCommitMessage('style(webworker): something')).toBe(INVALID);
      expect(lastError).toContain(errorMessageFor('webworker', 'style(webworker): something'));

      expect(validateCommitMessage('refactor(security): something')).toBe(INVALID);
      expect(lastError).toContain(errorMessageFor('security', 'refactor(security): something'));

      expect(validateCommitMessage('refactor(docs): something')).toBe(INVALID);
      expect(lastError).toContain(errorMessageFor('docs', 'refactor(docs): something'));

      expect(validateCommitMessage('release(angular): something')).toBe(INVALID);
      expect(lastError).toContain(errorMessageFor('angular', 'release(angular): something'));
    });

    it('should allow empty scope', () => {
      expect(validateCommitMessage('fix: blablabla')).toBe(VALID);
      expect(lastError).toBe('');
    });

    // We do not want to allow WIP. It is OK to fail the PR build in this case to show that there is
    // work still to be done (i.e. fixing the commit message).
    it('should not allow "WIP: ..." syntax', () => {
      const msg = 'WIP: fix: something';

      expect(validateCommitMessage(msg)).toBe(INVALID);
      expect(lastError).toContain(`'WIP' is not an allowed type.\n => TYPES: ${TYPES}`);
    });

    describe('(revert)', () => {
      it('should allow valid "revert: ..." syntaxes', () => {
        expect(validateCommitMessage('revert: anything')).toBe(VALID);
        expect(lastError).toBe('');

        expect(validateCommitMessage('Revert: "anything"')).toBe(VALID);
        expect(lastError).toBe('');

        expect(validateCommitMessage('revert anything')).toBe(VALID);
        expect(lastError).toBe('');

        expect(validateCommitMessage('rEvErT anything')).toBe(VALID);
        expect(lastError).toBe('');
      });

      it('should not allow "revert(scope): ..." syntax', () => {
        const msg = 'revert(compiler): reduce generated code payload size by 65%';

        expect(validateCommitMessage(msg)).toBe(INVALID);
        expect(lastError).toContain(`'revert' is not an allowed type.\n => TYPES: ${TYPES}`);
      });

      // https://github.com/angular/angular/issues/23479
      it('should allow typical Angular messages generated by git', () => {
        const msg =
            'Revert "fix(compiler): Pretty print object instead of [Object object] (#22689)" (#23442)';

        expect(validateCommitMessage(msg)).toBe(VALID);
        expect(lastError).toBe('');
      });
    });

    describe('(squash)', () => {
      it('should strip the `squash! ` prefix and validate the rest', () => {
        const errorMessage = `The commit message header does not match the expected format.`;

        // Valid messages.
        expect(validateCommitMessage('squash! feat(core): add feature')).toBe(VALID);
        expect(validateCommitMessage('squash! fix: a bug', {disallowSquash: false})).toBe(VALID);

        // Invalid messages.
        expect(validateCommitMessage('squash! fix a typo', {disallowSquash: false})).toBe(INVALID);
        expect(lastError).toContain('squash! fix a typo');
        expect(lastError).toContain(errorMessage);

        expect(validateCommitMessage('squash! squash! fix: a bug')).toBe(INVALID);
        expect(lastError).toContain('squash! squash! fix: a bug');
        expect(lastError).toContain(errorMessage);
      });

      describe('with `disallowSquash`', () => {
        it('should fail', () => {
          expect(validateCommitMessage('fix(core): something', {disallowSquash: true})).toBe(VALID);
          expect(validateCommitMessage('squash! fix(core): something', {
            disallowSquash: true
          })).toBe(INVALID);
          expect(lastError).toContain(
              'The commit must be manually squashed into the target commit');
        });
      });
    });

    describe('(fixup)', () => {
      describe('without `nonFixupCommitHeaders`', () => {
        it('should strip the `fixup! ` prefix and validate the rest', () => {
          const errorMessage = `The commit message header does not match the expected format.`;

          // Valid messages.
          expect(validateCommitMessage('fixup! feat(core): add feature')).toBe(VALID);
          expect(validateCommitMessage('fixup! fix: a bug')).toBe(VALID);

          // Invalid messages.
          expect(validateCommitMessage('fixup! fix a typo')).toBe(INVALID);
          expect(lastError).toContain('fixup! fix a typo');
          expect(lastError).toContain(errorMessage);

          expect(validateCommitMessage('fixup! fixup! fix: a bug')).toBe(INVALID);
          expect(lastError).toContain('fixup! fixup! fix: a bug');
          expect(lastError).toContain(errorMessage);
        });
      });

      describe('with `nonFixupCommitHeaders`', () => {
        it('should check that the fixup commit matches a non-fixup one', () => {
          const msg = 'fixup! foo';

          expect(validateCommitMessage(
                     msg, {disallowSquash: false, nonFixupCommitHeaders: ['foo', 'bar', 'baz']}))
              .toBe(VALID);
          expect(validateCommitMessage(
                     msg, {disallowSquash: false, nonFixupCommitHeaders: ['bar', 'baz', 'foo']}))
              .toBe(VALID);
          expect(validateCommitMessage(
                     msg, {disallowSquash: false, nonFixupCommitHeaders: ['baz', 'foo', 'bar']}))
              .toBe(VALID);

          expect(validateCommitMessage(
                     msg, {disallowSquash: false, nonFixupCommitHeaders: ['qux', 'quux', 'quuux']}))
              .toBe(INVALID);
          expect(lastError).toContain(
              'Unable to find match for fixup commit among prior commits: \n' +
              '      qux\n' +
              '      quux\n' +
              '      quuux');
        });

        it('should fail if `nonFixupCommitHeaders` is empty', () => {
          expect(validateCommitMessage('refactor(core): make reactive', {
            disallowSquash: false,
            nonFixupCommitHeaders: []
          })).toBe(VALID);
          expect(validateCommitMessage(
                     'fixup! foo', {disallowSquash: false, nonFixupCommitHeaders: []}))
              .toBe(INVALID);
          expect(lastError).toContain(
              `Unable to find match for fixup commit among prior commits: -`);
        });
      });
    });
  });
});
