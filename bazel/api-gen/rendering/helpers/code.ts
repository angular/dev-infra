/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Split generated code with syntax highlighting into single lines */
export function getLines(text: string): string[] {
  if (text.length === 0) {
    return [];
  }
  return text.split(/\r\n|\r|\n/g);
}

export function mapJsDocExampleToHtmlExample(text: string): string {
  const codeExampleAtRule = /{@example (\S+) region=(['"])([^'"]+)\2\s*}/g;

  return text.replaceAll(codeExampleAtRule, (_, path, separator, region) => {
    return `<code-example path="${path}" region="${region}" />`;
  });
}
