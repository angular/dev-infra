/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DocEntry,
  FunctionEntry,
  MemberEntry,
  MemberTags,
  ParameterEntry,
  PropertyEntry,
} from '../entities';
import {
  isClassEntry,
  isClassMethodEntry,
  isConstantEntry,
  isEnumEntry,
  isFunctionEntry,
  isGetterEntry,
  isInterfaceEntry,
  isSetterEntry,
  isTypeAliasEntry,
} from '../entities/categorization';
import hljs from 'highlight.js';
import {HasModuleName, HasRenderableToc} from '../entities/traits';
import {getLines} from '../helpers/code';
import {CodeLineRenderable} from '../entities/renderables';
import {isDeprecatedEntry} from '../helpers/js-doc-tags';
import {filterLifecycleMethods, mergeGettersAndSetters} from './member-transforms';

// Allows to generate links for code lines.
interface CodeTableOfContentsData {
  // The contents of code block.
  contents: string;
  // The keys are code line numbers and the values are ids.
  codeLineNumbersWithIdentifiers: Map<number, string>;
  deprecatedLineNumbers: number[];
}

const ANGULAR_PROPERTY_DECORATORS: Record<string, string> = {
  'input': '@Input()',
  'output': '@Output()',
  'optional': '',
};

/**
 * Based on provided docEntry:
 * 1. Build metadata
 * 2. Run syntax highlighting
 * 3. Generate list of renderable code lines.
 */
export function addRenderableCodeToc<T extends DocEntry & HasModuleName>(
  entry: T,
): T & HasRenderableToc {
  const metadata = mapDocEntryToCode(entry);
  appendPrefixAndSuffix(entry, metadata);

  const codeWithSyntaxHighlighting = hljs.highlight(metadata.contents, {language: 'typescript'});
  const lines = getLines(codeWithSyntaxHighlighting.value);
  const groups = groupCodeLines(lines, metadata);

  return {
    ...entry,
    codeLinesGroups: groups,
  };
}

/** Group overloaded methods */
function groupCodeLines(lines: string[], metadata: CodeTableOfContentsData) {
  return lines.reduce((groups, line, index) => {
    const tocItem = {
      contents: line,
      id: metadata.codeLineNumbersWithIdentifiers.get(index),
      isDeprecated: metadata.deprecatedLineNumbers.some((lineNumber) => lineNumber === index),
    };

    if (tocItem.id && groups.has(tocItem.id)) {
      const group = groups.get(tocItem.id);
      group?.push(tocItem);
    } else {
      groups.set(tocItem.id ?? index.toString(), [tocItem]);
    }

    return groups;
  }, new Map<string, CodeLineRenderable[]>());
}

export function mapDocEntryToCode(entry: DocEntry): CodeTableOfContentsData {
  if (isClassEntry(entry)) {
    const members = filterLifecycleMethods(mergeGettersAndSetters(entry.members));
    return getCodeTocData(members, true);
  }

  if (isConstantEntry(entry)) {
    const isDeprecated = isDeprecatedEntry(entry);
    return {
      contents: `const ${entry.name}: ${entry.type};`,
      codeLineNumbersWithIdentifiers: new Map(),
      deprecatedLineNumbers: isDeprecated ? [0] : [],
    };
  }

  if (isEnumEntry(entry)) {
    return getCodeTocData(entry.members, true);
  }

  if (isInterfaceEntry(entry)) {
    return getCodeTocData(mergeGettersAndSetters(entry.members), true);
  }

  if (isFunctionEntry(entry)) {
    const isDeprecated = isDeprecatedEntry(entry);

    return {
      contents: getMethodCodeLine(entry, [], true),
      codeLineNumbersWithIdentifiers: new Map(),
      deprecatedLineNumbers: isDeprecated ? [0] : [],
    };
  }

  if (isTypeAliasEntry(entry)) {
    const isDeprecated = isDeprecatedEntry(entry);
    const contents = `type ${entry.name} = ${entry.type}`;

    let deprecatedLineNumbers = [];

    if (isDeprecated) {
      const numberOfLinesOfCode = getNumberOfLinesOfCode(contents);

      for (let i = 0; i < numberOfLinesOfCode; i++) {
        deprecatedLineNumbers.push(i);
      }
    }

    return {
      contents,
      codeLineNumbersWithIdentifiers: new Map(),
      deprecatedLineNumbers,
    };
  }

  return {
    contents: '',
    codeLineNumbersWithIdentifiers: new Map(),
    deprecatedLineNumbers: [],
  };
}

