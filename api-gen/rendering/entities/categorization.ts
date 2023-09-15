import {
  ClassEntry,
  DocEntry,
  EntryType,
  FunctionEntry,
  MemberEntry,
  MemberType,
  MethodEntry,
} from '../entities';
import {MemberEntryRenderable, MethodEntryRenderable} from './renderables';

/** Gets whether the given entry represents a class */
export function isClassEntry(entry: DocEntry): entry is ClassEntry {
  // TODO: add something like `statementType` to extraction so we don't have to check so many
  //     entry types here.
  return (
    entry.entryType === EntryType.UndecoratedClass ||
    entry.entryType === EntryType.Component ||
    entry.entryType === EntryType.Decorator ||
    entry.entryType === EntryType.Pipe ||
    entry.entryType === EntryType.NgModule
  );
}

/** Gets whether the given member entry is a method entry. */
export function isClassMethodEntry(entry: MemberEntryRenderable): entry is MethodEntryRenderable;
export function isClassMethodEntry(entry: MemberEntry): entry is MethodEntry {
  return entry.memberType === MemberType.Method;
}

/** Gets whether the given entry represents a function */
export function isFunctionEntry(entry: DocEntry): entry is FunctionEntry {
  return entry.entryType === EntryType.Function;
}
