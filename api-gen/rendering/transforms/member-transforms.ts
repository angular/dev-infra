import {HasMembers, HasRenderableMembers} from '../entities/traits';
import {addHtmlDescription, addHtmlJsDocTagComments} from './jsdoc-transforms';

/** Given an entity with members, gets the entity augmented with renderable members. */
export function addRenderableMembers<T extends HasMembers>(entry: T): T & HasRenderableMembers {
  // TODO: combine any getters and setters with the same name into one entry
  // TODO: method parameters
  return {
    ...entry,
    members: entry.members.map((member) => addHtmlDescription(addHtmlJsDocTagComments(member))),
  };
}
