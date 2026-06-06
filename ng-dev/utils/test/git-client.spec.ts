import {GitClient} from '../git/git-client.js';

describe('GitClient validation', () => {
  let client: GitClient;
  const mockConfig = {
    github: {
      owner: 'owner',
      name: 'repo',
      mainBranchName: 'main',
    },
  };

  beforeEach(() => {
    client = new GitClient(mockConfig as any, '/tmp');
  });

  describe('hasCommit', () => {
    it('should throw error if branchName starts with hyphen', () => {
      expect(() => client.hasCommit('-invalid-branch', 'sha')).toThrowError(
        /Invalid Git reference/,
      );
    });

    it('should throw error if sha starts with hyphen', () => {
      expect(() => client.hasCommit('branch', '-invalid-sha')).toThrowError(
        /Invalid Git reference/,
      );
    });

    it('should not throw if inputs are valid', () => {
      spyOn(client, 'run').and.returnValue({stdout: ''} as any);
      expect(() => client.hasCommit('branch', 'sha')).not.toThrow();
      expect(client.run).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should throw error if branchOrRevision starts with hyphen', () => {
      expect(() => client.checkout('-invalid-ref', false)).toThrowError(/Invalid Git reference/);
    });

    it('should not throw if inputs are valid', () => {
      spyOn(client, 'runGraceful').and.returnValue({status: 0} as any);
      expect(() => client.checkout('branch', false)).not.toThrow();
      expect(client.runGraceful).toHaveBeenCalled();
    });
  });

  describe('allChangesFilesSince', () => {
    it('should throw error if shaOrRef starts with hyphen', () => {
      expect(() => client.allChangesFilesSince('-invalid-ref')).toThrowError(
        /Invalid Git reference/,
      );
    });

    it('should not throw if inputs are valid', () => {
      spyOn(client, 'runGraceful').and.returnValue({stdout: ''} as any);
      expect(() => client.allChangesFilesSince('sha')).not.toThrow();
      expect(client.runGraceful).toHaveBeenCalled();
    });
  });
});
