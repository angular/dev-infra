/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {COMMIT_TYPES, ReleaseNotesLevel} from '../../commit-message/config.js';
import {CommitFromGitLog} from '../../commit-message/parse.js';
import {GithubConfig} from '../../utils/config.js';
import {ReleaseNotesConfig} from '../config/index.js';
import {compareString} from '../../utils/locale.js';

/** List of types to be included in the release notes. */
const typesToIncludeInReleaseNotes = Object.values(COMMIT_TYPES)
  .filter((type) => type.releaseNotesLevel === ReleaseNotesLevel.Visible)
  .map((type) => type.name);

/** List of commit authors which are bots. */
const botsAuthorNames = ['dependabot[bot]', 'Renovate Bot'];

/** Data used for context during rendering. */
export interface RenderContextData {
  title: string | false;
  groupOrder: ReleaseNotesConfig['groupOrder'];
  hiddenScopes: ReleaseNotesConfig['hiddenScopes'];
  categorizeCommit: ReleaseNotesConfig['categorizeCommit'];
  commits: CommitFromGitLog[];
  version: string;
  github: GithubConfig;
  date?: Date;
}

/** Interface describing an categorized commit. */
export interface CategorizedCommit extends CommitFromGitLog {
  groupName: string;
  description: string;
}

/** Context class used for rendering release notes. */
export class RenderContext {
  /** An array of group names in sort order if defined. */
  private readonly groupOrder = this.data.groupOrder || [];
  /** An array of scopes to hide from the release entry output. */
  private readonly hiddenScopes = this.data.hiddenScopes || [];
  /** The title of the release, or `false` if no title should be used. */
  readonly title = this.data.title;
  /** The version of the release. */
  readonly version = this.data.version;
  /** The date stamp string for use in the release notes entry. */
  readonly dateStamp = buildDateStamp(this.data.date);
  /** URL fragment that is used to create an anchor for the release. */
  readonly urlFragmentForRelease = this.data.version;
  /** List of categorized commits in the release period. */
  readonly commits = this._categorizeCommits(this.data.commits);

  constructor(private readonly data: RenderContextData) {}

  /** Gets a list of categorized commits from all commits in the release period. */
  _categorizeCommits(commits: CommitFromGitLog[]): CategorizedCommit[] {
    return commits.map((commit) => {
      const {description, groupName} = this.data.categorizeCommit?.(commit) ?? {};
      return {
        groupName: groupName ?? commit.scope,
        description: description ?? commit.subject,
        ...commit,
      };
    });
  }

  /**
   * Comparator used for sorting commits within a release notes group. Commits
   * are sorted alphabetically based on their type. Commits having the same type
   * will be sorted alphabetically based on their determined description
   */
  private _commitsWithinGroupComparator = (a: CategorizedCommit, b: CategorizedCommit): number => {
    const typeCompareOrder = compareString(a.type, b.type);
    if (typeCompareOrder === 0) {
      return compareString(a.description, b.description);
    }
    return typeCompareOrder;
  };

  /**
   * Organizes and sorts the commits into groups of commits.
   *
   * Groups are sorted either by default `Array.sort` order, or using the provided group order from
   * the configuration. Commits are order in the same order within each groups commit list as they
   * appear in the provided list of commits.
   * */
  asCommitGroups(commits: CategorizedCommit[]) {
    /** The discovered groups to organize into. */
    const groups = new Map<string, CategorizedCommit[]>();

    // Place each commit in the list into its group.
    commits.forEach((commit) => {
      const key = commit.groupName;
      const groupCommits = groups.get(key) || [];
      groups.set(key, groupCommits);
      groupCommits.push(commit);
    });

    /**
     * List of discovered commit groups which are sorted in alphanumeric order
     * based on the group title.
     */
    const commitGroups = Array.from(groups.entries())
      .map(([title, groupCommits]) => ({
        title,
        commits: groupCommits.sort(this._commitsWithinGroupComparator),
      }))
      .sort((a, b) => compareString(a.title, b.title));

    // If the configuration provides a sorting order, updated the sorted list of group keys to
    // satisfy the order of the groups provided in the list with any groups not found in the list at
    // the end of the sorted list.
    if (this.groupOrder.length) {
      for (const groupTitle of this.groupOrder.reverse()) {
        const currentIdx = commitGroups.findIndex((k) => k.title === groupTitle);
        if (currentIdx !== -1) {
          const removedGroups = commitGroups.splice(currentIdx, 1);
          commitGroups.splice(0, 0, ...removedGroups);
        }
      }
    }
    return commitGroups;
  }

