/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {z} from 'zod';
import {readFile} from 'node:fs/promises';
import {join, basename} from 'node:path';
import glob from 'fast-glob';
import {parse} from 'yaml';
import {bold, green, Log, red, yellow} from '../../utils/logging.js';

/**
 * Validation schema for the SKILL.md frontmatter.
 * Based on https://agentskills.io/specification
 */
const skillFrontmatterSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Name must only contain lowercase alphanumeric characters and hyphens')
    .refine(
      (val) => !val.startsWith('-') && !val.endsWith('-') && !val.includes('--'),
      'Name must not start/end with hyphens or contain consecutive hyphens',
    ),
  description: z.string().min(1).max(1024),
  license: z.string().min(1),
  compatibility: z.string().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  'allowed-tools': z
    .string()
    .transform((val) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .optional(),
});

export interface ValidationResult {
  name: string;
  failures: string[];
}

/** Validates all skills found in the `skills/` directory. */
export async function validateSkills(
  repoRoot: string,
): Promise<{results: ValidationResult[]; exitCode: number}> {
  let errorCount = 0;
  const skillFiles = await glob('**/SKILL.md', {cwd: join(repoRoot, 'skills'), absolute: true});

  if (skillFiles.length === 0) {
    Log.info(` ${yellow('⚠')}  No skills found in skills/ directory.`);
    return {results: [], exitCode: 0};
  }

  Log.info(`Found ${skillFiles.length} skills. Validating...`);

  const validationResults = await Promise.all(skillFiles.map(validateSkill));

  for (const result of validationResults.sort((a, b) => a.failures.length - b.failures.length)) {
    if (result.failures.length > 0) {
      Log.info(` ${red('✘')}  ${bold(result.name)} (${join('skills', result.name, 'SKILL.md')})`);
      result.failures.forEach((failure) => {
        Log.info(`  -  ${failure}`);
        errorCount++;
      });
    } else {
      Log.info(` ${green('✔')}  ${bold(result.name)} (${join('skills', result.name, 'SKILL.md')})`);
    }
  }

  Log.info();
  if (errorCount > 0) {
    Log.error(` ${red('✘')}  Validation failed with ${errorCount} errors.`);
    return {results: validationResults, exitCode: 1};
  } else {
    Log.info(` ${green('✔')} All skills validated successfully.`);
    return {results: validationResults, exitCode: 0};
  }
}

/** Validates a single skill file. */
export async function validateSkill(filePath: string): Promise<ValidationResult> {
  const name = basename(join(filePath, '..'));
  const failures: string[] = [];

  try {
    const content = await readFile(filePath, {encoding: 'utf8'});
    const frontmatterRaw = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterRaw === null) {
      failures.push('Missing or invalid frontmatter in SKILL.md');
      return {name, failures};
    }

    let frontmatter: unknown;
    try {
      frontmatter = parse(frontmatterRaw[1]);
    } catch (e) {
      failures.push(`Failed to parse YAML frontmatter: ${(e as Error).message}`);
      return {name, failures};
    }

    const frontmatterData = skillFrontmatterSchema.safeParse(frontmatter);
    if (frontmatterData.success === false) {
      for (const issue of frontmatterData.error.issues) {
        failures.push(`Schema validation failure: [${issue.path.join('.')}] ${issue.message}`);
      }
      return {name, failures};
    }

    // Check name match if data looks like an object with a name
    if (frontmatterData.data?.name !== name) {
      failures.push(
        `Name mismatch. Expected "${name}", found "${frontmatterData.data?.name ?? '<UNKNOWN>'}"`,
      );
    }
  } catch (e) {
    failures.push(`Unexpected error: ${(e as Error).message}`);
  }

  return {name, failures};
}
