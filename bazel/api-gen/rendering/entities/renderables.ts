import {
  ClassEntry,
  ConstantEntry,
  DirectiveEntry,
  DocEntry,
  EnumEntry,
  EnumMemberEntry,
  FunctionEntry,
  JsDocTagEntry,
  MemberEntry,
  ParameterEntry,
  PipeEntry,
} from '@angular/compiler-cli';

/** JsDoc tag info augmented with transformed content for rendering. */
export interface JsDocTagRenderable extends JsDocTagEntry {
  htmlComment: string;
}

/** A documentation entry augmented with transformed content for rendering. */
export interface DocEntryRenderable extends DocEntry {
  moduleName: string;
  htmlDescription: string;
  jsdocTags: JsDocTagRenderable[];
}

/** Documentation entity for a constant augmented transformed content for rendering. */
export type ConstantEntryRenderable = ConstantEntry & DocEntryRenderable;

/** Documentation entity for a TypeScript class augmented transformed content for rendering. */
export type ClassEntryRenderable = ClassEntry &
  DocEntryRenderable & {
    members: MemberEntryRenderable[];
  };

/** Documentation entity for a TypeScript enum augmented transformed content for rendering. */
export type EnumEntryRenderable = EnumEntry &
  DocEntryRenderable & {
    members: EnumMemberEntryRenderable[];
  };

/**
 * Documentation entity for an Angular directives and components augmented transformed
 * content for rendering.
 */
export type DirectiveEntryRenderable = DirectiveEntry & DocEntryRenderable;

/** Documentation entity for a pipe augmented transformed content for rendering. */
export type PipeEntryRenderable = PipeEntry & DocEntryRenderable;

export type FunctionEntryRenderable = FunctionEntry &
  DocEntryRenderable & {
    params: ParameterEntryRenderable[];
  };

/** Sub-entry for a single class or enum member augmented with transformed content for rendering. */
export interface MemberEntryRenderable extends MemberEntry {
  htmlDescription: string;
  jsdocTags: JsDocTagRenderable[];
}

/** Sub-entry for an enum member augmented transformed content for rendering. */
export type EnumMemberEntryRenderable = EnumMemberEntry & MemberEntryRenderable;

/** Sub-entry for a class property augmented transformed content for rendering. */
export type PropertyEntryRenderable = MemberEntryRenderable;

/** Sub-entry for a class method augmented transformed content for rendering. */
export type MethodEntryRenderable = MemberEntryRenderable &
  FunctionEntryRenderable & {
    params: ParameterEntryRenderable[];
  };

/** Sub-entry for a single function parameter augmented transformed content for rendering. */
export interface ParameterEntryRenderable extends ParameterEntry {
  htmlDescription: string;
}
