import * as core from '@actions/core';
import {context} from '@actions/github';
import {GoogleGenAI} from '@google/genai';
import {components} from '@octokit/openapi-types';
import {miscLabels} from '../../../../ng-dev/pr/common/labels/index.js';
import {Labeling} from '../../shared/labeling.js';

export class IssueLabeling extends Labeling {
  readonly type = 'Issue';
  /** Set of area labels available in the current repository. */
  repoAreaLabels = new Set<string>();
  /** The issue data fetched from Github. */
  issueData?: components['schemas']['issue'];

  async run() {
    core.info(`Updating labels for ${this.type} #${context.issue.number}`);

    // Determine if the issue already has an area label, if it does we can exit early.
    if (
      this.issueData?.labels.some((label) =>
        (typeof label === 'string' ? label : label.name)?.startsWith('area: '),
      )
    ) {
      core.info('Issue already has an area label. Skipping.');
      return;
    }

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

      core.info(`Gemini suggested label: ${text}`);

      if (this.repoAreaLabels.has(text)) {
        await this.addLabel(text);
        await this.addLabel(miscLabels.GEMINI_TRIAGED.name);
      } else {
        core.info(
          `Generated label "${text}" is not in the list of valid area labels or is "ambiguous"/"none".`,
        );
      }
    } catch (e) {
      core.error('Failed to generate content from Gemini.');
      core.setFailed(e as Error);
    }
  }

  getGenerativeAI() {
    const apiKey = core.getInput('google-generative-ai-key', {required: true});
    return new GoogleGenAI({apiKey});
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
  }
}
