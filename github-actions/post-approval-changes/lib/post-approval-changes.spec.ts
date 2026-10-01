import {context} from '@actions/github';
import * as core from '@actions/core';
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
  let isGooglerOrgMemberSpy: jasmine.Spy;
  let getAuthTokenForSpy: jasmine.Spy;
  let revokeTokenSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let requestReviewersSpy: jasmine.Spy;
  let paginateSpy: jasmine.Spy;

  beforeEach(() => {
    // Set standard context
    context.eventName = 'pull_request_target';
    (context as any).actor = 'external-user';
    (context as any).repo = {owner: 'angular', repo: 'angular'};
    (context as any).issue = {owner: 'angular', repo: 'angular', number: 123};
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
    requestReviewersSpy = (mockRepoClient.pulls.requestReviewers as jasmine.Spy).and.resolveTo({});
    paginateSpy = (mockRepoClient.paginate as jasmine.Spy).and.callFake((fn: any) => {
      if (fn === mockRepoClient.pulls.listReviews) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    mockGooglersClient = jasmine.createSpyObj('Octokit', ['orgs']);

    isGooglerOrgMemberSpy = spyOn(utils, 'isGooglerOrgMember').and.callFake(
      async (user: string) => {
        return user.startsWith('googler');
      },
    );
    getAuthTokenForSpy = spyOn(utils, 'getAuthTokenFor').and.resolveTo('fake-token');
    revokeTokenSpy = spyOn(utils, 'revokeActiveInstallationToken').and.resolveTo();
    infoSpy = spyOn(core, 'info');
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
      expect(infoSpy).toHaveBeenCalledWith(
        'Passing check as at least one reviews is for the latest commit on the pull request',
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
      expect(infoSpy).toHaveBeenCalledWith(
        'Skipping check as there are still non-approved review states.',
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
      expect(infoSpy).toHaveBeenCalledWith(
        'Passing check as at least one reviews is for the latest commit on the pull request',
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
      expect(infoSpy).toHaveBeenCalledWith(
        'Action performed by an account in the Googler Github Org, skipping as post approval changes are allowed.',
      );
    });
  });
});
