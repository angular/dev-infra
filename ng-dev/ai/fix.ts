/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createPartFromUri, FileState, GoogleGenAI, Part} from '@google/genai';
import {setTimeout} from 'node:timers/promises';
import {readFile, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';
import glob from 'fast-glob';
import assert from 'node:assert';
import {Bar} from 'cli-progress';
import {Argv, Arguments, CommandModule} from 'yargs';
import {randomUUID} from 'node:crypto';
import {DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_API_KEY} from './consts.js';
import {Spinner} from '../utils/spinner.js';
import {Log} from '../utils/logging.js';

/** Command line options. */
export interface Options {
  /** Files that the fix should apply to. */
  files: string[];

  /** Error message(s) to be resolved. */
  error: string;

  /** Model that should be used to apply the prompt. */
  model: string;

  /** Temperature for the model. */
  temperature: number;

  /** API key to use when making requests. */
  apiKey?: string;
}

interface FixedFileContent {
  filePath: string;
  content: string;
}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<Options> {
  return argv
    .positional('files', {
      description: `One or more glob patterns to find target files (e.g., 'src/**/*.ts' 'test/**/*.ts').`,
      type: 'string',
      array: true,
      demandOption: true,
    })
    .option('error', {
      alias: 'e',
      description: 'Full error description from the build process',
      type: 'string',
      demandOption: true,
    })
    .option('model', {
      type: 'string',
      alias: 'm',
      description: 'Model to use for the migration',
      default: DEFAULT_MODEL,
    })
    .option('temperature', {
      type: 'number',
      alias: 't',
      default: DEFAULT_TEMPERATURE,
      description: 'Temperature for the model. Lower temperature reduces randomness/creativity',
    })
    .option('apiKey', {
      type: 'string',
      alias: 'a',
      default: DEFAULT_API_KEY,
      description: 'API key used when making calls to the Gemini API',
    });
}

/** Yargs command handler for the command. */
async function handler(options: Arguments<Options>) {
  assert(
    options.apiKey,
    [
      'No API key configured. A Gemini API key must be set as the `GEMINI_API_KEY` environment ' +
        'variable, or passed in using the `--api-key` flag.',
      'For internal users, see go/aistudio-apikey',
    ].join('\n'),
  );

  const fixedContents = await fixFilesWithAI(
    options.apiKey,
    options.files,
    options.error,
    options.model,
    options.temperature,
  );
  Log.info('\n--- AI Suggested Fixes Summary ---');
  if (fixedContents.length === 0) {
    Log.info(
      'No files were fixed or found matching the pattern. Check your glob pattern and check whether the files exist.',
    );

    return;
  }

  Log.info('Updated files:');
  const writeTasks = fixedContents.map(({filePath, content}) =>
    writeFile(filePath, content).then(() => Log.info(` - ${filePath}`)),
  );
  await Promise.all(writeTasks);
}

async function fixFilesWithAI(
  apiKey: string,
  globPatterns: string[],
  errorDescription: string,
  model: string,
  temperature: number,
): Promise<FixedFileContent[]> {
  const filePaths = await glob(globPatterns, {
    onlyFiles: true,
    absolute: false,
  });

  if (filePaths.length === 0) {
    Log.error(`No files found matching the patterns: ${JSON.stringify(globPatterns, null, 2)}.`);
    return [];
  }

  const ai = new GoogleGenAI({vertexai: false, apiKey});
  let uploadedFileNames: string[] = [];

  const progressBar = new Bar({
    format: `{step} [{bar}] ETA: {eta}s | {value}/{total} files`,
    clearOnComplete: true,
  });

  try {
    const {
      fileNameMap,
      partsForGeneration,
      uploadedFileNames: uploadedFiles,
    } = await uploadFiles(ai, filePaths, progressBar);

    uploadedFileNames = uploadedFiles;

    const spinner = new Spinner('AI is analyzing the files and generating potential fixes...');
    const response = await ai.models.generateContent({
      model,
      contents: [{text: generatePrompt(errorDescription, fileNameMap)}, ...partsForGeneration],
      config: {
        responseMimeType: 'application/json',
        candidateCount: 1,
        maxOutputTokens: Infinity,
        temperature,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      spinner.failure(`AI returned an empty response.`);
      return [];
    }

    const fixes = JSON.parse(responseText) as FixedFileContent[];

    if (!Array.isArray(fixes)) {
      throw new Error('AI response is not a JSON array.');
    }

    spinner.complete();
    return fixes;
  } finally {
    if (uploadedFileNames.length) {
      progressBar.start(uploadedFileNames.length, 0, {
        step: 'Deleting temporary uploaded files',
      });
      const deleteTasks = uploadedFileNames.map((name) => {
        return ai.files
          .delete({name})
          .catch((error) => Log.warn(`WARNING: Failed to delete temporary file ${name}:`, error))
          .finally(() => progressBar.increment());
      });

      await Promise.allSettled(deleteTasks).finally(() => progressBar.stop());
    }
  }
}

async function uploadFiles(
  ai: GoogleGenAI,
  filePaths: string[],
  progressBar: Bar,
): Promise<{
  uploadedFileNames: string[];
  partsForGeneration: Part[];
  fileNameMap: Map<string, string>;
}> {
  const uploadedFileNames: string[] = [];
  const partsForGeneration: Part[] = [];
  const fileNameMap = new Map<string, string>();

  progressBar.start(filePaths.length, 0, {step: 'Uploading files'});

  const uploadPromises = filePaths.map(async (filePath) => {
    try {
      const uploadedFile = await ai.files.upload({
        file: new Blob([await readFile(filePath, {encoding: 'utf8'})], {
          type: 'text/plain',
        }),
        config: {
          displayName: `fix_request_${basename(filePath)}_${randomUUID()}`,
        },
      });

      assert(uploadedFile.name, 'File name cannot be undefined after upload.');

      let getFile = await ai.files.get({name: uploadedFile.name});
      while (getFile.state === FileState.PROCESSING) {
        await setTimeout(500); // Wait for 500ms before re-checking
        getFile = await ai.files.get({name: uploadedFile.name});
      }

      if (getFile.state === FileState.FAILED) {
        throw new Error(`File processing failed on API for ${filePath}. Skipping this file.`);
      }

      if (getFile.uri && getFile.mimeType) {
        const filePart = createPartFromUri(getFile.uri, getFile.mimeType);
        partsForGeneration.push(filePart);
        fileNameMap.set(filePath, uploadedFile.name);
        progressBar.increment();
        return uploadedFile.name; // Return the name on success
      } else {
        throw new Error(
          `Uploaded file for ${filePath} is missing URI or MIME type after processing. Skipping.`,
        );
      }
    } catch (error: any) {
      Log.error(`Error uploading or processing file ${filePath}: ${error.message}`);
      return null; // Indicate failure for this specific file
    }
  });

  const results = await Promise.allSettled(uploadPromises).finally(() => progressBar.stop());

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      uploadedFileNames.push(result.value);
    }
  }

  return {uploadedFileNames, fileNameMap, partsForGeneration};
}

function generatePrompt(errorDescription: string, fileNameMap: Map<string, string>): string {
  return `
    You are a highly skilled software engineer, specializing in Bazel, Starlark, Python, Angular, JavaScript,
    TypeScript, and everything related.
    The following files are part of a build process that failed with the error:
    \`\`\`
    ${errorDescription}
    \`\`\`
    Please analyze the content of EACH provided file and suggest modifications to resolve the issue.

    Your response MUST be a JSON array of objects. Each object in the array MUST have two properties:
    'filePath' (the full path from the mappings provided.) and 'content' (the complete corrected content of that file).
    DO NOT include any additional text, non modified files, commentary, or markdown outside the JSON array.
    For example:
    [
      {"filePath": "/full-path-from-mappings/file1.txt", "content": "Corrected content for file1."},
      {"filePath": "/full-path-from-mappings/file2.js", "content": "console.log('Fixed JS');"}
    ]

    IMPORTANT: The input files are mapped as follows: ${Array.from(fileNameMap.entries())}
`;
}

/** CLI command module. */
export const FixModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'fix <files..>',
  describe: 'Fixes errors from the specified error output',
};