/** Generate code ToC data for list of members. */
function getCodeTocData(members: MemberEntry[], hasPrefixLine: boolean): CodeTableOfContentsData {
  const initialMetadata: CodeTableOfContentsData = {
    contents: '',
    codeLineNumbersWithIdentifiers: new Map<number, string>(),
    deprecatedLineNumbers: [],
  };
  // In case when hasPrefixLine is true we should take it into account when we're generating `codeLineNumbersWithIdentifiers` below.
  const skip = !!hasPrefixLine ? 1 : 0;

  return members.reduce((acc: CodeTableOfContentsData, curr: MemberEntry, index: number) => {
    const lineNumber = index + skip;
    acc.codeLineNumbersWithIdentifiers.set(lineNumber, curr.name);
    acc.contents += `  ${getCodeLine(curr).trim()}\n`;
    if (isDeprecatedEntry(curr)) {
      acc.deprecatedLineNumbers.push(lineNumber);
    }
    return acc;
  }, initialMetadata);
}

function getCodeLine(member: MemberEntry) {
  if (isClassMethodEntry(member)) {
    return getMethodCodeLine(member, member.memberTags);
  } else if (isGetterEntry(member)) {
    return getGetterCodeLine(member);
  } else if (isSetterEntry(member)) {
    return getSetterCodeLine(member);
  }
  return getPropertyCodeLine(member as PropertyEntry);
}

/** Map getter, setter and property entry to text */
function getPropertyCodeLine(member: PropertyEntry): string {
  const isOptional = isOptionalMember(member);
  const tags = getTags(member);

  return `${tags.join(' ')} ${member.name}${markOptional(isOptional)}: ${member.type};`;
}

/** Map method entry to text */
function getMethodCodeLine(
  member: FunctionEntry,
  memberTags: MemberTags[] = [],
  displayParamsInNewLines: boolean = false,
): string {
  const mapParamEntry = (entry: ParameterEntry): string => {
    return `${entry.isRestParam ? '...' : ''}${entry.name}${markOptional(entry.isOptional)}: ${
      entry.type
    }`;
  };

  return `${memberTags.join(' ')} ${member.name}(${
    displayParamsInNewLines ? '\n  ' : ''
  }${member.params
    .map((param) => mapParamEntry(param))
    .join(`,${displayParamsInNewLines ? '\n  ' : ' '}`)}${displayParamsInNewLines ? '\n' : ''}): ${
    member.returnType
  };`.trim();
}

function getGetterCodeLine(member: PropertyEntry): string {
  const tags = getTags(member);

  return `${tags.join(' ')} get ${member.name}(): ${member.type};`;
}

function getSetterCodeLine(member: PropertyEntry): string {
  const tags = getTags(member);

  return `${tags.join(' ')} set ${member.name}(value: ${member.type});`;
}

function markOptional(isOptional: boolean): string {
  return isOptional ? '?' : '';
}

function isOptionalMember(member: PropertyEntry): boolean {
  return member.memberTags.some((tag) => tag === 'optional');
}

function getTags(member: PropertyEntry): string[] {
  return member.memberTags
    .map((tag) => ANGULAR_PROPERTY_DECORATORS[tag] ?? tag)
    .filter((tag) => !!tag);
}

function getNumberOfLinesOfCode(contents: string): number {
  return contents.split('\n').length;
}

function appendPrefixAndSuffix(entry: DocEntry, codeTocData: CodeTableOfContentsData): void {
  const appendFirstAndLastLines = (
    data: CodeTableOfContentsData,
    firstLine: string,
    lastLine: string,
  ) => {
    data.contents = `${firstLine}\n${data.contents}${lastLine}`;
  };

  if (isClassEntry(entry)) {
    const abstractPrefix = entry.isAbstract ? 'abstract ' : '';
    appendFirstAndLastLines(codeTocData, `${abstractPrefix}class ${entry.name} {`, `}`);
  }

  if (isEnumEntry(entry)) {
    appendFirstAndLastLines(codeTocData, `enum ${entry.name} {`, `}`);
  }

  if (isInterfaceEntry(entry)) {
    appendFirstAndLastLines(codeTocData, `interface ${entry.name} {`, `}`);
  }
}
