import {existsSync} from 'node:fs';
import {green, Log} from '../../../utils/logging.js';
import {join} from 'node:path';
import {writeFile, readFile} from 'node:fs/promises';
import {targetLabels} from '../../../pr/common/labels/target.js';

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

  updateRenovateTargetLabel(
    configJson,
    targetLabels['TARGET_PATCH'].name,
    targetLabels['TARGET_RC'].name,
  );
  await writeFile(renovateConfigPath, JSON.stringify(configJson, undefined, 2));

  Log.info(green(`  ✓   Updated Renovate config.`));
  return renovateConfigPath;
}

/**
 * Updates a specific target label in the `renovate.json` configuration file.
 * This function specifically targets and replaces one label with another within the `packageRules`.
 *
 * @param projectDir - The path to the project directory.
 * @param fromLabel - The label name to be replaced.
 * @param toLabel - The new label name to replace `fromLabel` with.
 * @returns A promise that resolves to the path of the modified `renovate.json` file if updated,
 * or `null` if the file was not found or the `baseBranchPatterns` array has an unexpected format.
 */
export async function updateRenovateConfigTargetLabels(
  projectDir: string,
  fromLabel: string,
  toLabel: string,
): Promise<string | null> {
  const renovateConfigPath = join(projectDir, 'renovate.json');
  if (!existsSync(renovateConfigPath)) {
    Log.warn(`  ✘   Skipped updating Renovate config as it was not found.`);

    return null;
  }

  const config = await readFile(renovateConfigPath, 'utf-8');
  const configJson = JSON.parse(config) as Record<string, unknown>;

  // Check baseBranchPatterns just in case, though this function's primary focus is labels
  const baseBranchPatterns = configJson['baseBranchPatterns'];
  if (!Array.isArray(baseBranchPatterns) || baseBranchPatterns.length !== 2) {
    Log.warn(
      `  ✘   Skipped updating Renovate config: "baseBranchPatterns" must contain exactly 2 branches.`,
    );

    return null;
  }

  if (updateRenovateTargetLabel(configJson, fromLabel, toLabel)) {
    await writeFile(renovateConfigPath, JSON.stringify(configJson, undefined, 2));
    Log.info(green(`  ✓   Updated target label in Renovate config.`));

    return renovateConfigPath;
  } else {
    Log.info(green(`  ✓   No changes to target labels in Renovate config.`));
    return null;
  }
}

/**
 * Updates a specific target label within the `packageRules` of a Renovate configuration.
 *
 * @param configJson - The parsed JSON object of the Renovate configuration.
 * @param fromLabel - The label name to be replaced.
 * @param toLabel - The new label name to replace `fromLabel` with.
 * @returns `true` is the label has been updated, otherwise `false`.
 */
function updateRenovateTargetLabel(
  configJson: Record<string, unknown>,
  fromLabel: string,
  toLabel: string,
): boolean {
  if (!Array.isArray(configJson['packageRules'])) {
    return false;
  }

  let updated = false;
  for (const rule of configJson['packageRules']) {
    if (!Array.isArray(rule.addLabels)) {
      continue;
    }

    const idx = (rule.addLabels as string[]).findIndex((x) => x === fromLabel);
    if (idx >= 0) {
      rule.addLabels[idx] = toLabel;
      updated = true;
    }
  }

  return updated;
}
