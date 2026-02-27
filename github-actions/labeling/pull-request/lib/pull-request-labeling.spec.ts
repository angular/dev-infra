import {PullRequestLabeling as _PullRequestLabeling} from './pull-request-labeling.js';
import {Octokit} from '@octokit/rest';

class PullRequestLabeling extends _PullRequestLabeling {
  setGit(git: any) {
    this.git = git;
  }
}

describe('PullRequestLabeling', () => {
  let labeling: PullRequestLabeling;
  let mockGit: jasmine.SpyObj<Octokit>;
  let getLabelsFromInputSpy: jasmine.Spy;

  beforeEach(() => {
    mockGit = jasmine.createSpyObj('Octokit', ['paginate', 'issues', 'pulls']);
    mockGit.issues = jasmine.createSpyObj('issues', [
      'listLabelsOnIssue',
      'addLabels',
      'removeLabel',
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

    getLabelsFromInputSpy = spyOn(PullRequestLabeling.prototype, 'getLabelsFromInput');

    labeling = new PullRequestLabeling();
    labeling.setGit(mockGit as unknown as Octokit);
  });

  it('should apply labels based on path configuration', async () => {
    getLabelsFromInputSpy.and.returnValue({
      'target: feature': ['feature/**'],
      'target: docs': ['docs/**'],
    });

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
    getLabelsFromInputSpy.and.returnValue({
      'target: nothing': ['nothing/**'],
    });

    await labeling.initialize();
    await labeling.pathBasedLabeling();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });
});
