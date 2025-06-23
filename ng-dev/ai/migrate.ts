/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GoogleGenAI} from '@google/genai';
import {Argv, Arguments, CommandModule} from 'yargs';
import {readFile, writeFile} from 'fs/promises';
import {SingleBar, Presets} from 'cli-progress';
import {DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_API_KEY} from './consts.js';
import assert from 'node:assert';
import {Log} from '../utils/logging.js';
import glob from 'fast-glob';

/** Command line options. */
export interface Options {
  /** Prompt that should be applied. */
  prompt: string;

  /** Glob of files that the prompt should apply to. */
  files: string;

  /** Model that should be used to apply the prompt. */
  model: string;

  /** Temperature for the model. */
  temperature: number;

  /** Maximum number of concurrent API requests. */
  maxConcurrency: number;

  /** API key to use when making requests. */
  apiKey?: string;
}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<Options> {
  return argv
    .option('prompt', {
      type: 'string',
      alias: 'p',
      description: 'Path to the file containg the prompt that will be run',
      demandOption: true,
    })
    .option('files', {
      type: 'string',
      alias: 'f',
      description: 'Glob for the files that should be migrated',
      demandOption: true,
    })
    .option('model', {
      type: 'string',
      alias: 'm',
      description: 'Model to use for the migration',
      default: DEFAULT_MODEL,
    })
    .option('maxConcurrency', {
      type: 'number',
      default: 25,
      description:
        'Maximum number of concurrent requests to the API. Higher numbers may hit usages limits',
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
      description: 'API key used when making calls to the Gemini API',
    });
}

/** Yargs command handler for the command. */
async function handler(options: Arguments<Options>) {
  const apiKey = options.apiKey || DEFAULT_API_KEY;

  assert(
    apiKey,
    [
      'No API key configured. A Gemini API key must be set as the `GEMINI_API_KEY` environment ' +
        'variable, or passed in using the `--api-key` flag.',
      'For internal users, see go/aistudio-apikey',
    ].join('\n'),
  );

  const [files, prompt] = await Promise.all([
    glob([options.files]),
    readFile(options.prompt, 'utf-8'),
  ]);

  if (files.length === 0) {
    Log.error(`No files matched the pattern "${options.files}"`);
    process.exit(1);
  }

  const ai = new GoogleGenAI({apiKey});
  const progressBar = new SingleBar({}, Presets.shades_grey);
  const failures: {name: string; error: string}[] = [];
  const running = new Set<Promise<void>>();

  Log.info(
    [
      `Applying prompt from ${options.prompt} to ${files.length} files(s).`,
      `Using model ${options.model} with a temperature of ${options.temperature}.`,
      '', // Extra new line at the end.
    ].join('\n'),
  );
  progressBar.start(files.length, 0);

  // Kicks off the maximum number of concurrent requests and ensures that as many requests as
  // possible are running at the same time. This is preferrable to chunking, because it allows
  // the requests to keep running even if there's one which is taking a long time to resolve.
  while (files.length > 0 || running.size > 0) {
    // Fill up to maxConcurrency
    while (files.length > 0 && running.size < options.maxConcurrency) {
      const file = files.shift()!;
      const task = processFile(file).finally(() => running.delete(task));
      running.add(task);
    }

    // Wait for any task to finish
    if (running.size > 0) {
      await Promise.race(running);
    }
  }

  progressBar.stop();

  for (const {name, error} of failures) {
    Log.info('-------------------------------------');
    Log.info(`${name} failed to migrate:`);
    Log.info(error);
  }

  Log.info(`\nDone 🎉`);

  if (failures.length > 0) {
    Log.info(`${failures.length} file(s) failed. See logs above for more information.`);
  }

  async function processFile(file: string): Promise<void> {
    try {
      const content = await readFile(file, 'utf-8');
      const result = await applyPrompt(ai, options.model, options.temperature, content, prompt);
      await writeFile(file, result);
    } catch (e) {
      failures.push({name: file, error: (e as Error).toString()});
    } finally {
      progressBar.increment();
    }
  }
}

/**
 * Applies a prompt to a specific file's content.
 * @param ai Instance of the GenAI SDK.
 * @param model Model to use for the prompt.
 * @param temperature Temperature for the promp.
 * @param content Content of the file.
 * @param prompt Prompt to be run.
 */
async function applyPrompt(
  ai: GoogleGenAI,
  model: string,
  temperature: number,
  content: string,
  prompt: string,
): Promise<string> {
  // The schema ensures that the API returns a response in the format that we expect.
  const responseSchema = {
    type: 'object',
    properties: {
      content: {type: 'string', description: 'Changed content of the file'},
    },
    required: ['content'],
    additionalProperties: false,
    $schema: 'http://json-schema.org/draft-07/schema#',
  };

  // Note that technically we can batch multiple files into a single `generateContent` call.
  // We don't do it, because it increases the risk that we'll hit the output token limit which
  // can corrupt the entire response. This way one file failing won't break the entire run.
  const response = await ai.models.generateContent({
    model,
    contents: [{text: prompt}, {text: content}],
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature,
      // We need as many output tokens as we can get.
      maxOutputTokens: Infinity,
      // We know that we'll only use one candidate so we can save some processing.
      candidateCount: 1,
      // Guide the LLM towards following our schema.
      systemInstruction:
        `Return output following the structured output schema. ` +
        `Return an object containing the new contents of the changed file.`,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error(`No response from the API. Response:\n` + JSON.stringify(response, null, 2));
  }

  let parsed: {content?: string};

  try {
    parsed = JSON.parse(text) as {content: string};
  } catch {
    throw new Error(
      'Failed to parse result as JSON. This can happen if if maximum output ' +
        'token size has been reached. Try using a different model. ' +
        'Response:\n' +
        JSON.stringify(response, null, 2),
    );
  }

  if (!parsed.content) {
    throw new Error(
      'Could not find content in parsed API response. This can indicate a problem ' +
        'with the request parameters. Parsed response:\n' +
        JSON.stringify(parsed, null, 2),
    );
  }

  return parsed.content;
}

/** CLI command module. */
export const MigrateModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'migrate',
  describe: 'Apply a prompt-based AI migration over a set of files',
};
