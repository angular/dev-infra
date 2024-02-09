import {Token} from 'marked';
import {DocsCodeToken} from './extensions/docs-code/docs-code';

import {processMermaidCodeBlock} from './mermaid';

/** Type guard for if a provided token is the DocsCodeToken. */
function isDocsCodeToken(token: Token): token is DocsCodeToken {
  return !!(token as DocsCodeToken).language;
}

/**
 * Handle the provided token based on the token itself replacing its content/data in place
 * as appropriate.
 */
export async function handleToken(token: Token): Promise<void> {
  if (!isDocsCodeToken(token)) {
    return;
  }

  if (token.language === 'mermaid') {
    return await processMermaidCodeBlock(token);
  }
}
