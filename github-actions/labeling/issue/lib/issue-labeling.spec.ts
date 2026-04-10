import {Octokit} from '@octokit/rest';
import * as core from '@actions/core';
import {context} from '@actions/github';
import {
  IssueLabeling as _IssueLabeling,
  NEEDS_TRIAGE_MILESTONE,
  BACKLOG_MILESTONE,
} from './issue-labeling.js';

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
    // Set up GitHub Action context defaults for tests
    context.payload = {action: 'opened'};
    context.eventName = 'issues';
    spyOnProperty(context, 'issue', 'get').and.returnValue({
      owner: 'angular',
      repo: 'dev-infra',
      number: 123,
    });

    mockGit = jasmine.createSpyObj('Octokit', ['paginate', 'issues', 'pulls']);
    mockGit.issues = jasmine.createSpyObj('issues', [
      'addLabels',
      'get',
      'listLabelsForRepo',
      'listMilestones',
      'update',
    ]);

    // Mock paginate to return the result of the promise if it's a list, or just execute the callback
    (mockGit.paginate as jasmine.Spy).and.callFake((fn: any, args: any) => {
      if (fn === mockGit.issues.listLabelsForRepo) {
        return Promise.resolve([
          {name: 'area: core', description: 'Core Angular framework'},
          {name: 'area: router', description: 'Angular Router'},
          {name: 'bug', description: 'Bug report'},
        ]);
      }
      if (fn === mockGit.issues.listMilestones) {
        return Promise.resolve([
          {number: 1, title: NEEDS_TRIAGE_MILESTONE},
          {number: 2, title: BACKLOG_MILESTONE},
        ]);
      }
      return Promise.resolve([]);
    });

    (mockGit.issues.addLabels as unknown as jasmine.Spy).and.returnValue(Promise.resolve({}));
    (mockGit.issues.update as unknown as jasmine.Spy).and.returnValue(Promise.resolve({}));
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

    // By default, mock AI returns a safe non-matching value so it doesn't crash un-stubbed tests.
    mockAI.models.generateContent.and.returnValue(Promise.resolve({text: 'none'}));

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

  it('should apply a label and milestone when Gemini is confident on opened', async () => {
    mockAI.models.generateContent.and.returnValue(
      Promise.resolve({
        text: 'area: core',
      }),
    );

    let getCallCount = 0;
    getIssue.and.callFake(() => {
      getCallCount++;
      if (getCallCount === 1) {
        return Promise.resolve({
          data: {title: 'Tough Issue', body: 'Complex Body', labels: []},
        });
      }
      return Promise.resolve({
        data: {
          title: 'Tough Issue',
          body: 'Complex Body',
          labels: ['area: core'],
        },
      });
    });

    await issueLabeling.run();

    expect(mockGit.issues.addLabels).toHaveBeenCalledWith(
      jasmine.objectContaining({
        labels: ['area: core'],
      }),
    );
    expect(mockGit.issues.update).toHaveBeenCalledWith(
      jasmine.objectContaining({
        issue_number: 123,
        milestone: 1,
      }),
    );
  });

  it('should NOT apply a label when Gemini returns "ambiguous"', async () => {
    mockAI.models.generateContent.and.returnValue(
      Promise.resolve({
        text: 'ambiguous',
      }),
    );

    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });

  it('should NOT apply a label when Gemini returns an invalid label', async () => {
    mockAI.models.generateContent.and.returnValue(
      Promise.resolve({
        text: 'area: invalid',
      }),
    );

    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });

  it('should apply needsTriage milestone when an area label is added manually', async () => {
    context.payload = {action: 'labeled', label: {name: 'area: core'}};
    getIssue.and.resolveTo({
      data: {
        title: 'Tough Issue',
        body: 'Complex Body',
        labels: ['area: core'],
      },
    });

    await issueLabeling.run();

    expect(mockGit.issues.update).toHaveBeenCalledWith(
      jasmine.objectContaining({
        issue_number: 123,
        milestone: 1,
      }),
    );
  });

  it('should apply Backlog milestone when a priority label is added manually', async () => {
    context.payload = {action: 'labeled', label: {name: 'P0'}};
    getIssue.and.resolveTo({
      data: {
        title: 'Tough Issue',
        body: 'Complex Body',
        labels: ['P0'],
      },
    });

    await issueLabeling.run();

    expect(mockGit.issues.update).toHaveBeenCalledWith(
      jasmine.objectContaining({
        issue_number: 123,
        milestone: 2,
      }),
    );
  });

  it('should NOT overwrite an existing milestone when applying a new one', async () => {
    context.payload = {action: 'labeled', label: {name: 'P1'}};
    getIssue.and.resolveTo({
      data: {
        title: 'Tough Issue',
        body: 'Complex Body',
        labels: ['P1'],
        milestone: {title: 'Release 20', number: 99},
      },
    });

    await issueLabeling.run();

    expect(mockGit.issues.update).not.toHaveBeenCalled();
  });

  it('should transition milestone from needsTriage to Backlog', async () => {
    context.payload = {action: 'labeled', label: {name: 'P2'}};
    getIssue.and.resolveTo({
      data: {
        title: 'Tough Issue',
        body: 'Complex Body',
        labels: ['area: core', 'P2'],
        milestone: {title: NEEDS_TRIAGE_MILESTONE, number: 1},
      },
    });

    await issueLabeling.run();

    expect(mockGit.issues.update).toHaveBeenCalledWith(
      jasmine.objectContaining({
        issue_number: 123,
        milestone: 2,
      }),
    );
  });
});
