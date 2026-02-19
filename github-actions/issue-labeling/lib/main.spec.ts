import {Octokit} from '@octokit/rest';
import * as core from '@actions/core';
import {context} from '@actions/github';
import {GoogleGenAI} from '@google/genai';
import {IssueLabeling} from './issue-labeling.js';

class TestableIssueLabeling extends IssueLabeling {
  public constructor(git: Octokit, coreService: typeof core) {
    super(git, coreService);
  }
}

describe('IssueLabeling', () => {
  let mockGit: {
    paginate: jasmine.Spy;
    issues: {
      listLabelsForRepo: jasmine.Spy;
      addLabels: jasmine.Spy;
      get: jasmine.Spy;
    };
  };
  let mockAI: any;
  let mockCore: jasmine.SpyObj<typeof core>;
  let issueLabeling: IssueLabeling;

  beforeEach(() => {
    mockGit = {
      paginate: jasmine.createSpy('paginate'),
      issues: {
        listLabelsForRepo: jasmine.createSpy('listLabelsForRepo'),
        addLabels: jasmine.createSpy('addLabels'),
        get: jasmine.createSpy('get'),
      },
    };

    mockGit.issues.addLabels.and.returnValue(Promise.resolve({}));
    mockGit.issues.get.and.returnValue(
      Promise.resolve({
        data: {
          title: 'Tough Issue',
          body: 'Complex Body',
          labels: [],
        },
      }),
    );
    mockGit.paginate.and.resolveTo([{name: 'area: core'}, {name: 'area: router'}, {name: 'bug'}]);

    mockAI = {
      models: jasmine.createSpyObj('models', ['generateContent']),
    };
    mockCore = jasmine.createSpyObj<typeof core>('core', [
      'getInput',
      'info',
      'error',
      'warning',
      'debug',
      'setFailed',
    ]);
    mockCore.getInput.and.returnValue('mock-ai-key');
    mockCore.error.and.callFake(console.error);
    mockCore.info.and.callFake(console.info);
    mockCore.warning.and.callFake(console.warn);
    mockCore.debug.and.callFake(console.debug);
    mockCore.setFailed.and.callFake(console.error);


    // We must cast the mock to Octokit because the mock only implements the subset used by the class.
    // This is standard for mocking large interfaces like Octokit.
    issueLabeling = new TestableIssueLabeling(mockGit as unknown as Octokit, mockCore);

    spyOn(issueLabeling, 'getGenerativeAI').and.returnValue(mockAI);
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

  it('should initialize and run with manual instantiation check', () => {
    expect(issueLabeling).toBeDefined();
    expect(mockCore.getInput).not.toHaveBeenCalled(); // until run is called
  });

  it('should skip labeling when issue already has an area label', async () => {
    mockGit.issues.get.and.resolveTo({
      data: {
        title: 'Tough Issue',
        body: 'Complex Body',
        labels: [{name: 'area: core'}],
      },
    });

    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
    expect(mockCore.info).toHaveBeenCalledWith('Issue already has an area label. Skipping.');
  });
});
