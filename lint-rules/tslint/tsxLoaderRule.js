const path = require('path');
const Lint = require('tslint');

// Custom rule that registers all of the custom rules, written in TypeScript, with tsx.
// This is necessary, because `tslint` and IDEs won't execute any rules that aren't in a .js file.
require('tsx/cjs/api').register();

// Add a noop rule so tslint doesn't complain.
exports.Rule = class Rule extends Lint.Rules.AbstractRule {
  apply() {}
};