  /** Whether the specified commit contains breaking changes. */
  hasBreakingChanges(commit: CategorizedCommit) {
    return commit.breakingChanges.length !== 0;
  }

  /** Whether the specified commit contains deprecations. */
  hasDeprecations(commit: CategorizedCommit) {
    return commit.deprecations.length !== 0;
  }

  /**
   * A filter function for filtering a list of commits to only include commits which
   * should appear in release notes.
   */
  includeInReleaseNotes() {
    return (commit: CategorizedCommit) => {
      if (this.hiddenScopes.includes(commit.scope)) {
        return false;
      }

      // Commits which contain breaking changes or deprecations are always included
      // in release notes. The breaking change or deprecations will already be listed
      // in a dedicated section but it is still valuable to include the actual commit.
      if (this.hasBreakingChanges(commit) || this.hasDeprecations(commit)) {
        return true;
      }

      return typesToIncludeInReleaseNotes.includes(commit.type);
    };
  }

  /**
   * A filter function for filtering a list of commits to only include commits which contain a
   * unique value for the provided field across all commits in the list.
   */
  unique(field: keyof CategorizedCommit) {
    const set = new Set<CategorizedCommit[typeof field]>();
    return (commit: CategorizedCommit) => {
      const include = !set.has(commit[field]);
      set.add(commit[field]);
      return include;
    };
  }

  /**
   * Convert a commit object to a Markdown link.
   */
  commitToLink(commit: CategorizedCommit): string {
    const url = `https://github.com/${this.data.github.owner}/${this.data.github.name}/commit/${commit.hash}`;
    return `[${commit.shortHash}](${url})`;
  }

  /**
   * Convert a pull request number to a Markdown link.
   */
  pullRequestToLink(prNumber: number): string {
    const url = `https://github.com/${this.data.github.owner}/${this.data.github.name}/pull/${prNumber}`;
    return `[#${prNumber}](${url})`;
  }

  /**
   * Transform a given string by replacing any pull request references with their
   * equivalent markdown links.
   *
   * This is useful for the changelog output. Github transforms pull request references
   * automatically in release note entries, issues and pull requests, but not for plain
   * markdown files (like the changelog file).
   */
  convertPullRequestReferencesToLinks(content: string): string {
    return content.replace(/#(\d+)/g, (_, g) => this.pullRequestToLink(Number(g)));
  }

  /**
   * Bulletize a paragraph.
   */
  bulletizeText(text: string): string {
    return '- ' + text.replace(/\n/g, '\n  ');
  }

  /**
   * Returns unique, sorted and filtered commit authors.
   */
  commitAuthors(commits: CategorizedCommit[]): string[] {
    return [...new Set(commits.map((c) => c.author))]
      .filter((a) => !botsAuthorNames.includes(a))
      .sort();
  }

  /**
   * Convert a commit object to a Markdown linked badged.
   */
  commitToBadge(commit: CategorizedCommit): string {
    let color = 'yellow';
    switch (commit.type) {
      case 'fix':
        color = 'green';
        break;
      case 'feat':
        color = 'blue';
        break;
      case 'perf':
        color = 'orange';
        break;
    }
    const url = `https://github.com/${this.data.github.owner}/${this.data.github.name}/commit/${commit.hash}`;
    const imgSrc = `https://img.shields.io/badge/${commit.shortHash}-${commit.type}-${color}`;
    return `[![${commit.type} - ${commit.shortHash}](${imgSrc})](${url})`;
  }
}

/**
 * Builds a date stamp for stamping in release notes.
 *
 * Uses the current date, or a provided date in the format of YYYY-MM-DD, i.e. 1970-11-05.
 */
export function buildDateStamp(date = new Date()) {
  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return [year, month, day].join('-');
}
