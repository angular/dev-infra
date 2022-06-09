import {ActiveReleaseTrains} from '../active-release-trains';
import {getNextBranchName, ReleaseRepoWithApi} from '../version-branches';
import {GithubClient} from '../../../utils/git/github';
import nock from 'nock';
import {matchesVersion} from '../../../utils/testing';
import {fakeGithubPaginationResponse} from '../../../utils/testing';
import {GithubConfig} from '../../../utils/config';

describe('active release train determination', () => {
  let api: GithubClient;
  let repo: ReleaseRepoWithApi;

  beforeEach(() => {
    setup({owner: 'angular', name: 'dev-infra-test', mainBranchName: 'master'});
  });

  afterEach(() => nock.cleanAll());

  /** Configures the test environment with the given github config. */
  function setup(config: GithubConfig) {
    api = new GithubClient();
    repo = {
      owner: config.owner,
      name: config.name,
      nextBranchName: getNextBranchName(config),
      api,
    };
  }

  /** Retrieves the Github API repo URL. */
  function getRepoApiRequestUrl(): string {
    return `https://api.github.com/repos/${repo.owner}/${repo.name}`;
  }

  /**
   * Mocks a branch `package.json` version API request.
   * https://docs.github.com/en/rest/reference/repos#get-repository-content.
   */
  function interceptBranchVersionRequest(branchName: string, version: string) {
    nock(getRepoApiRequestUrl())
      .get('/contents/%2Fpackage.json')
      .query((params) => params.ref === branchName)
      .reply(200, {content: Buffer.from(JSON.stringify({version})).toString('base64')});
  }

  /**
   * Mocks a repository branch list API request.
   * https://docs.github.com/en/rest/reference/repos#list-branches.
   */
  function interceptBranchesListRequest(branches: string[]) {
    nock(getRepoApiRequestUrl())
      .get('/branches')
      .query(true)
      .reply(
        200,
        branches.slice(0, 29).map((name) => ({name})),
      );
  }

  /**
   * Mocks a repository branch list API request with pagination.
   * https://docs.github.com/en/rest/guides/traversing-with-pagination.
   * https://docs.github.com/en/rest/reference/repos#list-branches.
   */
  function interceptBranchesListRequestWithPagination(branches: string[]) {
    fakeGithubPaginationResponse(
      `${getRepoApiRequestUrl()}/branches`,
      branches.map((name) => ({name})),
    );
  }

  it('should detect the next release train', async () => {
    interceptBranchVersionRequest('master', '10.1.0-next.1');
    interceptBranchVersionRequest('10.0.x', '10.0.1');
    interceptBranchesListRequest(['10.0.x', '9.5.x']);

    const active = await ActiveReleaseTrains.fetch(repo);
    expect(active.releaseCandidate).toBe(null);
    expect(active.next).toEqual(
      jasmine.objectContaining({
        branchName: 'master',
        version: matchesVersion('10.1.0-next.1'),
      }),
    );
  });

  it('should detect the next release train if a main branch is configured', async () => {
    setup({owner: 'angular', name: 'dev-infra-test', mainBranchName: 'main'});

    // Note: We keep the `master` branch to ensure the logic does not accidentally
    // pick up an older `master` branch if the `main` branch is configured.
    interceptBranchVersionRequest('master', '0.4.0-old-branch.1');
    interceptBranchVersionRequest('main', '10.1.0-next.1');
    interceptBranchVersionRequest('10.0.x', '10.0.1');
    interceptBranchesListRequest(['10.0.x', '9.5.x']);

    const active = await ActiveReleaseTrains.fetch(repo);
    expect(active.releaseCandidate).toBe(null);
    expect(active.next).toEqual(
      jasmine.objectContaining({
        branchName: 'main',
        version: matchesVersion('10.1.0-next.1'),
      }),
    );
  });

  it('should deal with branch pagination response from github', async () => {
    interceptBranchVersionRequest('master', '10.1.0-next.1');
    interceptBranchVersionRequest('10.0.x', '10.0.1');

    // Note: We add a few more branches here to ensure that branches API requests are
    // paginated properly. In Angular projects, there are usually many branches so that
    // pagination is ultimately needed to detect the active release trains.
    // See: https://github.com/angular/angular/commit/261b060fa168754db00248d1c5c9574bb19a72b4.
    interceptBranchesListRequestWithPagination(['8.4.x', '9.5.x', '10.0.x']);

    const active = await ActiveReleaseTrains.fetch(repo);
    expect(active.latest).toEqual(
      jasmine.objectContaining({
        branchName: '10.0.x',
        version: matchesVersion('10.0.1'),
      }),
    );
  });

  describe('without release-candidate/feature-freeze', () => {
    it('should detect the latest release train', async () => {
      interceptBranchVersionRequest('master', '10.1.0-next.1');
      interceptBranchVersionRequest('10.0.x', '10.0.1');
      interceptBranchesListRequest(['10.0.x']);

      const active = await ActiveReleaseTrains.fetch(repo);
      expect(active.releaseCandidate).toBe(null);
      expect(active.latest).toEqual(
        jasmine.objectContaining({
          branchName: '10.0.x',
          version: matchesVersion('10.0.1'),
        }),
      );
    });
  });

  describe('with release-candidate train', () => {
    it('should detect release-candidate train', async () => {
      interceptBranchVersionRequest('master', '10.2.0-next.1');
      interceptBranchVersionRequest('10.1.x', '10.1.0-rc.2');
      interceptBranchVersionRequest('10.0.x', '10.0.1');
      interceptBranchesListRequest(['10.1.x', '10.0.x']);

      const active = await ActiveReleaseTrains.fetch(repo);
      expect(active.releaseCandidate).toEqual(
        jasmine.objectContaining({
          branchName: '10.1.x',
          version: matchesVersion('10.1.0-rc.2'),
        }),
      );
    });

    it('should detect the latest release train', async () => {
      interceptBranchVersionRequest('master', '10.2.0-next.1');
      interceptBranchVersionRequest('10.1.x', '10.1.0-rc.2');
      interceptBranchVersionRequest('10.0.x', '10.0.1');
      interceptBranchesListRequest(['10.1.x', '10.0.x']);

      const active = await ActiveReleaseTrains.fetch(repo);
      expect(active.releaseCandidate).not.toBe(null);
      expect(active.latest).toEqual(
        jasmine.objectContaining({
          branchName: '10.0.x',
          version: matchesVersion('10.0.1'),
        }),
      );
    });
  });

  describe('with feature-freeze train', () => {
    it('should detect feature-freeze train', async () => {
      interceptBranchVersionRequest('master', '10.2.0-next.1');
      interceptBranchVersionRequest('10.1.x', '10.1.0-next.2');
      interceptBranchVersionRequest('10.0.x', '10.0.1');
      interceptBranchesListRequest(['10.1.x', '10.0.x']);

      const active = await ActiveReleaseTrains.fetch(repo);
      expect(active.releaseCandidate).toEqual(
        jasmine.objectContaining({
          branchName: '10.1.x',
          version: matchesVersion('10.1.0-next.2'),
        }),
      );
    });

    it('should detect the latest release train', async () => {
      interceptBranchVersionRequest('master', '10.2.0-next.1');
      interceptBranchVersionRequest('10.1.x', '10.1.0-next.2');
      interceptBranchVersionRequest('10.0.x', '10.0.1');
      interceptBranchesListRequest(['10.1.x', '10.0.x']);

      const active = await ActiveReleaseTrains.fetch(repo);
      expect(active.releaseCandidate).not.toBe(null);
      expect(active.latest).toEqual(
        jasmine.objectContaining({
          branchName: '10.0.x',
          version: matchesVersion('10.0.1'),
        }),
      );
    });
  });
});
