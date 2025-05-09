import {existsSync} from 'node:fs';
import {green, Log} from '../../../utils/logging.js';
import {join} from 'node:path';
import {writeFile, readFile} from 'node:fs/promises';

/**
 * Updates the `renovate.json` configuration file to include a new base branch.
 *
 * @param projectDir - The project directory path.
 * @param newBranchName - The name of the new branch to add to the base branches list.
 * @returns A promise that resolves to an string containing the path to the modified `renovate.json` file,
 *          or null if config updating is disabled.
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
  const baseBranches = configJson.baseBranches;
  if (!Array.isArray(baseBranches) || baseBranches.length !== 2) {
    Log.warn(
      `  ✘   Skipped updating Renovate config: "baseBranches" must contain exactly 2 branches.`,
    );

    return null;
  }

  configJson.baseBranches = ['main', newBranchName];
  await writeFile(renovateConfigPath, JSON.stringify(configJson, undefined, 2));
  Log.info(green(`  ✓   Updated Renovate config.`));

  return renovateConfigPath;
}
