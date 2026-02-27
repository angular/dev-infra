import {Octokit} from '@octokit/rest';
import * as core from '@actions/core';
import {IssueLabeling as _IssueLabeling} from './issue-labeling.js';

class IssueLabeling extends _IssueLabeling {
  setGit(git: any) {
    this.git = git;
  }
}

describe('IssueLabeling', () => {
  let mockGit: jasmine.SpyObj<Octokit>;
  let mockAI: any;
  let issueLabeling: IssueLabeling;
  let getIssue: jasmine.Spy;

  beforeEach(() => {
    mockGit = jasmine.createSpyObj('Octokit', ['paginate', 'issues', 'pulls']);
    mockGit.issues = jasmine.createSpyObj('issues', ['addLabels', 'get']);

    // Mock paginate to return the result of the promise if it's a list, or just execute the callback
    (mockGit.paginate as jasmine.Spy).and.callFake((fn: any, args: any) => {
      if (fn === mockGit.issues.listLabelsOnIssue) {
        return Promise.resolve([{name: 'area: core'}, {name: 'area: router'}, {name: 'bug'}]);
      }
      return Promise.resolve([]);
    });

    (mockGit.issues.addLabels as unknown as jasmine.Spy).and.returnValue(Promise.resolve({}));
    getIssue = mockGit.issues.get as unknown as jasmine.Spy;
    getIssue.and.resolveTo({
      data: {
        title: 'Tough Issue',
        body: 'Complex Body',
        labels: [],
      },
    });

    mockAI = {
      models: jasmine.createSpyObj('models', ['generateContent']),
    };

    spyOn(IssueLabeling.prototype, 'getGenerativeAI').and.returnValue(mockAI);
    issueLabeling = new IssueLabeling();
    issueLabeling.setGit(mockGit as unknown as Octokit);
  });

  it('should initialize labels correctly', async () => {
    await issueLabeling.initialize();
    expect(issueLabeling.repoAreaLabels.has('area: core')).toBe(true);
    expect(issueLabeling.repoAreaLabels.has('area: router')).toBe(true);
    expect(issueLabeling.repoAreaLabels.has('bug')).toBe(false);
  });

  it('should apply a label when Gemini is confident', async () => {
    mockAI.models.generateContent.and.returnValue(
      Promise.resolve({
        text: 'area: core',
      }),
    );

    await issueLabeling.initialize();
    await issueLabeling.run();

    expect(mockGit.issues.addLabels).toHaveBeenCalledWith(
      jasmine.objectContaining({
        labels: ['area: core'],
      }),
    );
  });

  it('should NOT apply a label when Gemini returns "ambiguous"', async () => {
    mockAI.models.generateContent.and.returnValue(
      Promise.resolve({
        text: 'ambiguous',
      }),
    );

    await issueLabeling.initialize();
    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });

  it('should NOT apply a label when Gemini returns an invalid label', async () => {
    mockAI.models.generateContent.and.returnValue(
      Promise.resolve({
        text: 'area: invalid',
      }),
    );

    await issueLabeling.initialize();
    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });

  it('should skip labeling when issue already has an area label', async () => {
    getIssue.and.resolveTo({
      data: {
        title: 'Tough Issue',
        body: 'Complex Body',
        labels: [{name: 'area: core'}],
      },
    });
    await issueLabeling.initialize();

    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });
});
