import {JsDocTagEntry, MemberEntry} from '../entities';
import {JsDocTagRenderable, MemberEntryRenderable} from './renderables';

/** A doc entry that has jsdoc tags. */
export interface HasJsDocTags {
  jsdocTags: JsDocTagEntry[];
}

/** A doc entry that has jsdoc tags transformed for rendering. */
export interface HasRenderableJsDocTags {
  jsdocTags: JsDocTagRenderable[];
}

/** A doc entry that has a description. */
export interface HasDescription {
  description: string;
}

/** A doc entry that has a transformed html description. */
export interface HasHtmlDescription {
  htmlDescription: string;
}

/** A doc entry that has members transformed for rendering. */
export interface HasMembers {
  members: MemberEntry[];
}

/** A doc entry that has members transformed for rendering. */
export interface HasRenderableMembers {
  members: MemberEntryRenderable[];
}

/** A doc entry that has an associated JS module name. */
export interface HasModuleName {
  moduleName: string;
}
