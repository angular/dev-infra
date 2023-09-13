import {EntryType} from '../entities';

/** A map of EntityType to nunjucks template. */
export const DOC_ENTRY_TEMPLATES = new Map([
  [EntryType.UndecoratedClass, 'class.njk'],
  [EntryType.Directive, 'class.njk'],
  [EntryType.Component, 'class.njk'],
  [EntryType.Pipe, 'class.njk'],
  [EntryType.NgModule, 'class.njk'],
]);
