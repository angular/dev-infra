import * as core from '@actions/core';
import {context} from '@actions/github';
import {GoogleGenAI} from '@google/genai';
import {components} from '@octokit/openapi-types';
import {miscLabels} from '../../../../ng-dev/pr/common/labels/index.js';
import {Labeling} from '../../shared/labeling.js';

export const NEEDS_TRIAGE_MILESTONE = 'needsTriage';
export const BACKLOG_MILESTONE = 'Backlog';

export class IssueLabeling extends Labeling {
  readonly type = 'Issue';
  /** Set of area labels available in the current repository. */
  repoAreaLabels = new Map<string, string>();
  /** The issue data fetched from Github. */
  issueData?: components['schemas']['issue'];

  async run() {
    const {owner, repo, number} = context.issue;
    core.info(`Processing ${this.type} #${number}...`);

    if (!this.issueData) {
      await this.initialize();
    }

    // 1. Run auto-labeler first (it safely skips if an area label is already present).
    await this.runAutoLabeling();

    // 2. Re-fetch the latest issue state to ensure we capture any newly added labels.
    const updatedIssue = await this.git.issues.get({
      owner,
      repo,
      issue_number: number,
    });
    const labels = updatedIssue.data.labels.map((l: string | {name?: string}) =>
      typeof l === 'string' ? l : l.name || '',
    );

    const hasAreaLabel = labels.some((l) => l.startsWith('area: '));
    const hasPriorityLabel = labels.some((l) => /^P[0-5]$/.test(l));

    if (hasPriorityLabel) {
      await this.applyMilestoneIfFound(BACKLOG_MILESTONE);
    } else if (hasAreaLabel) {
      await this.applyMilestoneIfFound(NEEDS_TRIAGE_MILESTONE);
    }
  }

  async runAutoLabeling() {
    // Determine if the issue already has an area label, if it does we can exit early.
    if (
      this.issueData?.labels.some((label: string | {name?: string}) =>
        (typeof label === 'string' ? label : label.name)?.startsWith('area: '),
      )
    ) {
      core.info('Issue already has an area label. Skipping auto-labeling.');
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
  .map(
    ([label, description]) =>
      ` - Label: ${label}${description ? `, Description: ${description}` : ''}`,
  )
  .join('\n')}

Based on the content of the issue and the available labels, which area label is the best fit?
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

  async applyMilestoneIfFound(targetMilestoneTitle: string) {
    const {owner, repo, number} = context.issue;
    core.info(`Checking for milestone with title "${targetMilestoneTitle}" in ${owner}/${repo}...`);

    try {
      const milestones = await this.git.paginate(this.git.issues.listMilestones, {
        owner,
        repo,
        state: 'open',
      });

      const found = milestones.find(
        (m) => m.title.toLowerCase() === targetMilestoneTitle.toLowerCase(),
      );

      if (found) {
        const currentIssue = await this.git.issues.get({
          owner,
          repo,
          issue_number: number,
        });
        const currentMilestone = currentIssue.data.milestone;

        if (currentMilestone) {
          if (
            currentMilestone.title.toLowerCase() === NEEDS_TRIAGE_MILESTONE.toLowerCase() &&
            targetMilestoneTitle.toLowerCase() === BACKLOG_MILESTONE.toLowerCase()
          ) {
            core.info(
              `Transitioning milestone from "${currentMilestone.title}" to "${found.title}"...`,
            );
          } else if (currentMilestone.number === found.number) {
            core.info(`Issue already has milestone "${found.title}". Skipping.`);
            return;
          } else {
            core.info(
              `Issue already has milestone "${currentMilestone.title}". Skipping overwrite with "${targetMilestoneTitle}".`,
            );
            return;
          }
        }

        core.info(
          `Found milestone "${found.title}" (ID: ${found.number}). Applying to issue #${number}...`,
        );
        await this.git.issues.update({
          owner,
          repo,
          issue_number: number,
          milestone: found.number,
        });
        core.info('Successfully applied milestone.');
      } else {
        core.info(
          `Milestone "${targetMilestoneTitle}" was not found in this repository. Skipping.`,
        );
      }
    } catch (e) {
      core.error(`Failed to check or apply milestone "${targetMilestoneTitle}".`);
      core.error(e as Error);
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
            .forEach((l) => this.repoAreaLabels.set(l.name, l.description ?? '')),
        ),
      this.git.issues.get({owner, repo, issue_number: context.issue.number}).then((resp) => {
        this.issueData = resp.data;
      }),
    ]);
  }
}
