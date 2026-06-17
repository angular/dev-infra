import * as fs from 'node:fs';
import * as path from 'node:path';
import * as core from '@actions/core';

// Regex to match uses: lines
const USES_REGEX = /^\s*(?:-\s*)?uses:\s*(.+)$/;
const BLOCK_SCALAR_REGEX = /^\s*(?:-\s*)?[a-zA-Z0-9_-]+\s*:\s*[|>]/;

function checkWorkflowFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let isValid = true;
  let inBlockScalar = false;
  let blockIndent = 0;

  lines.forEach((line, index) => {
    if (inBlockScalar) {
      const currentIndent = line.search(/\S/);
      if (currentIndent !== -1 && currentIndent <= blockIndent) {
        inBlockScalar = false;
      } else {
        return;
      }
    }

    if (line.match(BLOCK_SCALAR_REGEX)) {
      inBlockScalar = true;
      blockIndent = line.search(/\S/);
    }

    const match = line.match(USES_REGEX);
    if (match) {
      const fullUses = match[1].trim();

      // Split by '#' to separate comment
      const hashIndex = fullUses.indexOf('#');
      let usesPart = fullUses;
      let commentPart = '';

      if (hashIndex !== -1) {
        usesPart = fullUses.substring(0, hashIndex).trim();
        commentPart = fullUses.substring(hashIndex + 1).trim();
      }

      // Remove quotes from usesPart
      const uses = usesPart.replace(/^['"]|['"]$/g, '').trim();

      // Skip local actions
      if (uses.startsWith('./')) {
        return;
      }

      // Now verify `uses` has SHA and `commentPart` has version
      const atIndex = uses.indexOf('@');
      if (atIndex === -1) {
        core.error(
          `${filePath}:${index + 1}: Action "${uses}" should use "action-name@SHA # version" format (missing @).`,
        );
        isValid = false;
        return;
      }

      const action = uses.substring(0, atIndex);
      const version = uses.substring(atIndex + 1);

      const isSha = /^[a-fA-F0-9]{40}$/.test(version);
      if (!isSha) {
        core.error(
          `${filePath}:${index + 1}: Action "${action}" should use a 40-character SHA for version, but got "${version}".`,
        );
        isValid = false;
      }

      if (!commentPart) {
        core.error(
          `${filePath}:${index + 1}: Action "${action}" is missing a version comment (e.g. "# v1.0.0").`,
        );
        isValid = false;
      } else {
        const isVersionComment = /^v\d+/.test(commentPart);
        if (!isVersionComment) {
          core.error(
            `${filePath}:${index + 1}: Action "${action}" has comment "${commentPart}" which does not look like a version (should start with 'v', e.g. '# v1.0.0').`,
          );
          isValid = false;
        }
      }
    }
  });

  return isValid;
}

function run() {
  try {
    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    const workflowsDir = path.join(workspace, '.github/workflows');
    if (!fs.existsSync(workflowsDir)) {
      core.setFailed(`Workflows directory not found: ${workflowsDir}`);
      return;
    }

    const files = fs
      .readdirSync(workflowsDir, {withFileTypes: true})
      .filter(
        (entry) => entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')),
      )
      .map((entry) => entry.name);
    let allValid = true;

    for (const file of files) {
      const filePath = path.join(workflowsDir, file);
      core.info(`Checking ${file}...`);
      if (!checkWorkflowFile(filePath)) {
        allValid = false;
      }
    }

    if (!allValid) {
      core.setFailed('Some workflows are using unpinned actions or missing version comments.');
    } else {
      core.info('All workflows are valid!');
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
