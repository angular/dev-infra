/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type PublishStatus = 'STAGED' | 'PUBLISHED' | 'SKIPPED' | 'FAILED';
export type TagStatus = 'CREATED' | 'SKIPPED' | 'FAILED';
export type ReleaseStatus = 'CREATED' | 'SKIPPED' | 'FAILED';
export type ExitGateStatus = 'TRIGGERED' | 'SKIPPED' | 'FAILED';

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

export interface ExitGateResult {
  project: string;
  distTag: string;
  manifestUri?: string;
  status: ExitGateStatus;
  detail?: string;
  error?: string;
}

/** Collects and formats the results of the release publishing process. */
export class PublishSummary {
  private packages: PackagePublishResult[] = [];
  private tags: TagResult[] = [];
  private release: ReleaseResult | null = null;
  private exitGate: ExitGateResult | null = null;
  private warnings: string[] = [];

  constructor(private options: {dryRun?: boolean} = {}) {}

  addPackage(result: PackagePublishResult) {
    this.packages.push(result);
  }

  addTag(result: TagResult) {
    this.tags.push(result);
  }

  setRelease(result: ReleaseResult) {
    this.release = result;
  }

  setExitGate(result: ExitGateResult) {
    this.exitGate = result;
  }

  addWarning(warning: string) {
    this.warnings.push(warning);
  }

  /** Returns whether any operation failed. */
  hasFailures(): boolean {
    return (
      this.packages.some((p) => p.status === 'FAILED') ||
      this.tags.some((t) => t.status === 'FAILED') ||
      (this.release !== null && this.release.status === 'FAILED') ||
      this.exitGate?.status === 'FAILED'
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
    if (this.exitGate && this.exitGate.status === 'FAILED') {
      failures.push(
        `OSS Exit Gate trigger for project "${this.exitGate.project}" failed: ${this.exitGate.error}`,
      );
    }
    return failures;
  }

  /** Formats the collected results as a Markdown summary. */
  toMarkdown(): string {
    let md = `## Release Publish Summary${this.options.dryRun ? ' (Dry-Run)' : ''}\n\n`;

    md += '### NPM Packages\n\n';
    md += '| Package | Version | Status | Detail |\n';
    md += '| --- | --- | --- | --- |\n';
    for (const p of this.packages) {
      let statusLabel: string;
      switch (p.status) {
        case 'STAGED':
          statusLabel = '✅ Staged (AR)';
          break;
        case 'PUBLISHED':
          statusLabel = '✅ Published';
          break;
        case 'SKIPPED':
          statusLabel = '⚠️ Skipped (Already Published)';
          break;
        case 'FAILED':
          statusLabel = '❌ Failed';
          break;
      }
      const detail = p.error ? `\`${sanitizeErrorForMarkdownTable(p.error)}\`` : '';
      md += `| \`${p.name}\` | \`${p.version}\` | ${statusLabel} | ${detail} |\n`;
    }
    md += '\n';

    if (this.exitGate !== null) {
      const eg = this.exitGate;
      md += '### OSS Exit Gate\n\n';
      md += '| Project | Dist Tag | Status | Detail |\n';
      md += '| --- | --- | --- | --- |\n';
      let statusLabel: string;
      switch (eg.status) {
        case 'TRIGGERED':
          statusLabel = '✅ Triggered';
          break;
        case 'SKIPPED':
          statusLabel = '⚠️ Skipped';
          break;
        case 'FAILED':
          statusLabel = '❌ Failed';
          break;
      }
      let rawDetail: string | undefined;
      if (eg.status === 'FAILED') {
        rawDetail = eg.error ?? eg.detail;
      } else if (eg.detail && eg.manifestUri) {
        rawDetail = `${eg.detail} (${eg.manifestUri})`;
      } else {
        rawDetail = eg.detail ?? eg.manifestUri;
      }
      const detail = rawDetail ? `\`${sanitizeErrorForMarkdownTable(rawDetail)}\`` : '';
      md += `| \`${sanitizeErrorForMarkdownTable(eg.project)}\` | \`${sanitizeErrorForMarkdownTable(eg.distTag)}\` | ${statusLabel} | ${detail} |\n`;
      md += '\n';

      if (eg.status === 'TRIGGERED' && !this.options.dryRun) {
        md +=
          '> **Note:** Packages have been staged to Artifact Registry and OSS Exit Gate has been triggered. ' +
          'Publishing to npmjs.org happens asynchronously; monitor OSS Exit Gate notification emails for completion.\n\n';
      }
    }

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
      const detail = t.error ? `\`${sanitizeErrorForMarkdownTable(t.error)}\`` : '';
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
      const detail = r.error ? `\`${sanitizeErrorForMarkdownTable(r.error)}\`` : '';
      md += `| Release \`${r.name}\` | ${statusEmoji} ${statusText} | ${detail} |\n`;
    }

    if (this.warnings.length > 0) {
      md += '\n### Warnings / Manual Follow-ups\n\n';
      for (const warning of this.warnings) {
        md += `- ${warning}\n`;
      }
    }

    return md;
  }
}

/** Sanitizes error messages to prevent breaking Markdown table formatting. */
function sanitizeErrorForMarkdownTable(error: string | undefined): string {
  if (!error) {
    return '';
  }
  return error.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').replace(/`/g, "'");
}
