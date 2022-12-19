import {ActiveReleaseTrains} from '../active-release-trains.js';
import {
  exceptionalMinorPackageIndicator,
  getNextBranchName,
  ReleaseRepoWithApi,
} from '../version-branches.js';
import {GithubClient} from '../../../utils/git/github.js';
import nock from 'nock';
import {fakeGithubPaginationResponse, matchesVersion} from '../../../utils/testing/index.js';
import {GithubConfig} from '../../../utils/config.js';
import {ReleaseTrain} from '../release-trains.js';

interface FakeBranch {
  name: string;
  version: string;
  isExceptionalMinor: boolean;
}

interface Scenario {
  name: string;
  branches: FakeBranch[];
  expected:
    | {
        next: jasmine.ObjectContaining<ReleaseTrain>;
        latest: jasmine.ObjectContaining<ReleaseTrain>;
        releaseCandidate: jasmine.ObjectContaining<ReleaseTrain> | null;
        exceptionalMinor: jasmine.ObjectContaining<ReleaseTrain> | null;
      }
    | RegExp;
}

const scenarios: Scenario[] = [
  {
    name: 'Basic scenario. Next minor in the works.',
    branches: [create('main', '14.4.0-next.10'), create('14.3.x', '14.3.2')],
    expected: {
      next: matchesTrain('main', '14.4.0-next.10'),
      latest: matchesTrain('14.3.x', '14.3.2'),
      releaseCandidate: null,
      exceptionalMinor: null,
    },
  },
  {
    name: 'Basic scenario. Next major in the works.',
    branches: [create('main', '15.0.0-next.1'), create('14.3.x', '14.3.2')],
    expected: {
      next: matchesTrain('main', '15.0.0-next.1'),
      latest: matchesTrain('14.3.x', '14.3.2'),
      releaseCandidate: null,
      exceptionalMinor: null,
    },
  },
  {
    name: 'Minor in feature-freeze, new minor as next train.',
    branches: [
      create('main', '15.2.0-next.2'),
      create('15.1.x', '15.1.0-next.1'),
      create('15.0.x', '15.0.2'),
    ],
    expected: {
      next: matchesTrain('main', '15.2.0-next.2'),
      releaseCandidate: matchesTrain('15.1.x', '15.1.0-next.1'),
      latest: matchesTrain('15.0.x', '15.0.2'),
      exceptionalMinor: null,
    },
  },
  {
    name: 'Major in feature-freeze, new minor as next train.',
    branches: [
      create('main', '15.1.0-next.2'),
      create('15.0.x', '15.0.0-next.1'),
      create('14.5.x', '14.5.6'),
    ],
    expected: {
      next: matchesTrain('main', '15.1.0-next.2'),
      releaseCandidate: matchesTrain('15.0.x', '15.0.0-next.1'),
      latest: matchesTrain('14.5.x', '14.5.6'),
      exceptionalMinor: null,
    },
  },
  {
    name: 'Minor in release-candidate, new minor as next train.',
    branches: [
      create('main', '15.2.0-next.2'),
      create('15.1.x', '15.1.0-rc.2'),
      create('15.0.x', '15.0.3'),
    ],
    expected: {
      next: matchesTrain('main', '15.2.0-next.2'),
      releaseCandidate: matchesTrain('15.1.x', '15.1.0-rc.2'),
      latest: matchesTrain('15.0.x', '15.0.3'),
      exceptionalMinor: null,
    },
  },
  {
    name: 'Major in release-candidate, new minor as next train.',
    branches: [
      create('main', '15.1.0-next.4'),
      create('15.0.x', '15.0.0-rc.3'),
      create('14.6.x', '14.6.0'),
    ],
    expected: {
      next: matchesTrain('main', '15.1.0-next.4'),
      releaseCandidate: matchesTrain('15.0.x', '15.0.0-rc.3'),
      latest: matchesTrain('14.6.x', '14.6.0'),
      exceptionalMinor: null,
    },
  },
  {
    name: 'Two majors in-progress at the same time',
    branches: [
      create('main', '16.0.0-next.4'),
      create('15.0.x', '15.0.0-rc.3'),
      create('14.6.x', '14.6.0'),
    ],
    expected: {
      next: matchesTrain('main', '16.0.0-next.4'),
      releaseCandidate: matchesTrain('15.0.x', '15.0.0-rc.3'),
      latest: matchesTrain('14.6.x', '14.6.0'),
      exceptionalMinor: null,
    },
  },
  {
    name: 'Major in feature-freeze & exceptional minor as `-next`',
    branches: [
      create('main', '15.1.0-next.4'),
      create('15.0.x', '15.0.0-next.3'),
      create('14.6.x', '14.6.0-next.0', {exceptionalMinor: true}),
      create('14.5.x', '14.5.4'),
    ],
    expected: {
      next: matchesTrain('main', '15.1.0-next.4'),
      releaseCandidate: matchesTrain('15.0.x', '15.0.0-next.3'),
      exceptionalMinor: matchesTrain('14.6.x', '14.6.0-next.0'),
      latest: matchesTrain('14.5.x', '14.5.4'),
    },
  },
  {
    name: 'Major in feature-freeze & exceptional minor in RC',
    branches: [
      create('main', '15.1.0-next.4'),
      create('15.0.x', '15.0.0-next.3'),
      create('14.6.x', '14.6.0-rc.1', {exceptionalMinor: true}),
      create('14.5.x', '14.5.4'),
    ],
    expected: {
      next: matchesTrain('main', '15.1.0-next.4'),
      releaseCandidate: matchesTrain('15.0.x', '15.0.0-next.3'),
      exceptionalMinor: matchesTrain('14.6.x', '14.6.0-rc.1'),
      latest: matchesTrain('14.5.x', '14.5.4'),
    },
  },
  {
    name: 'Major in the next train & exceptional minor',
    branches: [
      create('main', '15.0.0-next.4'),
      create('14.6.x', '14.6.0-next.3', {exceptionalMinor: true}),
      create('14.5.x', '14.5.4'),
    ],
    expected: {
      next: matchesTrain('main', '15.0.0-next.4'),
      // Technically an exceptional minor could be created and just be put into
      // the `rc/ff` train. Since we need a second train for exceptional minors
      // when a major is already in RC, we do not want to mismatch here. Exceptional
      // minors, when created, should always end up in their own dedicated train.
      releaseCandidate: null,
      exceptionalMinor: matchesTrain('14.6.x', '14.6.0-next.3'),
      latest: matchesTrain('14.5.x', '14.5.4'),
    },
  },
  {
    name: 'Major in the next train & exceptional minor in RC',
    branches: [
      create('main', '15.0.0-next.4'),
      create('14.6.x', '14.6.0-rc.1', {exceptionalMinor: true}),
      create('14.5.x', '14.5.4'),
    ],
    expected: {
      next: matchesTrain('main', '15.0.0-next.4'),
      // Technically an exceptional minor could be created and just be put into
      // the `rc/ff` train. Since we need a second train for exceptional minors
      // when a major is already in RC, we do not want to mismatch here. Exceptional
      // minors, when created, should always end up in their own dedicated train.
      releaseCandidate: null,
      exceptionalMinor: matchesTrain('14.6.x', '14.6.0-rc.1'),
      latest: matchesTrain('14.5.x', '14.5.4'),
    },
  },
  // ---
  // Special cases to test faulty setup:
  // ---
  {
    name: 'Basic scenario. Old `master` branch existing with older version',
    branches: [
      create('master', '5.0.0-next.10'),
      create('main', '14.4.0-next.10'),
      create('14.3.x', '14.3.2'),
    ],
    expected: {
      next: matchesTrain('main', '14.4.0-next.10'),
      latest: matchesTrain('14.3.x', '14.3.2'),
      releaseCandidate: null,
      exceptionalMinor: null,
    },
  },
  {
    name: 'Unexpected exceptional minor when no major is in-progress',
    branches: [
      create('main', '14.5.0-next.10'),
      create('14.4.x', '14.4.0-next.3', {exceptionalMinor: true}),
      create('14.3.x', '14.3.2'),
    ],
    expected: /Found an unexpected exceptional minor.+No exceptional minor is currently allowed/,
  },
  {
    name: 'Unexpected multiple release-candidates',
    branches: [
      create('main', '14.5.0-next.10'),
      create('14.4.x', '14.4.0-next.3'),
      create('14.3.x', '14.3.0-next.4'),
      create('14.2.x', '14.2.2'),
    ],
    expected: /there cannot be multiple feature-freeze\/release-candidate branches/,
  },
  {
    name: 'Unexpected multiple exceptional minors',
    branches: [
      create('main', '15.0.0-next.10'),
      create('14.4.x', '14.4.0-next.3', {exceptionalMinor: true}),
      create('14.3.x', '14.3.0-next.4', {exceptionalMinor: true}),
      create('14.2.x', '14.2.2'),
    ],
    expected: /Found an additional exceptional minor version branch:/,
  },
  {
    name: 'Unexpected order of exceptional minor. Exceptional minor is more recent than RC/FF',
    branches: [
      create('main', '15.0.0-next.10'),
      create('14.4.x', '14.4.0-next.3', {exceptionalMinor: true}),
      create('14.3.x', '14.3.0-next.4'),
      create('14.2.x', '14.2.2'),
    ],
    expected:
      /Discovered a feature-freeze\/release-candidate version branch.+is older than an in-progress exceptional minor \(14.4.x\)/,
  },
  {
    name: 'No patch branch found',
    branches: [create('main', '15.0.0-next.10'), create('14.3.x', '14.3.0-next.4')],
    expected:
      /Unable to determine the latest release-train. The following branches have been considered:/,
  },
  {
    name: 'Should not continue checking branches after found "latest" train.',
    branches: [
      create('main', '15.0.0-next.10'),
      create('14.3.x', '14.3.0'),
      // this is a broken branch- but should not be picked up incorrectly.
      create('14.2.x', '14.2.0-next.3'),
    ],
    expected: {
      next: matchesTrain('main', '15.0.0-next.10'),
      latest: matchesTrain('14.3.x', '14.3.0'),
      releaseCandidate: null,
      exceptionalMinor: null,
    },
  },
];

