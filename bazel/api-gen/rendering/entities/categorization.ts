import {
  ClassEntry,
  ConstantEntry,
  DocEntry,
  EntryType,
  EnumEntry,
  FunctionEntry,
  InterfaceEntry,
  MemberEntry,
  MemberType,
  MethodEntry,
  PropertyEntry,
  TypeAliasEntry,
} from '../entities';
import {
  ClassEntryRenderable,
  ConstantEntryRenderable,
  DocEntryRenderable,
  EnumEntryRenderable,
  FunctionEntryRenderable,
  InterfaceEntryRenderable,
  MemberEntryRenderable,
  MethodEntryRenderable,
  TypeAliasEntryRenderable,
} from './renderables';
import {HasJsDocTags} from './traits';

/** Gets whether the given entry represents a class */
export function isClassEntry(entry: DocEntryRenderable): entry is ClassEntryRenderable;
export function isClassEntry(entry: DocEntry): entry is ClassEntry;
export function isClassEntry(entry: DocEntry): entry is ClassEntry {
  // TODO: add something like `statementType` to extraction so we don't have to check so many
  //     entry types here.
  return (
    entry.entryType === EntryType.UndecoratedClass ||
    entry.entryType === EntryType.Component ||
    entry.entryType === EntryType.Pipe ||
    entry.entryType === EntryType.NgModule ||
    entry.entryType === EntryType.Directive ||
    entry.entryType === EntryType.Decorator
  );
}

/** Gets whether the given entry represents a constant */
export function isConstantEntry(entry: DocEntryRenderable): entry is ConstantEntryRenderable;
export function isConstantEntry(entry: DocEntry): entry is ConstantEntry;
export function isConstantEntry(entry: DocEntry): entry is ConstantEntry {
  return entry.entryType === EntryType.Constant;
}

/** Gets whether the given entry represents a type alias */
export function isTypeAliasEntry(entry: DocEntryRenderable): entry is TypeAliasEntryRenderable;
export function isTypeAliasEntry(entry: DocEntry): entry is TypeAliasEntry;
export function isTypeAliasEntry(entry: DocEntry): entry is TypeAliasEntry {
  return entry.entryType === EntryType.TypeAlias;
}

/** Gets whether the given entry represents an enum */
export function isEnumEntry(entry: DocEntryRenderable): entry is EnumEntryRenderable;
export function isEnumEntry(entry: DocEntry): entry is EnumEntry;
export function isEnumEntry(entry: DocEntry): entry is EnumEntry {
  return entry.entryType === EntryType.Enum;
}

/** Gets whether the given entry represents an interface. */
export function isInterfaceEntry(entry: DocEntryRenderable): entry is InterfaceEntryRenderable;
export function isInterfaceEntry(entry: DocEntry): entry is InterfaceEntry;
export function isInterfaceEntry(entry: DocEntry): entry is InterfaceEntry {
  return entry.entryType === EntryType.Interface;
}

/** Gets whether the given member entry is a method entry. */
export function isClassMethodEntry(entry: MemberEntryRenderable): entry is MethodEntryRenderable;
export function isClassMethodEntry(entry: MemberEntry): entry is MethodEntry;
export function isClassMethodEntry(entry: MemberEntry): entry is MethodEntry {
  return entry.memberType === MemberType.Method;
}

/** Gets whether the given entry represents a function */
export function isFunctionEntry(entry: DocEntryRenderable): entry is FunctionEntryRenderable;
export function isFunctionEntry(entry: DocEntry): entry is FunctionEntry;
export function isFunctionEntry(entry: DocEntry): entry is FunctionEntry {
  return entry.entryType === EntryType.Function;
}

/** Gets whether the given entry represents a property */
export function isPropertyEntry(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === MemberType.Property;
}

/** Gets whether the given entry represents a getter */
export function isGetterEntry(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === MemberType.Getter;
}

/** Gets whether the given entry represents a setter */
export function isSetterEntry(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === MemberType.Setter;
}

/** Gets whether the given entry is deprecated. */
export function isDeprecatedEntry<T extends HasJsDocTags>(entry: T) {
  return entry.jsdocTags.some((tag) => tag.name === 'deprecated');
}

/** Gets whether the given entry is developer preview. */
export function isDeveloperPreview<T extends HasJsDocTags>(entry: T) {
  return entry.jsdocTags.some((tag) => tag.name === 'developerPreview');
}
