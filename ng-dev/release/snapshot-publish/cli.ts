import {Argv, CommandModule} from 'yargs';
import {addGithubTokenOption} from '../../utils/git/github-yargs';
import {SnapshotPublisher} from './snapshots';

/** Command line options for publishing snapshot releases. */
export interface SnapshotPublishOptions {
  /** Whether to skip publishing snapshots for packages that are not affected by the current changes. */
  skipNonAffectedSnapshots: boolean;
  /** Whether to perform a dry run. */
  dryRun: boolean;
}

/** Yargs command builder for configuring the `ng-dev release publish-snapshots` command. */
function builder(argv: Argv): Argv<SnapshotPublishOptions> {
  return addGithubTokenOption(argv)
    .option('skip-non-affected-snapshots' as 'skipNonAffectedSnapshots', {
      type: 'boolean',
      description:
        'Whether to skip publishing snapshots for packages that are not affected by the current changes.',
      default: false,
    })
    .option('dry-run' as 'dryRun', {
      type: 'boolean',
      description: 'Whether to perform a dry run.',
      default: false,
    });
}

/** CLI command module for publishing snapshot releases. */
export const ReleasePublishSnapshotsCommandModule: CommandModule<{}, SnapshotPublishOptions> = {
  builder,
  handler: SnapshotPublisher.run,
  command: 'publish-snapshots',
  // Hidden from help as this is for use by the release tooling itself.
  describe: false,
};
