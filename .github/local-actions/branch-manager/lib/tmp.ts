import {chdir} from 'process';
import {spawnSync} from 'child_process';

/** The directory name for the temporary repo used for validation. */
const tempRepo = 'branch-mananger-repo';

export async function cloneRepoIntoTmpLocation(repo: {owner: string; repo: string}) {
  // Because we want to perform this check in the targetted repository, we first need to check out the repo
  // and then move to the directory it is cloned into.
  chdir('/tmp');
  console.log(
    spawnSync('git', [
      'clone',
      '--depth=1',
      `https://github.com/${repo.owner}/${repo.repo}.git`,
      `./${tempRepo}`,
    ]).output.toString(),
  );
  chdir(`/tmp/${tempRepo}`);
}
