import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {allLabels, Label} from '../../../ng-dev/pr/common/labels.js';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';

/** The type for a Github label returned from the Github API.  */
type GithubLabel =
  RestEndpointMethodTypes['issues']['listLabelsForRepo']['response']['data'][number];

/** Synchronize the provided managed labels with the given repository. */
async function syncLabelsInRepo(github: Octokit, repoName: string, managedLabels: Label[]) {
  core.startGroup(`Repository: ${repoName}`);
  /** The current repository name and owner for usage in the Github API. */
  const repo = {repo: repoName, owner: context.repo.owner};

  core.debug(`Requesting labels`);
  /** The list of current labels from Github for the repository. */
  const repoLabels = await github.paginate(github.issues.listLabelsForRepo, repo);
  core.debug(`Retrieved ${repoLabels.length} from Github`);

  // For each label in the list of managed labels, ensure that it exists and is in sync.
  // NOTE: Not all labels in repositories are managed. Labels which are not included or managed in
  // our tooling definitions and configurations are ignored entirely by tooling.
  for (const {description, name, color} of managedLabels) {
    /** The label from Github if a match is found. */
    const matchedLabel = repoLabels.find((label: GithubLabel) => label.name === name);

    // When no matched label is found, Github doesn't currently have the label we intend to sync,
    // we create the label via the API directly.
    if (matchedLabel === undefined) {
      core.info(`${name}: Adding label to repository`);
      await github.issues.createLabel({...repo, name, description, color});
      continue;
    }

    // If a description and name of the label are defined for the managed label, and they match
    // the current name and description of the label from Github, everything is in sync.
    if (
      (description === undefined || description === matchedLabel.description) &&
      (name === undefined || name === matchedLabel.name) &&
      (color === undefined || color === matchedLabel.color)
    ) {
      core.info(`${name}: Skipping, already in sync`);
      continue;
    }

    // Since the synced and new label cases have been handled, the only remaining action would be
    // to update the label to bring the name and description in sync without expectations.
    core.info(`${name}: Updating in repository`);
    await github.issues.updateLabel({
      ...repo,
      new_name: name,
      name: matchedLabel.name,
      description: description,
      color,
    });
  }
  core.endGroup();
}

async function main() {
  /** The Github API instance to use for requests. */
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});

  try {
    /** The list of managed labels. */
    const labels = [...Object.values(allLabels)];
    /** The repositories to sync the labels in, from the provided config. */
    const repos = core.getMultilineInput('repos', {required: true, trimWhitespace: true});

    await core.group('Repos being synced:', async () =>
      repos.forEach((repo) => core.info(`- ${repo}`)),
    );
    for (const repo of repos) {
      await syncLabelsInRepo(github, repo, labels);
    }
  } finally {
    await revokeActiveInstallationToken(github);
  }
}

main().catch((err) => {
  console.error(err);
  core.setFailed('Failed with the above error');
});
