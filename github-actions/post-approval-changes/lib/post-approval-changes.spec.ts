import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {utils} from '../../utils.js';
import {
  getGooglersOrgInstallationToken,
  postApprovalChangesMain,
  runPostApprovalChangesAction,
} from './post-approval-changes.js';

describe('post-approval-changes', () => {
  let mockRepoClient: jasmine.SpyObj<Octokit>;
  let mockGooglersClient: jasmine.SpyObj<Octokit>;
  let getAuthTokenForSpy: jasmine.Spy;
  let revokeTokenSpy: jasmine.Spy;
  let stdoutWriteSpy: jasmine.Spy;
  let requestReviewersSpy: jasmine.Spy;
  let paginateSpy: jasmine.Spy;

  beforeEach(() => {
    // Set standard context
    process.env['GITHUB_REPOSITORY'] = 'angular/angular';
    context.eventName = 'pull_request_target';
    (context as any).actor = 'external-user';
    (context as any).payload = {
      action: 'synchronize',
      pull_request: {
        number: 123,
        head: {sha: 'fresh-head-sha'},
        requested_reviewers: [],
        requested_teams: [],
        user: {login: 'external-user'},
      },
    };

    mockRepoClient = jasmine.createSpyObj('Octokit', ['paginate', 'pulls']);
    mockRepoClient.pulls = jasmine.createSpyObj('pulls', ['listReviews', 'requestReviewers']);
    requestReviewersSpy = (
      mockRepoClient.pulls.requestReviewers as unknown as jasmine.Spy
    ).and.resolveTo({});
    paginateSpy = (mockRepoClient.paginate as jasmine.Spy).and.callFake((fn: any) => {
      if (fn === mockRepoClient.pulls.listReviews) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    mockGooglersClient = jasmine.createSpyObj('Octokit', ['orgs']);

    spyOn(utils, 'isGooglerOrgMember').and.callFake(async (user: string) => {
      return user.startsWith('googler');
    });
    getAuthTokenForSpy = spyOn(utils, 'getAuthTokenFor').and.resolveTo('fake-token');
    revokeTokenSpy = spyOn(utils, 'revokeActiveInstallationToken').and.resolveTo();
    stdoutWriteSpy = spyOn(process.stdout, 'write').and.callThrough();
  });

  describe('review deduplication', () => {
    it('should ignore trailing COMMENTED reviews and re-request review on stale approval', async () => {
      // Reviewer googler-a approved at old-sha, then left a comment at old-sha.
      // PR head is now fresh-head-sha.
      paginateSpy.and.resolveTo([
        {
          id: 1,
          user: {login: 'googler-a'},
          state: 'APPROVED',
          commit_id: 'old-sha',
        },
        {
          id: 2,
          user: {login: 'googler-a'},
          state: 'COMMENTED',
          commit_id: 'old-sha',
        },
      ]);

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reviewers: ['googler-a'],
        }),
      );
    });

    it('should pass check if approval matches current head SHA even if followed by COMMENTED', async () => {
      paginateSpy.and.resolveTo([
        {
          id: 1,
          user: {login: 'googler-a'},
          state: 'APPROVED',
          commit_id: 'fresh-head-sha',
        },
        {
          id: 2,
          user: {login: 'googler-a'},
          state: 'COMMENTED',
          commit_id: 'fresh-head-sha',
        },
      ]);

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).not.toHaveBeenCalled();
      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        jasmine.stringContaining(
          'Passing check as at least one reviews is for the latest commit on the pull request',
        ),
      );
    });

    it('should halt check if reviewer latest actionable state is CHANGES_REQUESTED', async () => {
      paginateSpy.and.resolveTo([
        {
          id: 1,
          user: {login: 'googler-a'},
          state: 'APPROVED',
          commit_id: 'old-sha',
        },
        {
          id: 2,
          user: {login: 'googler-a'},
          state: 'CHANGES_REQUESTED',
          commit_id: 'old-sha',
        },
      ]);

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).not.toHaveBeenCalled();
      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Skipping check as there are still non-approved review states.'),
      );
    });
  });

  describe('reopen event commit freshness', () => {
    it('should enforce commit freshness on reopened event even if reopened by a Googler', async () => {
      // Reopened by a Googler actor
      (context as any).actor = 'googler-reopener';
      (context as any).payload = {
        action: 'reopened',
        pull_request: {
          number: 123,
          head: {sha: 'unreviewed-sha-after-reopen'},
          requested_reviewers: [],
          requested_teams: [],
          user: {login: 'external-user'},
        },
      };

      paginateSpy.and.resolveTo([
        {
          id: 1,
          user: {login: 'googler-alice'},
          state: 'APPROVED',
          commit_id: 'stale-sha-before-close',
        },
      ]);

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reviewers: ['googler-alice'],
        }),
      );
    });

    it('should pass check on reopened event if approval is fresh', async () => {
      (context as any).actor = 'googler-reopener';
      (context as any).payload = {
        action: 'reopened',
        pull_request: {
          number: 123,
          head: {sha: 'reviewed-sha'},
          requested_reviewers: [],
          requested_teams: [],
          user: {login: 'external-user'},
        },
      };

      paginateSpy.and.resolveTo([
        {
          id: 1,
          user: {login: 'googler-alice'},
          state: 'APPROVED',
          commit_id: 'reviewed-sha',
        },
      ]);

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).not.toHaveBeenCalled();
      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        jasmine.stringContaining(
          'Passing check as at least one reviews is for the latest commit on the pull request',
        ),
      );
    });

    it('should still skip check for synchronize event when actor is a Googler', async () => {
      (context as any).actor = 'googler-pusher';
      (context as any).payload = {
        action: 'synchronize',
        pull_request: {
          number: 123,
          head: {sha: 'some-sha'},
          requested_reviewers: [],
          requested_teams: [],
          user: {login: 'external-user'},
        },
      };

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).not.toHaveBeenCalled();
      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        jasmine.stringContaining(
          'Action performed by an account in the Googler Github Org, skipping as post approval changes are allowed.',
        ),
      );
    });
  });

  describe('re-request all stale approvers', () => {
    it('should re-request all approvers when multiple Googlers have stale approvals', async () => {
      paginateSpy.and.resolveTo([
        {
          id: 1,
          user: {login: 'googler-a'},
          state: 'APPROVED',
          commit_id: 'old-sha',
        },
        {
          id: 2,
          user: {login: 'googler-b'},
          state: 'APPROVED',
          commit_id: 'old-sha',
        },
      ]);

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reviewers: jasmine.arrayWithExactContents(['googler-a', 'googler-b']),
        }),
      );
    });

    it('should exclude the PR author from the re-requested reviewers', async () => {
      (context as any).payload.pull_request.user = {login: 'googler-a'};

      paginateSpy.and.resolveTo([
        {
          id: 1,
          user: {login: 'googler-a'},
          state: 'APPROVED',
          commit_id: 'old-sha',
        },
        {
          id: 2,
          user: {login: 'googler-b'},
          state: 'APPROVED',
          commit_id: 'old-sha',
        },
      ]);

      await runPostApprovalChangesAction(mockGooglersClient, mockRepoClient);

      expect(requestReviewersSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reviewers: ['googler-b'],
        }),
      );
    });
  });

  describe('fail-closed on token error', () => {
    it('should propagate rejection when getGooglersOrgInstallationToken fails', async () => {
      getAuthTokenForSpy.and.callFake(async (_app: any, target: any) => {
        if (target.org === 'googlers') {
          throw new Error('Failed to get installation token for googlers');
        }
        return 'repo-token';
      });

      await expectAsync(getGooglersOrgInstallationToken()).toBeRejectedWithError(
        /Failed to get installation token for googlers/,
      );
    });

    it('should fail closed in postApprovalChangesMain and revoke repo token if googlers token fails', async () => {
      getAuthTokenForSpy.and.callFake(async (_app: any, target: any) => {
        if (target.org === 'googlers') {
          throw new Error('500 Internal Server Error');
        }
        return 'repo-token';
      });

      // postApprovalChangesMain throws the error to be caught by main()'s outer handler
      await expectAsync(postApprovalChangesMain()).toBeRejectedWithError(
        /500 Internal Server Error/,
      );

      // Verify that repo token was properly revoked in finally block
      expect(revokeTokenSpy).toHaveBeenCalled();
    });

    it('should still revoke repo token if revoking googlers org token throws', async () => {
      (context as any).actor = 'googler-pusher';
      let callCount = 0;
      revokeTokenSpy.and.callFake(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Failed to revoke googlers token');
        }
      });

      await postApprovalChangesMain();

      expect(revokeTokenSpy).toHaveBeenCalledTimes(2);
    });
  });
});
