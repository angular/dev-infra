import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, stat} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const actionDir = fileURLToPath(new URL('.', import.meta.url));
const actionPath = path.join(actionDir, 'configure-remote.js');

async function runAction({credential, trustedBuild = false} = {}) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'configure-remote-'));
  const env = {
    ...process.env,
    HOME: tempDir,
    INPUT_ALLOW_WINDOWS_RBE: 'false',
    INPUT_BAZELRC: '.bazelrc.user',
  };

  if (credential !== undefined) {
    env.INPUT_GOOGLE_CREDENTIAL = credential;
  }

  if (trustedBuild) {
    env.INPUT_TRUSTED_BUILD = 'true';
  }

  const result = spawnSync(process.execPath, [actionPath], {
    cwd: tempDir,
    env,
    encoding: 'utf8',
  });

  return {
    tempDir,
    result,
    bazelrcPath: path.join(tempDir, '.bazelrc.user'),
    credentialPath: path.join(tempDir, '.config/gcloud/application_default_credentials.json'),
  };
}

test('skips remote configuration when no credential is provided', async (t) => {
  const run = await runAction({trustedBuild: true});
  t.after(async () => {
    await rm(run.tempDir, {recursive: true, force: true});
  });

  assert.equal(run.result.status, 0, run.result.stderr || run.result.stdout);
  const bazelrc = await readFile(run.bazelrcPath, 'utf8');
  assert.ok(bazelrc.includes('test --flaky_test_attempts=3'));
  assert.ok(!bazelrc.includes('build --config=remote'));
  assert.ok(!bazelrc.includes('build --config=trusted-build'));
  await assert.rejects(stat(run.credentialPath));
  assert.match(
    run.result.stderr,
    /Skipping Bazel remote execution setup because google_credential was not provided\./,
  );
  assert.match(
    run.result.stderr,
    /Ignoring trusted_build because google_credential was not provided\./,
  );
});

test('writes credentials and remote configuration when a credential is provided', async (t) => {
  const credential = JSON.stringify({type: 'service_account', client_email: 'ci@example.com'});
  const run = await runAction({credential, trustedBuild: true});
  t.after(async () => {
    await rm(run.tempDir, {recursive: true, force: true});
  });

  assert.equal(run.result.status, 0, run.result.stderr || run.result.stdout);
  const bazelrc = await readFile(run.bazelrcPath, 'utf8');
  assert.ok(bazelrc.includes('build --config=remote'));
  assert.ok(bazelrc.includes('test --flaky_test_attempts=3'));
  assert.ok(bazelrc.includes('build --config=trusted-build'));
  assert.equal(await readFile(run.credentialPath, 'utf8'), credential);
  assert.equal(run.result.stderr, '');
});
