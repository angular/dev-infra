/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CliCommand, CliOption} from '../cli-entities';
import {
  ClassEntry,
  ConstantEntry,
  DocEntry,
  EnumEntry,
  FunctionEntry,
  JsDocTagEntry,
  MemberEntry,
  ParameterEntry,
  TypeAliasEntry,
} from '../entities';

/** JsDoc tag info augmented with transformed content for rendering. */
export interface JsDocTagRenderable extends JsDocTagEntry {
  htmlComment: string;
}

/** A documentation entry augmented with transformed content for rendering. */
export interface DocEntryRenderable extends DocEntry {
  moduleName: string;
  htmlDescription: string;
  shortHtmlDescription: string;
  jsdocTags: JsDocTagRenderable[];
  additionalLinks: LinkEntryRenderable[];
  htmlUsageNotes: string;
}

/** Documentation entity for a constant augmented transformed content for rendering. */
export type ConstantEntryRenderable = ConstantEntry &
  DocEntryRenderable & {
    codeLinesGroups: Map<string, CodeLineRenderable[]>;
  };

/** Documentation entity for a type alias augmented transformed content for rendering. */
export type TypeAliasEntryRenderable = TypeAliasEntry &
  DocEntryRenderable & {
    codeLinesGroups: Map<string, CodeLineRenderable[]>;
  };

/** Documentation entity for a TypeScript class augmented transformed content for rendering. */
export type ClassEntryRenderable = ClassEntry &
  DocEntryRenderable & {
    membersGroups: Map<string, MemberEntryRenderable[]>;
    codeLinesGroups: Map<string, CodeLineRenderable[]>;
  };

/** Documentation entity for a TypeScript enum augmented transformed content for rendering. */
export type EnumEntryRenderable = EnumEntry &
  DocEntryRenderable & {
    codeLinesGroups: Map<string, CodeLineRenderable[]>;
    members: MemberEntryRenderable[];
  };

/** Documentation entity for a TypeScript interface augmented transformed content for rendering. */
export type InterfaceEntryRenderable = ClassEntryRenderable;

export type FunctionEntryRenderable = FunctionEntry &
  DocEntryRenderable & {
    codeLinesGroups: Map<string, CodeLineRenderable[]>;
    params: ParameterEntryRenderable[];
    isDeprecated: boolean;
  };

/** Sub-entry for a single class or enum member augmented with transformed content for rendering. */
export interface MemberEntryRenderable extends MemberEntry {
  htmlDescription: string;
  jsdocTags: JsDocTagRenderable[];
  isDeprecated: boolean;
}

/** Sub-entry for a class method augmented transformed content for rendering. */
export type MethodEntryRenderable = MemberEntryRenderable &
  FunctionEntryRenderable & {
    params: ParameterEntryRenderable[];
  };

/** Sub-entry for a single function parameter augmented transformed content for rendering. */
export interface ParameterEntryRenderable extends ParameterEntry {
  htmlDescription: string;
}

export interface CodeLineRenderable {
  contents: string;
  isDeprecated: boolean;
  id?: string;
}

export interface LinkEntryRenderable {
  label: string;
  url: string;
}

export type CliOptionRenderable = CliOption & {
  isDeprecated: boolean;
};

export type CliCardItemRenderable = CliOptionRenderable;

export interface CliCardRenderable {
  type: 'Options' | 'Arguments';
  items: CliCardItemRenderable[];
}

/** A CLI command augmented with transformed content for rendering. */
export type CliCommandRenderable = CliCommand & {
  htmlDescription: string;
  cards: CliCardRenderable[];
  argumentsLabel: string;
  hasOptions: boolean;
  subcommands?: CliCommandRenderable[];
};
