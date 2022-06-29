import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {RequestError} from '@octokit/types';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';

const reposToSync = core.getMultilineInput('repos', {required: true, trimWhitespace: true});
const fileToSync = core.getMultilineInput('files', {required: true, trimWhitespace: true});

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
  const fileMap = new Map<string, File | null>();
  for (const path of fileToSync) {
    fileMap.set(path, await getFile(github, repo, path));
  }
  return fileMap;
}

/**
 * Retrieve the file content for a specified file, properly handling the file not existing in the
 * repo and returning a 404.
 */
async function getFile(github: Octokit, repo: string, path: string): Promise<File | null> {
  return github.rest.repos.getContent({owner: context.repo.owner, repo, path}).then(
    (response) => {
      if ((response.data as {content?: string}).content !== undefined) {
        return response.data as File;
      }
      return null;
    },
    (reason: RequestError) => {
      if (reason.status === 404) {
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
  /**
   * Promises resolved when an update is completed.
   * Note: An array is used to allow for awaiting everything via `Promise.all`
   */
  let updates: Promise<unknown>[] = [];
  /** The current files, or lack of files, for synchronizing in target repo. */
  const repoFiles = await getFilesForRepo(github, repo);

  goldenFiles.forEach((goldenFile, path) => {
    // If the golden file does not exist, we have nothing to syncronize.
    if (goldenFile === null) {
      return;
    }
    /** The target repository's File for the path. */
    const repoFile = repoFiles.get(path) || null;
    /** The SHA of the last time the file was updated in the target repo. */
    let repoSha: string | undefined;
    /** The current content of the file in the target repo. */
    let repoFileContent: string | undefined;

    // If the repo file is null, there is not previous information to use for comparisons
    if (repoFile !== null) {
      repoSha = repoFile.sha;
      repoFileContent = repoFile.content;
    }

    if (repoFileContent !== goldenFile.content) {
      updates.push(
        github.repos.createOrUpdateFileContents({
          content: goldenFile.content,
          owner: context.repo.owner,
          repo,
          path,
          message: `build: update \`${path}\` to match the content of \`${context.repo.owner}/${context.repo.repo}\``,
          // The SHA of the previous file content change is used if an update is occuring.
          sha: repoSha,
        }),
      );
    }
  });

  await Promise.all(updates);
}

async function main() {
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});
  try {
    const goldenFiles: Files = await getFilesForRepo(github, context.repo.repo);

    for (const repo of reposToSync) {
      await updateRepoWithFiles(github, repo, goldenFiles);
    }
  } finally {
    await revokeActiveInstallationToken(github);
  }
}

main().catch((err) => {
  core.error(err);
  core.setFailed('Failed with the above error');
});
