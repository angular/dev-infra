/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';
import {readFile} from 'fs/promises';
import {copyFolder, createFolder} from '../shared/file-system';
import {glob} from 'fast-glob';
import {regionParser} from '../../guides/extensions/docs-code/regions/region-parser';
import {appendCopyrightToFile} from '../shared/copyright';
import {FileType} from '../../guides/extensions/docs-code/sanitizers/eslint';
import {EXCLUDE_FILES, CONFIG_FILENAME} from './defaults';
import JSZip from 'jszip';

import {FileAndContent} from '../../../interfaces';

interface ZipConfig {
  ignore: string[];
  files: string[];
}

export async function generateZipExample(
  exampleDir: string,
  workingDir: string,
  templateDir: string,
) {
  const config = await readFile(join(exampleDir, CONFIG_FILENAME), 'utf-8');
  const stackblitzConfig: ZipConfig = JSON.parse(config) as ZipConfig;

  await createFolder(workingDir);

  // Copy template files to TEMP folder
  await copyFolder(templateDir, workingDir);

  // Copy example files to TEMP folder
  await copyFolder(exampleDir, workingDir);
  const includedPaths = await getIncludedPaths(workingDir, stackblitzConfig);

  const zip = new JSZip();
  for (const path of includedPaths) {
    const file = await getFileAndContent(workingDir, path);
    zip.file(file.path, file.content, {binary: true});
  }

  return zip.generateAsync({type: 'nodebuffer'});
}

async function getIncludedPaths(workingDir: string, config: ZipConfig): Promise<string[]> {
  const defaultIncludes = [
    '**/*.ts',
    '**/*.js',
    '**/*.css',
    '**/*.html',
    '**/*.md',
    '**/*.json',
    '**/*.svg',
  ];
  return glob(defaultIncludes, {
    cwd: workingDir,
    onlyFiles: true,
    dot: true,
    ignore: config.ignore,
  });
}

async function getFileAndContent(workingDir: string, path: string): Promise<FileAndContent> {
  let content = await readFile(join(workingDir, path), 'utf-8');
  content = appendCopyrightToFile(path, content);
  content = extractRegions(path, content);

  return {content, path};
}

async function createPostData(
  exampleDir: string,
  config: ZipConfig,
  exampleFilePaths: string[],
): Promise<Record<string, string>> {
  const postData: Record<string, string> = {};

  for (const filePath of exampleFilePaths) {
    if (EXCLUDE_FILES.some((excludedFile) => filePath.endsWith(excludedFile))) {
      continue;
    }

    let content = await readFile(join(exampleDir, filePath), 'utf-8');
    content = appendCopyrightToFile(filePath, content);
    content = extractRegions(filePath, content);

    postData[`project[files][${filePath}]`] = content;
  }

  return postData;
}

function extractRegions(path: string, contents: string): string {
  const fileType: FileType | undefined = path?.split('.').pop() as FileType;
  const regionParserResult = regionParser(contents, fileType);
  return regionParserResult.contents;
}
