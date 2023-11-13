import {Tokens} from 'marked';

/** Marked token for a custom docs element. */
export interface CodeToken extends Tokens.Generic {
  // code
  code: string;
  // Code language
  language: string | undefined;
}
