/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file is temporarily copied from work-in-progress on
// angular/angular. This can be deleted once the DocEntry types
// can be imported from there.

/** Type of top-level documentation entry. */
export enum EntryType {
  Block = 'Block',
  Component = 'component',
  Constant = 'constant',
  Decorator = 'decorator',
  Directive = 'directive',
  Element = 'element',
  Enum = 'enum',
  Function = 'function',
  Interface = 'interface',
  Pipe = 'pipe',
  TypeAlias = 'type_alias',
  UndecoratedClass = 'undecorated_class',
}

/** Types of class members */
export enum MemberType {
  Property = 'property',
  Method = 'method',
  Getter = 'getter',
  Setter = 'setter',
}

/** Informational tags applicable to class members. */
export enum MemberTags {
  Static = 'static',
  Readonly = 'readonly',
  Protected = 'protected',
  Optional = 'optional',
  Input = 'input',
  Output = 'output',
}

export interface JsDocTagEntry {
  name: string;
  comment: string;
}

/** Base type for all documentation entities. */
export interface DocEntry {
  entryType: EntryType;
  name: string;
  description: string;
  rawComment: string;
  jsdocTags: JsDocTagEntry[];
}

/** Documentation entity for a constant. */
export interface ConstantEntry extends DocEntry {
  type: string;
}

/** Documentation entity for a TypeScript class. */
export interface ClassEntry extends DocEntry {
  members: MemberEntry[];
}

/** Documentation entity for an Angular directives and components. */
export interface DirectiveEntry extends ClassEntry {
  selector: string;
  exportAs: string[];
  isStandalone: boolean;
}

export interface FunctionEntry extends DocEntry {
  params: ParameterEntry[];
  returnType: string;
}

/** Sub-entry for a single class member. */
export interface MemberEntry {
  name: string;
  memberType: MemberType;
  memberTags: MemberTags[];
  description: string;
  jsdocTags: JsDocTagEntry[];
}

/** Sub-entry for a class property. */
export interface PropertyEntry extends MemberEntry {
  type: string;
  inputAlias?: string;
  outputAlias?: string;
}

/** Sub-entry for a class method. */
export type MethodEntry = MemberEntry & FunctionEntry;

/** Sub-entry for a single function parameter. */
export interface ParameterEntry {
  name: string;
  description: string;
  type: string;
  isOptional: boolean;
  isRestParam: boolean;
}
