#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Script that can be passed as commit message filter to `git filter-branch --msg-filter`.
 * The script rewrites commit messages to contain a Github instruction to close the
 * corresponding pull request. For more details. See: https://git.io/Jv64r.
 */

main();

function main() {
  const [prNumber] = process.argv.slice(2);
  if (!prNumber) {
    console.error('No pull request number specified.');
    process.exit(1);
  }

  let commitMessage = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      commitMessage += chunk;
    }
  });

  process.stdin.on('end', () => {
    console.info(rewriteCommitMessage(commitMessage, prNumber));
  });
}

function rewriteCommitMessage(message: string, prNumber: string) {
  const lines = message.split(/\n/);
  lines.push(`Closes #${prNumber} as a pr takeover`);
  return lines.join('\n');
}
