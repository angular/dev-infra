import {PullRequestLabeling} from '../lib/pull-request-labeling.js';
import {Octokit} from '@octokit/rest';

describe('PullRequestLabeling', () => {
  let labeling: PullRequestLabeling;
  let mockGit: jasmine.SpyObj<Octokit>;
  let mockCore: {
    getInput: jasmine.Spy;
    info: jasmine.Spy;
    error: jasmine.Spy;
    debug: jasmine.Spy;
  };
  let mockContext: {
    issue: {number: number; owner: string; repo: string};
    repo: {owner: string; repo: string};
  };

  beforeEach(() => {
    mockGit = jasmine.createSpyObj('Octokit', ['paginate', 'issues', 'pulls']);
    mockGit.issues = jasmine.createSpyObj('issues', [
      'listLabelsOnIssue',
      'addLabels',
      'removeLabel',
      'listLabelsForRepo',
    ]);
    mockGit.pulls = jasmine.createSpyObj('pulls', ['listCommits', 'get', 'listFiles']);

    // Mock paginate to return the result of the promise if it's a list, or just execute the callback
    (mockGit.paginate as jasmine.Spy).and.callFake((fn: any, args: any) => {
      if (fn === mockGit.issues.listLabelsForRepo) {
        return Promise.resolve([]);
      }
      if (fn === mockGit.pulls.listCommits) {
        return Promise.resolve([]);
      }
      if (fn === mockGit.pulls.listFiles) {
        return Promise.resolve([{filename: 'feature/foo.ts'}, {filename: 'docs/README.md'}]);
      }
      return Promise.resolve([]);
    });

    (mockGit.issues.listLabelsOnIssue as unknown as jasmine.Spy).and.resolveTo({data: []});
    (mockGit.pulls.get as unknown as jasmine.Spy).and.resolveTo({data: {base: {ref: 'main'}}});

    mockCore = jasmine.createSpyObj('core', ['getInput', 'info', 'error', 'debug']);
    mockContext = {
      issue: {number: 12345, owner: 'angular', repo: 'angular'},
      repo: {owner: 'angular', repo: 'angular'},
    };

    labeling = new PullRequestLabeling(mockGit, mockCore as any, mockContext as any);
  });

  it('should apply labels based on path configuration', async () => {
    mockCore.getInput.and.returnValue(
      JSON.stringify({
        'target: feature': ['feature/**'],
        'target: docs': ['docs/**'],
      }),
    );

    await labeling.initialize();
    await labeling.pathBasedLabeling();

    expect(mockGit.issues.addLabels).toHaveBeenCalledWith(
      jasmine.objectContaining({
        labels: ['target: feature'],
      }),
    );
    expect(mockGit.issues.addLabels).toHaveBeenCalledWith(
      jasmine.objectContaining({
        labels: ['target: docs'],
      }),
    );
  });

  it('should not apply labels if files do not match', async () => {
    mockCore.getInput.and.returnValue(
      JSON.stringify({
        'target: nothing': ['nothing/**'],
      }),
    );

    await labeling.initialize();
    await labeling.pathBasedLabeling();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });
});
