/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type PublishStatus = 'PUBLISHED' | 'SKIPPED' | 'FAILED';
export type TagStatus = 'CREATED' | 'SKIPPED' | 'FAILED';
export type ReleaseStatus = 'CREATED' | 'SKIPPED' | 'FAILED';

export interface PackagePublishResult {
  name: string;
  version: string;
  status: PublishStatus;
  error?: string;
}

export interface TagResult {
  name: string;
  status: TagStatus;
  error?: string;
}

export interface ReleaseResult {
  name: string;
  status: ReleaseStatus;
  error?: string;
}

/** Collects and formats the results of the release publishing process. */
export class PublishSummary {
  private packages: PackagePublishResult[] = [];
  private tags: TagResult[] = [];
  private release: ReleaseResult | null = null;

  addPackage(result: PackagePublishResult) {
    this.packages.push(result);
  }

  addTag(result: TagResult) {
    this.tags.push(result);
  }

  setRelease(result: ReleaseResult) {
    this.release = result;
  }

  /** Returns whether any operation failed. */
  hasFailures(): boolean {
    return (
      this.packages.some((p) => p.status === 'FAILED') ||
      this.tags.some((t) => t.status === 'FAILED') ||
      (this.release !== null && this.release.status === 'FAILED')
    );
  }

  /** Returns whether a specific package failed to publish. */
  hasPackageFailed(name: string): boolean {
    return this.packages.some((p) => p.name === name && p.status === 'FAILED');
  }

  /** Returns a list of detailed failure messages. */
  getFailedItems(): string[] {
    const failures: string[] = [];
    for (const p of this.packages) {
      if (p.status === 'FAILED') {
        failures.push(`Package "${p.name}@${p.version}" failed to publish: ${p.error}`);
      }
    }
    for (const t of this.tags) {
      if (t.status === 'FAILED') {
        failures.push(`Git tag "${t.name}" failed to create: ${t.error}`);
      }
    }
    if (this.release && this.release.status === 'FAILED') {
      failures.push(
        `GitHub Release "${this.release.name}" failed to create: ${this.release.error}`,
      );
    }
    return failures;
  }

  /** Formats the collected results as a Markdown summary. */
  toMarkdown(): string {
    let md = '## Release Publish Summary\n\n';

    md += '### NPM Packages\n\n';
    md += '| Package | Version | Status | Detail |\n';
    md += '| --- | --- | --- | --- |\n';
    for (const p of this.packages) {
      const statusEmoji = p.status === 'PUBLISHED' ? '✅' : p.status === 'SKIPPED' ? '⚠️' : '❌';
      const statusText =
        p.status === 'PUBLISHED'
          ? 'Published'
          : p.status === 'SKIPPED'
            ? 'Skipped (Already Published)'
            : 'Failed';
      const detail = p.error ? `\`${p.error}\`` : '';
      md += `| \`${p.name}\` | \`${p.version}\` | ${statusEmoji} ${statusText} | ${detail} |\n`;
    }
    md += '\n';

    md += '### Git Tags & GitHub Release\n\n';
    md += '| Item | Status | Detail |\n';
    md += '| --- | --- | --- |\n';
    for (const t of this.tags) {
      const statusEmoji = t.status === 'CREATED' ? '✅' : t.status === 'SKIPPED' ? '⚠️' : '❌';
      const statusText =
        t.status === 'CREATED'
          ? 'Created'
          : t.status === 'SKIPPED'
            ? 'Skipped (Already Exists)'
            : 'Failed';
      const detail = t.error ? `\`${t.error}\`` : '';
      md += `| Tag \`${t.name}\` | ${statusEmoji} ${statusText} | ${detail} |\n`;
    }
    if (this.release) {
      const r = this.release;
      const statusEmoji = r.status === 'CREATED' ? '✅' : r.status === 'SKIPPED' ? '⚠️' : '❌';
      const statusText =
        r.status === 'CREATED'
          ? 'Created'
          : r.status === 'SKIPPED'
            ? 'Skipped (Already Exists)'
            : 'Failed';
      const detail = r.error ? `\`${r.error}\`` : '';
      md += `| Release \`${r.name}\` | ${statusEmoji} ${statusText} | ${detail} |\n`;
    }
    return md;
  }
}
