import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {ANGULAR_ROBOT, getAuthTokenFor, isOrg, isRepo, utils} from './utils.js';

describe('github-actions/utils', () => {
  describe('type guards', () => {
    it('should correctly identify Org objects', () => {
      expect(isOrg({org: 'angular'})).toBeTrue();
      expect(isOrg({repo: 'dev-infra', owner: 'angular'})).toBeFalse();
      expect(isOrg(null)).toBeFalse();
      expect(isOrg(undefined)).toBeFalse();
      expect(isOrg('angular')).toBeFalse();
    });

    it('should correctly identify Repo objects', () => {
      expect(isRepo({repo: 'dev-infra', owner: 'angular'})).toBeTrue();
      expect(isRepo({org: 'angular'})).toBeFalse();
      expect(isRepo(null)).toBeFalse();
      expect(isRepo(undefined)).toBeFalse();
      expect(isRepo({repo: 'dev-infra'})).toBeFalse();
    });
  });

  describe('getAuthTokenFor - repository scoping', () => {
    let mockGetRepoInstallation: jasmine.Spy;
    let mockGetOrgInstallation: jasmine.Spy;
    let mockCreateInstallationAccessToken: jasmine.Spy;

    beforeEach(() => {
      process.env['INPUT_ANGULAR-ROBOT-KEY'] = 'dummy-private-key';

      mockGetRepoInstallation = jasmine.createSpy('getRepoInstallation').and.resolveTo({
        data: {id: 11111},
      });
      mockGetOrgInstallation = jasmine.createSpy('getOrgInstallation').and.resolveTo({
        data: {id: 22222},
      });
      mockCreateInstallationAccessToken = jasmine
        .createSpy('createInstallationAccessToken')
        .and.resolveTo({
          data: {token: 'mock-scoped-token'},
        });

      spyOn(utils, 'getJwtAuthedAppClient').and.resolveTo({
        apps: {
          getRepoInstallation: mockGetRepoInstallation,
          getOrgInstallation: mockGetOrgInstallation,
        },
        rest: {
          apps: {
            createInstallationAccessToken: mockCreateInstallationAccessToken,
          },
        },
      } as unknown as Octokit);

      // Ensure context.repo is set to default
      spyOnProperty(context, 'repo', 'get').and.returnValue({
        owner: 'angular',
        repo: 'dev-infra',
      });
    });

    afterEach(() => {
      delete process.env['INPUT_ANGULAR-ROBOT-KEY'];
    });

    it('should default to repository scoping with [context.repo.repo] when no target or options provided', async () => {
      const token = await getAuthTokenFor(ANGULAR_ROBOT);

      expect(token).toBe('mock-scoped-token');
      expect(mockGetRepoInstallation).toHaveBeenCalledWith({
        owner: 'angular',
        repo: 'dev-infra',
      });
      expect(mockCreateInstallationAccessToken).toHaveBeenCalledWith({
        installation_id: 11111,
        repositories: ['dev-infra'],
      });
    });

    it('should scope to explicit repo when Repo object provided', async () => {
      const token = await getAuthTokenFor(ANGULAR_ROBOT, {owner: 'angular', repo: 'components'});

      expect(token).toBe('mock-scoped-token');
      expect(mockGetRepoInstallation).toHaveBeenCalledWith({
        owner: 'angular',
        repo: 'components',
      });
      expect(mockCreateInstallationAccessToken).toHaveBeenCalledWith({
        installation_id: 11111,
        repositories: ['components'],
      });
    });

    it('should omit repository scoping when orgWide: true option is provided as second argument', async () => {
      const token = await getAuthTokenFor(ANGULAR_ROBOT, {orgWide: true});

      expect(token).toBe('mock-scoped-token');
      expect(mockGetRepoInstallation).toHaveBeenCalledWith({
        owner: 'angular',
        repo: 'dev-infra',
      });
      expect(mockCreateInstallationAccessToken).toHaveBeenCalledWith({
        installation_id: 11111,
      });
    });

    it('should omit repository scoping when orgWide: true option is provided with Repo object', async () => {
      const token = await getAuthTokenFor(
        ANGULAR_ROBOT,
        {owner: 'angular', repo: 'components'},
        {orgWide: true},
      );

      expect(token).toBe('mock-scoped-token');
      expect(mockGetRepoInstallation).toHaveBeenCalledWith({
        owner: 'angular',
        repo: 'components',
      });
      expect(mockCreateInstallationAccessToken).toHaveBeenCalledWith({
        installation_id: 11111,
      });
    });

    it('should use explicit repositories list when provided in options', async () => {
      const token = await getAuthTokenFor(ANGULAR_ROBOT, {
        repositories: ['repo-a', 'repo-b'],
      });

      expect(token).toBe('mock-scoped-token');
      expect(mockCreateInstallationAccessToken).toHaveBeenCalledWith({
        installation_id: 11111,
        repositories: ['repo-a', 'repo-b'],
      });
    });

    it('should query getOrgInstallation when Org target is provided', async () => {
      const token = await getAuthTokenFor(ANGULAR_ROBOT, {org: 'googlers'});

      expect(token).toBe('mock-scoped-token');
      expect(mockGetOrgInstallation).toHaveBeenCalledWith({org: 'googlers'});
      expect(mockCreateInstallationAccessToken).toHaveBeenCalledWith({
        installation_id: 22222,
      });
    });
  });

  describe('getAuthTokenFor - secret masking', () => {
    let mockGetRepoInstallation: jasmine.Spy;
    let mockCreateInstallationAccessToken: jasmine.Spy;
    let stdoutWriteSpy: jasmine.Spy;

    beforeEach(() => {
      process.env['INPUT_ANGULAR-ROBOT-KEY'] = 'dummy-private-key';
      stdoutWriteSpy = spyOn(process.stdout, 'write').and.callThrough();

      mockGetRepoInstallation = jasmine.createSpy('getRepoInstallation').and.resolveTo({
        data: {id: 11111},
      });
      mockCreateInstallationAccessToken = jasmine
        .createSpy('createInstallationAccessToken')
        .and.resolveTo({
          data: {token: 'super-secret-installation-token'},
        });

      spyOn(utils, 'getJwtAuthedAppClient').and.resolveTo({
        apps: {
          getRepoInstallation: mockGetRepoInstallation,
        },
        rest: {
          apps: {
            createInstallationAccessToken: mockCreateInstallationAccessToken,
          },
        },
      } as unknown as Octokit);

      spyOnProperty(context, 'repo', 'get').and.returnValue({
        owner: 'angular',
        repo: 'dev-infra',
      });
    });

    afterEach(() => {
      delete process.env['INPUT_ANGULAR-ROBOT-KEY'];
    });

    it('should register the minted token with core.setSecret before returning', async () => {
      const token = await getAuthTokenFor(ANGULAR_ROBOT);

      expect(token).toBe('super-secret-installation-token');
      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('::add-mask::super-secret-installation-token'),
      );
    });

    it('should throw an error and not call core.setSecret if token is empty or whitespace', async () => {
      mockCreateInstallationAccessToken.and.resolveTo({
        data: {token: '   '},
      });

      await expectAsync(getAuthTokenFor(ANGULAR_ROBOT)).toBeRejectedWithError(
        'GitHub API did not return a valid installation access token.',
      );
      expect(stdoutWriteSpy).not.toHaveBeenCalledWith(jasmine.stringContaining('::add-mask::'));
    });
  });
});
