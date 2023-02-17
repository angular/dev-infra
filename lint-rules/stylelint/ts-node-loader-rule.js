const path = require('path');
const stylelint = require('stylelint');

// Custom rule that registers all of the custom rules, written in TypeScript, with ts-node.
require('ts-node').register();

// Dummy rule so Stylelint doesn't complain that there aren't rules in the file.
module.exports = stylelint.createPlugin('@angular/rules-loader', () => {});
