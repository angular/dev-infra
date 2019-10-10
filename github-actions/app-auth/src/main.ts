import * as core from '@actions/core';
import { App } from '@octokit/app';

async function run(): Promise<void> {
  try {
    // The ID of the Github App
    const id = +core.getInput('app-id', { required: true });
    // The private key for the Github App
    const privateKey = core.getInput('private-key', { required: true });
    // The Github App
    const githubApp = new App({ id, privateKey });

    // The installation ID
    const installationId = +core.getInput('installation-id', { required: true });
    // A short lived github token for the Github App
    const token = await githubApp.getInstallationAccessToken({ installationId });

    // Set the output as the Github app installation token
    core.setOutput('installation_access_token', token);
  } catch (error) {
    // Log the error and set the action as failed
    core.debug(error);
    core.setFailed(error.message);
  }
}

run();
