import stylelint, {Rule} from 'stylelint';
import {basename} from 'path';

const {utils, createPlugin} = stylelint;

const ruleName = '@angular/no-import';
const messages = utils.ruleMessages(ruleName, {
  expected: () => '@import is not allowed. Use @use instead.',
});

/** Stylelint plugin that doesn't allow `@import` to be used. */
const ruleFn: Rule<boolean, string> = (isEnabled, options) => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    const excludePattern = options?.exclude ? new RegExp(options.exclude) : null;

    if (excludePattern?.test(basename(root.source!.input.file!))) {
      return;
    }

    root.walkAtRules((rule) => {
      if (rule.name === 'import') {
        utils.report({
          result,
          ruleName,
          message: messages.expected(),
          node: rule,
        });
      }
    });
  };
};

ruleFn.ruleName = ruleName;
ruleFn.messages = messages;

export default createPlugin(ruleName, ruleFn);
