/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const headerIds = new Map<string, number>();

export const getHeaderId = (heading: string): string => {
  const numberOfHeaderOccurrencesInTheDocument = headerIds.get(heading) ?? 0;
  headerIds.set(heading, numberOfHeaderOccurrencesInTheDocument + 1);

  const extractedId = heading
    .toLowerCase()
    .replaceAll(/<code>(.*?)<\/code>/g, '$1') // remove <code>
    .replaceAll(/<strong>(.*?)<\/strong>/g, '$1') // remove <strong>
    .replaceAll(/<em>(.*?)<\/em>/g, '$1') // remove <em>
    .replace(/\s|\//g, '-') // remove spaces and slashes
    .replace(/gt;|lt;/g, '') // remove escaped < and >
    .replace(/&#\d+;/g, '') // remove HTML entities
    .replace(/[^\p{L}\d\-]/gu, ''); // only keep letters, digits & dashes

  const headerId = numberOfHeaderOccurrencesInTheDocument
    ? `${extractedId}-${numberOfHeaderOccurrencesInTheDocument}`
    : extractedId;

  return headerId;
};

export const resetHeaderIdsOfCurrentDocument = (): void => {
  headerIds.clear();
};
