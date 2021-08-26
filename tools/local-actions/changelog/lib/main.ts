import * as core from '@actions/core';
import {context} from '@actions/github';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {SemVer} from 'semver';
import {ReleaseNotes} from '../../../../ng-dev/release/notes/release-notes';
import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client';
import {ANGULAR_ROBOT, getAuthTokenFor} from '../../../../github-actions/utils';
import {GithubConfig, setConfig} from '../../../../ng-dev/utils/config';
import {ReleaseConfig} from '../../../../ng-dev/release/config/index';

/** The tag used for tracking the last time the changlog was generated. */
const lastChangelogTag = 'most-recent-changelog-generation';
/** Marker comment used to split the changelog into a list of distinct changelog entries.  */
const splitMarker = '\n<!-- CHANGELOG SPLIT MARKER -->\n';
/** The commit message used for the changes to the CHANGELOG. */
const commitMessage = 'release: create weekly changelog entry';

// Set the cached configuration object to be used throughout the action.
const config: {github: GithubConfig; release: ReleaseConfig} = {
  github: {
    mainBranchName: 'main',
    name: context.repo.repo,
    owner: context.repo.owner,
  },
  release: {
    npmPackages: [],
    buildPackages: async () => [],
    releaseNotes: {
      categorizeCommit: (commit) => {
        const [groupName, area] = commit.scope.split('/');
        /** The scope slug to be used in the description's used in CHANGELOG.md */
        const scope = area ? `**${area}:** ` : '';
        return {
          groupName,
          description: `${scope}${commit.subject}`,
        };
      },
    },
  },
};
setConfig(config);

async function run(): Promise<void> {
  // Configure the AuthenticatedGitClient to be authenticated with the token for the Angular Robot.
  AuthenticatedGitClient.configure(await getAuthTokenFor(ANGULAR_ROBOT));
  /** The authenticed GitClient. */
  const git = AuthenticatedGitClient.get();
  git.run(['config', 'user.email', 'angular-robot@google.com']);
  git.run(['config', 'user.name', 'Angular Robot']);

  /** The full path to the changelog file. */
  const changelogFile = join(git.baseDir, 'CHANGELOG.md');
  /** The full path of the changelog */
  const changelogArchiveFile = join(git.baseDir, 'CHANGELOG_ARCHIVE.md');
  /** The sha of the commit when the changelog was most recently generated. */
  const lastChangelogRef = getLatestRefFromUpstream(lastChangelogTag);
  /** The sha of the latest commit on the main branch. */
  const latestRef = getLatestRefFromUpstream(git.mainBranchName);
  /** The release notes generation object. */
  const releaseNotes = await ReleaseNotes.forRange(getTodayAsSemver(), lastChangelogRef, latestRef);

  if ((await releaseNotes.getCommitCountInReleaseNotes()) === 0) {
    console.log('No release notes are needed as no commits would be included.');
    return;
  }

  /** The changelog entry for commits on the main branch since the last changelog was generated. */
  const changelogEntry = await releaseNotes.getChangelogEntry();

  // Checkout the main branch at the latest commit.
  git.run(['checkout', '--detach', latestRef]);

  /** The changelog entries in the current changelog. */
  const changelog = readFileSync(changelogFile, {encoding: 'utf8'}).split(splitMarker);

  // When the changelog has more than 12 entries (roughly one quarter of the year in weekly
  // releases), extra changelog entries are moved to the changelog archive.
  if (changelog.length > 12) {
    /** The changelog entries in the changelog archive. */
    let changelogArchive: string[] = [];
    if (existsSync(changelogArchiveFile)) {
      changelogArchive = readFileSync(changelogArchiveFile, {encoding: 'utf8'}).split(splitMarker);
    }
    changelogArchive.unshift(...changelog.splice(12));
    writeAndAddToGit(changelogArchiveFile, changelogArchive.join(splitMarker));
  }

  // Place the new changelog entry at the beginning of the changelog entries list.
  changelog.unshift(changelogEntry);
  writeAndAddToGit(changelogFile, changelog.join(splitMarker));

  // Commit the new changelog(s) and push the changes to github.
  git.run(['commit', '--no-verify', '-m', commitMessage]);
  git.run(['push', git.getRepoGitUrl(), `HEAD:refs/heads/${git.mainBranchName}`]);
  // A force push is used to update the tag git does not expect it to move and a force is neccessary
  // to update it from its old sha.
  git.run(['push', '-f', git.getRepoGitUrl(), `HEAD:refs/tags/${lastChangelogTag}`]);
}

/** Write the contents to the provided file and add it to git staging. */
function writeAndAddToGit(filePath: string, contents: string) {
  const git = AuthenticatedGitClient.get();
  writeFileSync(filePath, contents);
  git.run(['add', filePath]);
}

/** Retrieve the latest ref for the branch or tag from upstream. */
function getLatestRefFromUpstream(branchOrTag: string) {
  try {
    const git = AuthenticatedGitClient.get();
    git.runGraceful(['fetch', git.getRepoGitUrl(), branchOrTag, '--depth=250']);
    return git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
  } catch {
    core.error(`Unable to retrieve '${branchOrTag}' from upstream`);
    process.exit(1);
  }
}

/** Create a semver tag based on todays date. */
function getTodayAsSemver() {
  const today = new Date();
  return new SemVer(`${today.getFullYear()}.${today.getMonth() + 1}.${today.getDay()}`);
}

// This action should only be run in the angular/dev-infra repo.
if (context.repo.owner === 'angular' && context.repo.repo === 'dev-infra') {
  run().catch((e: Error) => {
    core.error(e);
    core.setFailed(e.message);
  });
}
