/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitFromGitLog, parseCommitMessage} from './parse.js';
import {commitMessageBuilder, CommitMessageParts} from './test-util.js';

const commitValues: CommitMessageParts = {
  prefix: '',
  type: 'fix',
  scope: 'changed-area',
  summary: 'This is a short summary of the change',
  body: 'This is a longer description of the change',
  footer: 'Closes #1',
};

const buildCommitMessage = commitMessageBuilder(commitValues);

describe('commit message parsing:', () => {
  describe('parses the scope', () => {
    it('when only a scope is defined', () => {
      const message = buildCommitMessage();
      expect(parseCommitMessage(message).scope).toBe(commitValues.scope);
    });
  });

  it('parses the type', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).type).toBe(commitValues.type);
  });

  it('parses the header', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).header).toBe(
      `${commitValues.type}(${commitValues.scope}): ${commitValues.summary}`,
    );
  });

  it('parses the body', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).body).toBe(commitValues.body);
  });

  it('parses the subject', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).subject).toBe(commitValues.summary);
  });

  it('identifies if a commit is a fixup', () => {
    const message1 = buildCommitMessage();
    expect(parseCommitMessage(message1).isFixup).toBe(false);

    const message2 = buildCommitMessage({prefix: 'fixup! '});
    expect(parseCommitMessage(message2).isFixup).toBe(true);
  });

  it('identifies if a commit is a revert', () => {
    const message1 = buildCommitMessage();
    expect(parseCommitMessage(message1).isRevert).toBe(false);

    const message2 = buildCommitMessage({prefix: 'revert: '});
    expect(parseCommitMessage(message2).isRevert).toBe(true);

    const message3 = buildCommitMessage({prefix: 'revert '});
    expect(parseCommitMessage(message3).isRevert).toBe(true);
  });

  it('identifies if a commit is a squash', () => {
    const message1 = buildCommitMessage();
    expect(parseCommitMessage(message1).isSquash).toBe(false);

    const message2 = buildCommitMessage({prefix: 'squash! '});
    expect(parseCommitMessage(message2).isSquash).toBe(true);
  });

  it('ignores comment lines', () => {
    const message = buildCommitMessage({
      prefix:
        '# This is a comment line before the header.\n' +
        '## This is another comment line before the headers.\n',
      body:
        '# This is a comment line befor the body.\n' +
        'This is line 1 of the actual body.\n' +
        '## This is another comment line inside the body.\n' +
        'This is line 2 of the actual body (and it also contains a # but it not a comment).\n' +
        '### This is yet another comment line after the body.\n',
    });
    const parsedMessage = parseCommitMessage(message);

    expect(parsedMessage.header).toBe(
      `${commitValues.type}(${commitValues.scope}): ${commitValues.summary}`,
    );
    expect(parsedMessage.body).toBe(
      'This is line 1 of the actual body.\n' +
        'This is line 2 of the actual body (and it also contains a # but it not a comment).',
    );
  });

  describe('parses breaking change notes', () => {
    const summary = 'This breaks things';
    const description = 'This is how it breaks things.';

    it('when only a summary is provided', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE: ${summary}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(summary);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });

    it('when only a description is provided', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE:\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(description);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });

    it('when a summary and description are provied', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE: ${summary}\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(`${summary}\n\n${description}`);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });

    it('only when keyword is at the beginning of a line', () => {
      const message = buildCommitMessage({
        body:
          'This changes how the `BREAKING CHANGE: ` commit message note\n' +
          'keyword is detected for the changelog.',
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges.length).toBe(0);
    });
  });

  describe('parses deprecation notes', () => {
    const summary = 'This will break things later';
    const description = 'This is a long winded explanation of why it \nwill break things later.';

    it('when only a summary is provided', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED: ${summary}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(summary);
      expect(parsedMessage.deprecations.length).toBe(1);
    });

    it('when only a description is provided', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED:\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(description);
      expect(parsedMessage.deprecations.length).toBe(1);
    });

    it('when a summary and description are provied', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED: ${summary}\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(`${summary}\n\n${description}`);
      expect(parsedMessage.deprecations.length).toBe(1);
    });

    it('only when keyword is at the beginning of a line', () => {
      const message = buildCommitMessage({
        body:
          'This changes how the `DEPRECATED: ` commit message note\n' +
          'keyword is detected for the changelog.',
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations.length).toBe(0);
    });
  });

  describe('parses git log metadata', () => {
    it('extracts trailing hash, shortHash, and author fields', () => {
      const rawLog =
        buildCommitMessage() +
        '\n-hash-\n0123456789abcdef0123456789abcdef01234567' +
        '\n-shortHash-\n0123456' +
        '\n-author-\nReal Author';
      const parsed = parseCommitFromGitLog(rawLog);
      expect(parsed.hash).toBe('0123456789abcdef0123456789abcdef01234567');
      expect(parsed.shortHash).toBe('0123456');
      expect(parsed.author).toBe('Real Author');
      expect(parsed.body).toBe(commitValues.body);
      expect(parsed.footer).toBe(commitValues.footer);
    });

    it('prevents commit body metadata smuggling and scissor truncation', () => {
      const smuggledBody =
        'Legitimate body text\n' +
        '-hash-\n' +
        'spoofed-hash\n' +
        '-shortHash-\n' +
        'spoofed](https://evil.example) [\n' +
        '-author-\n' +
        'Spoofed Author\n' +
        '# ------------------------ >8 ------------------------';
      const rawLog =
        buildCommitMessage({body: smuggledBody, footer: ''}) +
        '\n-hash-\n0123456789abcdef0123456789abcdef01234567' +
        '\n-shortHash-\n0123456' +
        '\n-author-\nReal Author';
      const parsed = parseCommitFromGitLog(rawLog);
      expect(parsed.hash).toBe('0123456789abcdef0123456789abcdef01234567');
      expect(parsed.shortHash).toBe('0123456');
      expect(parsed.author).toBe('Real Author');
    });
  });
});
