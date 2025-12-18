import {existsSync} from 'node:fs';
import {green, Log} from '../../../utils/logging.js';
import {join} from 'node:path';
import {writeFile, readFile} from 'node:fs/promises';
import {formatFiles} from '../../../format/format.js';

/**
 * Updates the `renovate.json` configuration file to include a new base branch.
 * It also updates specific target labels within the package rules.
 *
 * @param projectDir - The path to the project directory.
 * @param newBranchName - The name of the new branch to add to the base branches list.
 * @returns A promise that resolves to the path of the modified `renovate.json` file if updated,
 * or `null` if the file was not found or the `baseBranchPatterns` array has an unexpected format.
 */
export async function updateRenovateConfig(
  projectDir: string,
  newBranchName: string,
): Promise<string | null> {
  const renovateConfigPath = join(projectDir, 'renovate.json');
  if (!existsSync(renovateConfigPath)) {
    Log.warn(`  ✘   Skipped updating Renovate config as it was not found.`);
    return null;
  }

  const config = await readFile(renovateConfigPath, 'utf-8');
  const configJson = JSON.parse(config) as Record<string, unknown>;
  const baseBranchPatterns = configJson['baseBranchPatterns'];

  if (!Array.isArray(baseBranchPatterns) || baseBranchPatterns.length !== 2) {
    Log.warn(
      `  ✘   Skipped updating Renovate config: "baseBranchPatterns" must contain exactly 2 branches.`,
    );

    return null;
  }

  configJson['baseBranchPatterns'] = ['main', newBranchName];

  await writeFile(renovateConfigPath, JSON.stringify(configJson, undefined, 2));
  await formatFiles([renovateConfigPath]);

  Log.info(green(`  ✓   Updated Renovate config.`));

  return renovateConfigPath;
}
