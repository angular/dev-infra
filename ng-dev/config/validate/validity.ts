/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertValidCommitMessageConfig} from '../../commit-message/config';
import {assertValidFormatConfig} from '../../format/config';
import {assertValidPullRequestConfig} from '../../pr/config';
import {assertValidReleaseConfig} from '../../release/config';
import {
  assertValidCaretakerConfig,
  assertValidGithubConfig,
  getConfig,
  NgDevConfig,
} from '../../utils/config';

export async function checkValidity() {
  const config = (await getConfig()) as NgDevConfig<{[key: string]: any}>;
  if (config['github']) {
    assertValidGithubConfig(config);
  }
  if (config['caretaker']) {
    assertValidCaretakerConfig(config);
  }
  if (config['commitMessage']) {
    assertValidCommitMessageConfig(config);
  }
  if (config['pullRequest']) {
    assertValidPullRequestConfig(config);
  }
  if (config['format']) {
    assertValidFormatConfig(config);
  }
  if (config['release']) {
    assertValidReleaseConfig(config);
  }
}
