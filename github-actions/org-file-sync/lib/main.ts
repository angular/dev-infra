import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {RequestError} from '@octokit/types';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';

/**
 * A file to be synced, a custom interface is used due to Octokit's types not properly expressing
 * the content value.
 */
export interface File {
  sha: string;
  content: string;
}

/** A map of the files obtained for a repository */
export type Files = Map<string, File | null>;

/** Asserts that a given string is a valid 40-character hexadecimal git commit SHA. */
export function assertValidCommitSha(sha: unknown): asserts sha is string {
  if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/i.test(sha)) {
    throw new Error(
      `Invalid or missing context.sha: "${sha}". A valid 40-character hexadecimal commit SHA is required to pin source files.`,
    );
  }
}

/** Retrieve the files from Github which are synchronized for a given repo. */
export async function getFilesForRepo(
  github: Octokit,
  repo: string,
  filesToSync: string[],
  ref?: string,
): Promise<Files> {
  core.startGroup(`Retrieving files from "${repo}" repo${ref ? ` at ref ${ref}` : ''}`);
  const fileMap = new Map<string, File | null>();
  for (const path of filesToSync) {
    fileMap.set(path, await getFile(github, repo, path, ref));
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
export async function getFile(
  github: Octokit,
  repo: string,
  path: string,
  ref?: string,
): Promise<File | null> {
  core.info(`Retrieving "${path}" from ${repo} repo${ref ? ` at ref ${ref}` : ''}`);
  const requestParams: {owner: string; repo: string; path: string; ref?: string} = {
    owner: context.repo.owner,
    repo,
    path,
  };
  if (ref !== undefined) {
    requestParams.ref = ref;
  }

  return github.rest.repos.getContent(requestParams).then(
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
export async function updateRepoWithFiles(
  github: Octokit,
  repo: string,
  goldenFiles: Files,
  filesToSync: string[],
) {
  core.startGroup(`Update files in "${repo}" repo`);
  /** The current files, or lack of files, for synchronizing in target repo. */
  const repoFiles = await getFilesForRepo(github, repo, filesToSync);

  for (let [path, goldenFile] of goldenFiles.entries()) {
    // If the golden file does not exist, we have nothing to synchronize.
    if (goldenFile === null) {
      continue;
    }
    /** The target repository's File for the path. */
    const repoFile = repoFiles.get(path) || null;
    /** The SHA of the last time the file was updated in the target repo. */
    let repoSha: string | undefined = undefined;
    /** The current content of the file in the target repo. */
    let repoFileContent: string | undefined = undefined;

    // If the repo file is null, there is no previous information to use for comparisons
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
          // The SHA of the previous file content change is used if an update is occurring.
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

export async function runOrgFileSync(
  reposToSync: string[],
  filesToSync: string[],
  sha: string = context.sha,
  octokit?: Octokit,
) {
  assertValidCommitSha(sha);

  const github = octokit ?? new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});
  try {
    const goldenFiles: Files = await getFilesForRepo(github, context.repo.repo, filesToSync, sha);

    for (const repo of reposToSync) {
      core.info(`~~~~~~Updating "${repo}" repo~~~~~~~`);
      await updateRepoWithFiles(github, repo, goldenFiles, filesToSync);
    }
  } finally {
    if (!octokit) {
      await revokeActiveInstallationToken(github);
    }
  }
}

async function main() {
  const reposToSync = core.getMultilineInput('repos', {required: true, trimWhitespace: true});
  core.group('Repos being synced:', async () =>
    reposToSync.forEach((repo) => core.info(`- ${repo}`)),
  );
  const filesToSync = core.getMultilineInput('files', {required: true, trimWhitespace: true});
  core.group('Files being synced:', async () =>
    filesToSync.forEach((file) => core.info(`- ${file}`)),
  );

  await runOrgFileSync(reposToSync, filesToSync);
}

if (
  process.env['JASMINE_RUNNER'] === undefined &&
  !process.env['TEST_TARGET'] &&
  !process.env['TEST_SRCDIR']
) {
  main().catch((err) => {
    console.error(err);
    core.setFailed('Failed with the above error');
  });
}
