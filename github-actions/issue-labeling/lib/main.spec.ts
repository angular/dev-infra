import {Octokit} from '@octokit/rest';
import * as core from '@actions/core';
import {context} from '@actions/github';
import {GenerativeModel} from '@google/generative-ai';
import {IssueLabeling} from './issue-labeling.js';

describe('IssueLabeling', () => {
  let mockGit: {
    paginate: jasmine.Spy;
    issues: {
      listLabelsForRepo: jasmine.Spy;
      addLabels: jasmine.Spy;
      get: jasmine.Spy;
    };
  };
  let mockModel: jasmine.SpyObj<GenerativeModel>;
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
        },
      }),
    );
    mockGit.paginate.and.callFake((fn: any, opts: any) => {
      // Return value matching listLabelsForRepo signature
      return Promise.resolve([{name: 'area: core'}, {name: 'area: router'}, {name: 'bug'}]);
    });

    mockModel = jasmine.createSpyObj<GenerativeModel>('GenerativeModel', ['generateContent']);
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
    issueLabeling = new IssueLabeling(mockGit as unknown as Octokit, mockCore);

    spyOn(issueLabeling, 'getGenerativeModel').and.returnValue(mockModel);
  });

  it('should initialize labels correctly', async () => {
    await issueLabeling.initialize();
    expect(issueLabeling.repoAreaLabels.has('area: core')).toBe(true);
    expect(issueLabeling.repoAreaLabels.has('area: router')).toBe(true);
    expect(issueLabeling.repoAreaLabels.has('bug')).toBe(false);
  });

  it('should apply a label when Gemini is confident', async () => {
    mockModel.generateContent.and.returnValue(
      Promise.resolve({
        response: {
          text: () => 'area: core',
        } as any, // Cast response structure as any because it's deeply nested and hard to construct manually
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
    mockModel.generateContent.and.returnValue(
      Promise.resolve({
        response: {
          text: () => 'ambiguous',
        } as any,
      }),
    );

    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });

  it('should NOT apply a label when Gemini returns an invalid label', async () => {
    mockModel.generateContent.and.returnValue(
      Promise.resolve({
        response: {
          text: () => 'area: invalid',
        } as any,
      }),
    );

    await issueLabeling.run();

    expect(mockGit.issues.addLabels).not.toHaveBeenCalled();
  });

  it('should initialize and run with manual instantiation check', () => {
    expect(issueLabeling).toBeDefined();
    expect(mockCore.getInput).not.toHaveBeenCalled(); // until run is called
  });
});
