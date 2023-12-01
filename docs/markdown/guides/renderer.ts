import {RendererObject} from 'marked';
import {linkRender} from './tranformations/link.js';
import {tableRender} from './tranformations/table.js';
import {listRender} from './tranformations/list.js';
import {imageRender} from './tranformations/image.js';
import {textRender} from './tranformations/text.js';
import {headingRender} from './tranformations/heading.js';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export const renderer: RendererObject = {
  link: linkRender,
  table: tableRender,
  list: listRender,
  image: imageRender,
  text: textRender,
  heading: headingRender,
};
