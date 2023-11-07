import {marked} from 'marked';
import {renderer} from './renderer';
import {codeExampleExtension} from './transformations/code-example';

/** Globally configures marked for rendering JsDoc content to HTML. */
export function configureMarkedGlobally() {
  marked.use({
    mangle: false,
    headerIds: false,
    renderer,
    extensions: [
      // Custom Extensions are @type marked.TokenizerAndRendererExtension but the this.renderer uses a custom Token that extends marked.Tokens.Generic which is not exported by @types/marked
      // @ts-ignore @types/marked
      codeExampleExtension,
    ],
  });
}
