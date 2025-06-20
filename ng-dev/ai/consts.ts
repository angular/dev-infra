/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Default model to use for AI-based scripts. */
export const DEFAULT_MODEL = 'gemini-2.5-flash';

/** Default temperature for AI-based scripts. */
export const DEFAULT_TEMPERATURE = 0.1;

/** Gets the API key and asserts that it is defined. */
export function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    console.error(
      [
        'No API key configured. A Gemini API key must be set as the `GEMINI_API_KEY` environment variable.',
        'For internal users, see go/aistudio-apikey',
      ].join('\n'),
    );
    process.exit(1);
  }

  return key;
}
