import * as core from '@actions/core';
import {utils, ANGULAR_ROBOT} from '../../../utils.js';
import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {getConfig, assertValidGithubConfig} from '../../../../ng-dev/utils/config.js';
import {assertValidReleaseConfig} from '../../../../ng-dev/release/config/index.js';
import {PublishCiTool} from './publish-ci.js';

export async function run(): Promise<void> {
  let token: string | null = null;
  try {
    token = await utils.getAuthTokenFor(ANGULAR_ROBOT);

    const wombotToken = core.getInput('wombot-token', {required: true});
    process.env['WOMBOT_TOKEN'] = wombotToken;

    core.info('Configuring AuthenticatedGitClient with generated token...');
    AuthenticatedGitClient.configure(token, 'bot');

    core.info('Loading repository configuration...');
    const config = await getConfig();
    assertValidReleaseConfig(config);
    assertValidGithubConfig(config);

    core.info('Initializing Git client...');
    const git = await AuthenticatedGitClient.get();

    core.info('Starting PublishCiTool...');
    const tool = new PublishCiTool(config, git, git.baseDir, {
      builtPackagesDir: core.getInput('built-packages-dir', {required: true}),
      expectedSha: core.getInput('expected-sha', {required: true}),
      dryRun: core.getBooleanInput('dry-run', {required: false}),
    });

    await tool.run();
    core.info('Release Publish CI completed successfully.');
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e.message);
      if (e.stack) {
        core.debug(e.stack);
      }
    } else {
      core.setFailed(`Unknown error: ${e}`);
    }
  } finally {
    if (token !== null) {
      try {
        await utils.revokeActiveInstallationToken(token);
      } catch (err) {
        core.warning(`Failed to revoke active installation token: ${err}`);
      }
    }
  }
}

if (process.env['JASMINE_RUNNER'] === undefined && !process.env['TEST_TARGET']) {
  await run();
}
