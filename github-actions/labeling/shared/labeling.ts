import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';

import {ANGULAR_ROBOT, utils} from '../../utils.js';

export abstract class Labeling {
  abstract readonly type: 'PR' | 'Issue';

  protected git!: Octokit;

  /** Run the commit message based labelling process. */
  static async run<T extends Labeling>(this: new () => T): Promise<void> {
    const inst = new this();
    try {
      await inst.setup();
      await inst.initialize();
      await inst.run();
    } finally {
      await inst.tearDown();
    }
  }

  /** Retrieve all of the data needed for the action. */
  abstract initialize(): Promise<void>;

  /** Run the action. */
  abstract run(): Promise<void>;

  /** Remove the provided label to the pull request. */
  async removeLabel(label: string) {
    const {number: issue_number, owner, repo} = context.issue;
    try {
      await this.git.issues.removeLabel({repo, owner, issue_number, name: label});
      core.info(`Removed ${label} label from ${this.type} #${issue_number}`);
    } catch (err) {
      core.error(`Failed to remove ${label} label from ${this.type} #${issue_number}`);
      core.error(err as string);
    }
  }

  /** Add the provided label to the pull request. */
  async addLabel(label: string) {
    const {number: issue_number, owner, repo} = context.issue;
    try {
      await this.git.issues.addLabels({repo, owner, issue_number, labels: [label]});
      core.info(`Added ${label} label to ${this.type} #${issue_number}`);
    } catch (err) {
      core.error(`Failed to add ${label} label to ${this.type} #${issue_number}`);
      core.error(err as string);
    }
  }

  protected async setup() {
    const auth = await utils.getAuthTokenFor(ANGULAR_ROBOT);
    this.git = new Octokit({auth});
  }

  protected async tearDown() {
    await utils.revokeActiveInstallationToken(this.git);
  }
}
