import * as core from '@actions/core';
import {context} from '@actions/github';
import {GoogleGenAI} from '@google/genai';
import {Octokit} from '@octokit/rest';
import {ANGULAR_ROBOT, getAuthTokenFor, revokeActiveInstallationToken} from '../../utils.js';
import {components} from '@octokit/openapi-types';

export class IssueLabeling {
  static run = async () => {
    const token = await getAuthTokenFor(ANGULAR_ROBOT);
    const git = new Octokit({auth: token});
    try {
      const inst = new this(git, core);
      await inst.run();
    } finally {
      await revokeActiveInstallationToken(git);
    }
  };

  /** Set of area labels available in the current repository. */
  repoAreaLabels = new Set<string>();
  /** The issue data fetched from Github. */
  issueData?: components['schemas']['issue'];

  constructor(
    private git: Octokit,
    private coreService: typeof core,
  ) {}

  async run() {
    const {issue} = context;
    if (!issue || !issue.number) {
      this.coreService.info('No issue context found. Skipping.');
      return;
    }
    this.coreService.info(`Issue #${issue.number}`);

    // Initialize labels and issue data
    await this.initialize();

    const ai = this.getGenerativeAI();

    const prompt = `
You are a helper for an open source repository.
Your task is to allow the user to categorize the issue with an "area: " label.
The following is the issue title and body:

Title: ${this.issueData!.title}
Body:
${this.issueData!.body}

The available area labels are:
${Array.from(this.repoAreaLabels)
  .map((label) => ` - ${label}`)
  .join('\n')}

Based on the content, which area label is the best fit?
Respond ONLY with the exact label name (e.g. "area: core").
If you are strictly unsure or if multiple labels match equally well, respond with "ambiguous".
If no area label applies, respond with "none".
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const text = (response.text || '').trim();

      this.coreService.info(`Gemini suggested label: ${text}`);

      if (this.repoAreaLabels.has(text)) {
        await this.addLabel(text);
      } else {
        this.coreService.info(
          `Generated label "${text}" is not in the list of valid area labels or is "ambiguous"/"none".`,
        );
      }
    } catch (e) {
      this.coreService.error('Failed to generate content from Gemini.');
      this.coreService.setFailed(e as Error);
    }
  }

  getGenerativeAI() {
    const apiKey = this.coreService.getInput('google-generative-ai-key', {required: true});
    return new GoogleGenAI({apiKey});
  }

  async addLabel(label: string) {
    const {number: issue_number, owner, repo} = context.issue;
    try {
      await this.git.issues.addLabels({repo, owner, issue_number, labels: [label]});
      this.coreService.info(`Added ${label} label to Issue #${issue_number}`);
    } catch (err) {
      this.coreService.error(`Failed to add ${label} label to Issue #${issue_number}`);
      this.coreService.debug(err as string);
    }
  }

  async initialize() {
    const {owner, repo} = context.issue;
    await Promise.all([
      this.git
        .paginate(this.git.issues.listLabelsForRepo, {owner, repo})
        .then((labels) =>
          labels
            .filter((l) => l.name.startsWith('area: '))
            .forEach((l) => this.repoAreaLabels.add(l.name)),
        ),
      this.git.issues.get({owner, repo, issue_number: context.issue.number}).then((resp) => {
        this.issueData = resp.data;
      }),
    ]);

    if (this.repoAreaLabels.size === 0) {
      this.coreService.warning('No area labels found in the repository.');
      return;
    }

    if (!this.issueData) {
      this.coreService.error('Failed to fetch issue data.');
      return;
    }
  }
}
