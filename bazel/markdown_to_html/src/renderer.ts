import {RendererObject} from 'marked';
import {linkRender} from './tranformations/link';
import {tableRender} from './tranformations/table';
import {listRender} from './tranformations/list';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export const renderer: RendererObject = {
  link: linkRender,
  table: tableRender,
  list: listRender,
};
