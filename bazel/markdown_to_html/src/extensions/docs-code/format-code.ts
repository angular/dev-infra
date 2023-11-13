import {Tokens} from 'marked';

/** Marked token for a custom docs element. */
export interface CodeToken extends Tokens.Generic {
  // code
  code: string;
  // Code language
  language: string | undefined;
}

/** Create an html element attribute string. */
export function buildAttr(name: string, value: boolean | number | string | undefined): string {
  return value ? ` ${name}="${value}` : '';
}
