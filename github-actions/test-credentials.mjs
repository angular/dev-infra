import fs from 'fs';
import path from 'path';

const actionDirs = [
  'github-actions/bazel/configure-remote',
  'github-actions/browserstack',
  'github-actions/saucelabs',
];

const root = process.cwd();

let pass = true;

for (const dir of actionDirs) {
  const full = path.join(root, dir);
  const files = fs.readdirSync(full);

  for (const bad of ['gcp_token.data', 'browserstack_token.data', 'saucelabs_token.data', 'encrypt.ts']) {
    if (files.includes(bad)) {
      console.error(`FAIL: ${path.join(dir, bad)} should not exist`);
      pass = false;
    }
  }

  const constants = path.join(full, 'constants.ts');
  if (fs.existsSync(constants)) {
    const text = fs.readFileSync(constants, 'utf8');
    if (text.includes('export const k') || text.includes('export const iv') || text.includes('export const alg')) {
      console.error(`FAIL: ${path.join(dir, 'constants.ts')} still exports crypto constants`);
      pass = false;
    }
  }

  const jsFile = dir === 'github-actions/bazel/configure-remote'
    ? 'configure-remote.js'
    : dir === 'github-actions/browserstack'
      ? 'set-browserstack-env.js'
      : 'set-saucelabs-env.js';
  const jsPath = path.join(full, jsFile);
  const jsText = fs.readFileSync(jsPath, 'utf8');
  if (!jsText.includes('process.env')) {
    console.error(`FAIL: ${path.join(dir, jsFile)} does not read from process.env`);
    pass = false;
  }
}

if (pass) {
  console.log('All credential checks passed.');
  process.exit(0);
} else {
  process.exit(1);
}
