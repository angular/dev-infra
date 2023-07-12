import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {RequestError} from '@octokit/types';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import fetch from 'node-fetch';

const reposToSync = core.getMultilineInput('repos', {required: true, trimWhitespace: true});
core.group('Repos being synced:', async () =>
  reposToSync.forEach((repo) => core.info(`- ${repo}`)),
);
const filesToSync = core.getMultilineInput('files', {required: true, trimWhitespace: true});
core.group('Files being synced:', async () =>
  filesToSync.forEach((file) => core.info(`- ${file}`)),
);

/**
 * A file to be synced, a custom interface is used due to Octokit's types not properly expressing
 * the content value.
 */
interface File {
  sha: string;
  content: string;
}

/** A map of the files obtained for a repository */
type Files = Map<string, File | null>;

/** Retrieve the files from Github which are syncronized for a given repo. */
async function getFilesForRepo(github: Octokit, repo: string): Promise<Files> {
  core.startGroup(`Retrieving files from "${repo}" repo`);
  const fileMap = new Map<string, File | null>();
  for (const path of filesToSync) {
    fileMap.set(path, await getFile(github, repo, path));
  }
  const fileCount = [...fileMap.values()].filter((file) => file !== null).length;
  core.info(`Retrieved ${fileCount} file(s)`);
  core.endGroup();
  return fileMap;
}

/**
 * Retrieve the file content for a specified file, properly handling the file not existing in the
 * repo and returning a 404.
 */
async function getFile(github: Octokit, repo: string, path: string): Promise<File | null> {
  core.info(`Retrieving "${path}" from ${repo} repo`);
  return github.rest.repos.getContent({owner: context.repo.owner, repo, path}).then(
    (response) => {
      if ((response.data as {content?: string}).content !== undefined) {
        return response.data as File;
      }
      return null;
    },
    (reason: RequestError) => {
      if (reason.status === 404) {
        core.warning(`"${path}" does not exist in "${repo}" repo`);
        return null;
      }
      throw reason;
    },
  );
}

/**
 * Update the target repo to ensure the provided golden file contents are used for the files
 * with the same path in the repo.
 */
async function updateRepoWithFiles(github: Octokit, repo: string, goldenFiles: Files) {
  core.startGroup(`Update files in "${repo}" repo`);
  /** The current files, or lack of files, for synchronizing in target repo. */
  const repoFiles = await getFilesForRepo(github, repo);

  for (let [path, goldenFile] of goldenFiles.entries()) {
    // If the golden file does not exist, we have nothing to syncronize.
    if (goldenFile === null) {
      continue;
    }
    /** The target repository's File for the path. */
    const repoFile = repoFiles.get(path) || null;
    /** The SHA of the last time the file was updated in the target repo. */
    let repoSha: string | undefined = undefined;
    /** The current content of the file in the target repo. */
    let repoFileContent: string | undefined = undefined;

    // If the repo file is null, there is not previous information to use for comparisons
    if (repoFile !== null) {
      repoSha = repoFile.sha;
      repoFileContent = repoFile.content;
    }

    if (repoFileContent !== goldenFile.content) {
      core.info(`Updating "${path}" in "${repo}" repo`);
      try {
        await github.repos.createOrUpdateFileContents({
          content: goldenFile.content,
          owner: context.repo.owner,
          repo,
          path,
          message: `build: update \`${path}\` to match the content of \`${context.repo.owner}/${context.repo.repo}\``,
          // The SHA of the previous file content change is used if an update is occuring.
          sha: repoSha,
        });
      } catch (e) {
        core.info(`Failed to update "${path}"`);
        console.error(e);
      }
    } else {
      core.info(`"${path}" is already in sync`);
    }
  }
  core.endGroup();
}

async function main() {
  // TODO: remove once GHA supports node18 as a target runner for Javascript action
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT), request: {fetch}});
  try {
    const goldenFiles: Files = await getFilesForRepo(github, context.repo.repo);

    for (const repo of reposToSync) {
      core.info(`~~~~~~Updating "${repo}" repo~~~~~~~`);
      await updateRepoWithFiles(github, repo, goldenFiles);
    }
  } finally {
    await revokeActiveInstallationToken(github);
  }
}

main().catch((err) => {
  console.error(err);
  core.setFailed('Failed with the above error');
});
