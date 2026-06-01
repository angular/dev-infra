/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '@actions/core';
import {readFile, writeFile} from 'node:fs/promises';
import glob from 'fast-glob';

/** Parse the deprecations page to extract model replacements. */
function parseDeprecations(html: string): Map<string, string> {
  const replacements = new Map<string, string>();
  const tbodyRegex = /<tbody[^>]*>([\s\S]*?)<\/tbody>/gi;
  let tbodyMatch;
  while ((tbodyMatch = tbodyRegex.exec(html)) !== null) {
    const tbodyContent = tbodyMatch[1];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(tbodyContent)) !== null) {
      const trContent = trMatch[1];
      if (!trContent) continue;
      if (trContent.includes('colspan')) continue;

      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const tds: string[] = [];
      let tdMatch;
      while ((tdMatch = tdRegex.exec(trContent)) !== null) {
        tds.push(tdMatch[1].trim());
      }

      if (tds.length >= 4) {
        const modelMatch = tds[0].match(/<code[^>]*>([^<]+)<\/code>/);
        const model = modelMatch ? modelMatch[1].trim() : tds[0];

        const replacementMatch = tds[3].match(/<code[^>]*>([^<]+)<\/code>/);
        const replacement = replacementMatch
          ? replacementMatch[1].trim()
          : tds[3].replace(/<[^>]*>/g, '').trim();

        if (model && replacement && replacement.includes('gemini')) {
          replacements.set(model, replacement);
        }
      }
    }
  }
  return replacements;
}

async function run() {
  core.info('Fetching Gemini deprecations page...');
  let html = '';
  try {
    const response = await fetch('https://ai.google.dev/gemini-api/docs/deprecations');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    html = await response.text();
  } catch (error) {
    core.setFailed(`Error fetching deprecations page: ${error}`);
    return;
  }

  const replacements = parseDeprecations(html);
  if (replacements.size === 0) {
    core.warning('No model replacements found on the deprecations page.');
    return;
  }

  core.info(`Found ${replacements.size} model replacement(s) on the deprecations page.`);
  for (const [oldModel, newModel] of replacements.entries()) {
    core.info(`  - ${oldModel} -> ${newModel}`);
  }

  // Find all .ts, .yml, .yaml files in the repository, ignoring node_modules/dist/.git
  const files = await glob(['**/*.{ts,yml,yaml}'], {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    dot: true,
  });

  let totalUpdated = 0;

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      let updatedContent = content;
      let fileChanged = false;

      for (const [oldModel, newModel] of replacements.entries()) {
        const escapedOldModel = oldModel.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![a-zA-Z0-9.-])${escapedOldModel}(?![a-zA-Z0-9.-])`, 'g');
        const newContent = updatedContent.replace(regex, newModel);
        if (newContent !== updatedContent) {
          updatedContent = newContent;
          fileChanged = true;
          core.info(`Found reference to deprecated model "${oldModel}" in ${file}.`);
        }
      }

      if (fileChanged) {
        await writeFile(file, updatedContent, 'utf-8');
        core.info(`Updated ${file}`);
        totalUpdated++;
      }
    } catch (err) {
      core.error(`Failed to read/write file ${file}: ${err}`);
    }
  }

  if (totalUpdated === 0) {
    core.info('No deprecated model references found in the codebase. All up to date! 🎉');
  } else {
    core.info(`Successfully updated ${totalUpdated} file(s).`);
  }
}

run().catch((err) => {
  core.setFailed(`Unhandled execution error: ${err}`);
});
