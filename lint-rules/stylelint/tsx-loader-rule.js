const path = require('path');
const stylelint = require('stylelint');

// Custom rule that registers all of the custom rules, written in TypeScript, with tsx.
require('tsx/cjs/api').register();

// Dummy rule so Stylelint doesn't complain that there aren't rules in the file.
module.exports = stylelint.createPlugin('@angular/stylelint-ts-rule-loader', () => {});