/** Creates a fake branch fixture. */
function create(
  branchName: string,
  version: string,
  opts?: {exceptionalMinor: boolean},
): FakeBranch {
  return {name: branchName, version, isExceptionalMinor: opts?.exceptionalMinor === true};
}

/** Creates a jasmine matcher for matching a release train. */
function matchesTrain(branchName: string, version: string): jasmine.ObjectContaining<ReleaseTrain> {
  return jasmine.objectContaining({
    branchName,
    version: matchesVersion(version),
  });
}

describe('active release train determination', () => {
  let api: GithubClient;
  let repo: ReleaseRepoWithApi;

  beforeEach(() => {
    setup({owner: 'angular', name: 'dev-infra-test', mainBranchName: 'main'});
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
  function interceptBranchVersionRequest(
    branchName: string,
    version: string,
    isExceptionalMinor: boolean,
  ) {
    const pkgJson: {version: string; [exceptionalMinorPackageIndicator]?: boolean} = {version};
    if (isExceptionalMinor) {
      pkgJson[exceptionalMinorPackageIndicator] = true;
    }

    nock(getRepoApiRequestUrl())
      .get('/contents/%2Fpackage.json')
      .query((params) => params.ref === branchName)
      .reply(200, {
        content: Buffer.from(JSON.stringify(pkgJson)).toString('base64'),
      });
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

  for (const scenario of scenarios) {
    it(`scenario: ${scenario.name}`, async () => {
      for (const branch of scenario.branches) {
        interceptBranchVersionRequest(branch.name, branch.version, branch.isExceptionalMinor);
      }
      interceptBranchesListRequestWithPagination(scenario.branches.map((b) => b.name));

      if (scenario.expected instanceof RegExp) {
        await expectAsync(ActiveReleaseTrains.fetch(repo)).toBeRejectedWithError(scenario.expected);
      } else {
        const active = await ActiveReleaseTrains.fetch(repo);
        expect({
          next: active.next,
          latest: active.latest,
          releaseCandidate: active.releaseCandidate,
          exceptionalMinor: active.exceptionalMinor,
        }).toEqual(scenario.expected);
      }
    });
  }
});
