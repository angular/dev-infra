/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {MismatchedPullRequestHeadShaFatalError} from '../failures.js';
import {PullRequest} from '../pull-request.js';
import {MergeStrategy, TEMP_PR_HEAD_BRANCH} from './strategy.js';

/** Minimal concrete strategy so the abstract base's `prepare` can be exercised. */
class TestMergeStrategy extends MergeStrategy {
  override async merge(): Promise<void> {}
}

/** Builds a `PullRequest` with only the fields `prepare` relies on. */
function createPullRequest(headSha: string): PullRequest {
  return {
    prNumber: 123,
    headSha,
    targetBranches: ['main'],
  } as unknown as PullRequest;
}

describe('MergeStrategy#prepare', () => {
  let gitClient: jasmine.SpyObj<AuthenticatedGitClient>;

  beforeEach(() => {
    gitClient = jasmine.createSpyObj<AuthenticatedGitClient>('git', ['run', 'getRepoGitUrl']);
    gitClient.getRepoGitUrl.and.returnValue('https://github.com/angular/angular.git');
  });

  /** Makes `git rev-parse merge_pr_head` resolve to `fetchedHeadSha`. */
  function stubFetchedHead(fetchedHeadSha: string): void {
    gitClient.run.and.callFake((args: string[]) => {
      if (args[0] === 'rev-parse' && args[1] === TEMP_PR_HEAD_BRANCH) {
        return {stdout: `${fetchedHeadSha}\n`} as ReturnType<AuthenticatedGitClient['run']>;
      }
      return {stdout: ''} as ReturnType<AuthenticatedGitClient['run']>;
    });
  }

  it('rejects when the fetched PR head no longer matches the validated head SHA', async () => {
    // The PR was validated at `validated-sha`, but `pull/<n>/head` now points at a commit
    // the author pushed after validation. Merging it would land unreviewed code.
    stubFetchedHead('pushed-after-validation-sha');

    await expectAsync(
      new TestMergeStrategy(gitClient).prepare(createPullRequest('validated-sha')),
    ).toBeRejectedWithError(MismatchedPullRequestHeadShaFatalError);
  });

  it('resolves when the fetched PR head matches the validated head SHA', async () => {
    stubFetchedHead('validated-sha');

    await expectAsync(
      new TestMergeStrategy(gitClient).prepare(createPullRequest('validated-sha')),
    ).toBeResolved();
  });
});
