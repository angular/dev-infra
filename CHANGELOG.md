<a name="2022.8.7"></a>
# 2022.8.7 (2022-08-07)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [8dcf210](https://github.com/angular/dev-infra/commit/8dcf210b8326224dfc8b018735625fdaf8a0d615) | feat | create serve script for credential-service ([#757](https://github.com/angular/dev-infra/pull/757)) |
| [8fa6149](https://github.com/angular/dev-infra/commit/8fa614960c2b5950438d4d33292ac16c23180d77) | fix | misc fixes from testing ([#752](https://github.com/angular/dev-infra/pull/752)) |
| [2c5f643](https://github.com/angular/dev-infra/commit/2c5f6431d687c8d4e23f86a3b759f55964f1471e) | fix | use base64 for parsing the github app key ([#757](https://github.com/angular/dev-infra/pull/757)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [afa79a5](https://github.com/angular/dev-infra/commit/afa79a5a73b3bf5e60c9a4263467bca11807fd25) | fix | use `x-access-token` as username for git url ([#756](https://github.com/angular/dev-infra/pull/756)) |
## Special Thanks
George Kalpakas, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.7.31"></a>
# 2022.7.31 (2022-07-31)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [1609543](https://github.com/angular/dev-infra/commit/1609543e7d76ccf66fbbab1bfa8ae4c2767adb80) | feat | create credential service server ([#729](https://github.com/angular/dev-infra/pull/729)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [934abb0](https://github.com/angular/dev-infra/commit/934abb0169fbd113021fe8bad1adef130bdd5724) | feat | **pr:** add dry-run flag to pr merge tooling ([#733](https://github.com/angular/dev-infra/pull/733)) |
| [64e801f](https://github.com/angular/dev-infra/commit/64e801fe2e99adfc960ab1fb8d3789f29e0dab0a) | feat | **pr:** check for branch conflicts before confirming merge in pr merge tooling ([#733](https://github.com/angular/dev-infra/pull/733)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.7.24"></a>
# 2022.7.24 (2022-07-24)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [fd36c99](https://github.com/angular/dev-infra/commit/fd36c9944d7c1d980ac8255988e6dabd2d4eb913) | feat | create ng-dev token functions ([#720](https://github.com/angular/dev-infra/pull/720)) |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [a9998af](https://github.com/angular/dev-infra/commit/a9998afda740abd187ad8cbdfa5843205ae88697) | fix | improve organization of logs for org-file-sync |
| [70e6a6d](https://github.com/angular/dev-infra/commit/70e6a6d23d49cbad1eddc4214b8f3e6f610227ba) | fix | serialize file updates to prevent contention |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [e264580](https://github.com/angular/dev-infra/commit/e264580b7807c64def3c5069bee4d4612e1d564f) | feat | automatically merge pull requests from within release tool |
| [114c5a9](https://github.com/angular/dev-infra/commit/114c5a9e0c063e65dc42ded4d2ae07a3cca5418a) | feat | create auth subcommand for ng-dev ([#720](https://github.com/angular/dev-infra/pull/720)) |
| [bdc8532](https://github.com/angular/dev-infra/commit/bdc8532d815f9056874f839751d7554bf64d6617) | fix | **release:** wait for next branch update action PR to be merged |
| [0f1cace](https://github.com/angular/dev-infra/commit/0f1cacea776de61d0ed7e187a11e1be9b0a1fe0a) | fix | force prompt should only ignore the failed validation ([#730](https://github.com/angular/dev-infra/pull/730)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.7.17"></a>
# 2022.7.17 (2022-07-17)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [0fb1e5b](https://github.com/angular/dev-infra/commit/0fb1e5b54ecfaf8d4e1bedb59e39392ef5a54f2b) | feat | always fake home-system directories in integration tests |
| [a3f061f](https://github.com/angular/dev-infra/commit/a3f061fdc7c836e1dfaf5a972531fa52bf189b5b) | feat | expose individual `.map` files for optimized bundles |
| [8a1e3fa](https://github.com/angular/dev-infra/commit/8a1e3fa0283e7e6932081037c0ed41dc84657414) | fix | consistently run integration tests in sandbox-like directories |
| [6b5886c](https://github.com/angular/dev-infra/commit/6b5886c9a64906173b89cf26ba093c7e9d8c7b73) | fix | do not put temporary test folders next to test files |
| [0268158](https://github.com/angular/dev-infra/commit/0268158ec3bcce2bba0b02d263965383b60b18a3) | fix | ensure terser knows about input sourcemap to trace-back |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [7b43ff7](https://github.com/angular/dev-infra/commit/7b43ff7dd1942c276f9f67b0c686390e24bfb508) | feat | skip angular-robot in postapproval action |
| [698f64c](https://github.com/angular/dev-infra/commit/698f64c135cb8f7bf098282d2817393c4a43868f) | fix | add missing `return` to actually skip owned robots in post-approval action |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [e795433](https://github.com/angular/dev-infra/commit/e795433f416d0ecd1d38afd27f8d72c94513e0cb) | fix | **release:** wait for final branch-off PR before finishing release action |
| [6c6c6b0](https://github.com/angular/dev-infra/commit/6c6c6b0ad1732f437c0d0fb4c195b4d05cc90f03) | fix | do not throw if there is no diff between `g3` and `main` |
## Special Thanks
Paul Gschwendtner and Suvanjan Mukherjee

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.7.7"></a>
# 2022.7.7 (2022-07-07)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [73d4292](https://github.com/angular/dev-infra/commit/73d42922727304bf3d7c606cdef627dc7c773164) | feat | move `app_bundle` rule outside of `benchmark` toolkit |
| [4627840](https://github.com/angular/dev-infra/commit/4627840d02f712732735fbd116a29b088e896e49) | feat | move js mapping size tracking tool to dev-infra |
### circleci-orb
| Commit | Type | Description |
| -- | -- | -- |
| [e258a71](https://github.com/angular/dev-infra/commit/e258a714881810c97f993dc90f4ea3bcf5f49fd6) | feat | create orb command for rebasing pull requests on the target branch |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [4abbb11](https://github.com/angular/dev-infra/commit/4abbb1173fa43b729c101f7dfcffa629f2aa7fe2) | feat | create org-file-sync action |
| [02950c9](https://github.com/angular/dev-infra/commit/02950c964f8c0cfc855685748c42b35c5aaa3ca5) | fix | actually log the repos and files being synced |
| [9db43e7](https://github.com/angular/dev-infra/commit/9db43e72dd8c2d92a919c2ae895f33a54e626aa4) | fix | add logging and set undefined for `repoSha` and `repoFileContent` |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [1fd5d8a](https://github.com/angular/dev-infra/commit/1fd5d8a97b8d3f0a70dc4db36ff755fb245bdfc3) | feat | **pr:** provide instructions for pushing back to the remote branch for pr checkout |
## Special Thanks
Joey Perrott, Paul Gschwendtner and angular-robot[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.6.28"></a>
# 2022.6.28 (2022-06-28)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [757d038](https://github.com/angular/dev-infra/commit/757d03864d104dbf2131181f14cd063426ee7da6) | feat | **spec-bundling:** generate ESM mjs bundle for node spec bundles |
| [b6213c5](https://github.com/angular/dev-infra/commit/b6213c5a2f89f353fd848a78afa0636e5dee793a) | feat | **spec-bundling:** support bundling ESM into CJS for legacy tests like protractor |
| [f2920bf](https://github.com/angular/dev-infra/commit/f2920bf750ab4305b17d255690fe92f68e23b7d4) | feat | **spec-bundling:** support for bootstrap scripts to be provided |
| [04a54cd](https://github.com/angular/dev-infra/commit/04a54cdfa050a7b6ed1dab8f0054f85022827ed5) | feat | **spec-bundling:** support specifying strategy for handling unknown linker declarations |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [2025d98](https://github.com/angular/dev-infra/commit/2025d98ffa9a83f05d0da3736ac77a5e0ea49366) | fix | rework token revoke mechanism to not rely on `post` run |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [feba54c](https://github.com/angular/dev-infra/commit/feba54c0435390911d4236683867fb5ea23cfcd1) | feat | always require `ts-node` to be available |
| [70b51cd](https://github.com/angular/dev-infra/commit/70b51cd7edf7128ba6c6f29911e28f0c7922f8cc) | feat | remove `ts-node` runtime registration as it does not work with ESM |
| [638993f](https://github.com/angular/dev-infra/commit/638993fc3d3b2a4da360a9cbeb71a3217a840d96) | feat | support ESM-written repository configurations |
| [3276c53](https://github.com/angular/dev-infra/commit/3276c531167dacaff492e06fe5354df552a65197) | feat | support exceptional minor target labeling in the interim |
| [94c9c10](https://github.com/angular/dev-infra/commit/94c9c102b4f23470c899a724cd3077a8b925c11a) | fix | **release:** always publish experimental packages for lts patch |
| [91c9200](https://github.com/angular/dev-infra/commit/91c9200c31977ecb179172cb67d288dc0ba390f3) | fix | avoid ts-node esm shebang that breaks on windows |
| [fcb33b0](https://github.com/angular/dev-infra/commit/fcb33b0c754217727aa031298bb02069e464963f) | fix | do not match dots automatically in pullapprove |
| [e0f37fc](https://github.com/angular/dev-infra/commit/e0f37fcf32c3a8472e60775523c8d76c898521e8) | fix | ensure config can be properly loaded on windows |
| [c713d4a](https://github.com/angular/dev-infra/commit/c713d4a7449b499c0ac31a9941095a7319b15441) | fix | exceptional minor changes should also land into next branch |
| [4505df9](https://github.com/angular/dev-infra/commit/4505df9ad7fefdf2154c7bf518abe144a42ff6d8) | fix | yarnpkg lockfile package cannot be bundled with ESM |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.6.12"></a>
# 2022.6.12 (2022-06-12)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [8b36a85](https://github.com/angular/dev-infra/commit/8b36a853df8faefd9e9a6b9530b3b7797e3bdee2) | feat | **browsers:** add support for excluding files from browser runfiles |
| [ec636aa](https://github.com/angular/dev-infra/commit/ec636aa679c65c37599dc30c316943ae4fb52ac3) | fix | **browsers:** exclude unnecessary chromium file containing spaces on windows |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [23ccc87](https://github.com/angular/dev-infra/commit/23ccc87f9af0ada07e855aa4517508a3ae286649) | fix | **pr:** yargs positional placeholder does not match positional name |
## Special Thanks
Derek Cormier and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.6.5"></a>
# 2022.6.5 (2022-06-05)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [4fdbd00](https://github.com/angular/dev-infra/commit/4fdbd0060583d4b1549b5ad41a46698d8f993052) | feat | **release:** support for custom release pre-checks to be provided |
| [6367f3d](https://github.com/angular/dev-infra/commit/6367f3d0c25936c3caf136782e07d6813b014637) | feat | move release output build and checks to staging phase |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.5.29"></a>
# 2022.5.29 (2022-05-29)
### circleci-orb
| Commit | Type | Description |
| -- | -- | -- |
| [acf5173](https://github.com/angular/dev-infra/commit/acf5173b3f6714421412a77e7258a4878debaa0d) | feat | initial setup for publishing dev-infra orb |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [f556a9a](https://github.com/angular/dev-infra/commit/f556a9a2e66b58abc4c77b073da60b97ed694418) | feat | create an action to rerequest reviews for post approval changes for non-googlers |
| [02239df](https://github.com/angular/dev-infra/commit/02239df030981e9374fa66ba15a4a6397a4f2969) | fix | properly spread the requested_teams values for pending reviews |
| [464d8a3](https://github.com/angular/dev-infra/commit/464d8a31a6b8c6f3ee801a664148b8c19066ec7f) | fix | remove trekladyone from googlers list |
| [c9f0e5d](https://github.com/angular/dev-infra/commit/c9f0e5d07ac564896d99a4ca23b038f3e77cd20e) | fix | use find instead of filter to allow a boolean check for non-approved reviews |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [d9ebdd2](https://github.com/angular/dev-infra/commit/d9ebdd25b15708c18acc99ac1bfb8101d765f703) | feat | **pr:** allow for manual override of targeted branches |
| [900c911](https://github.com/angular/dev-infra/commit/900c911345badbc6a673877ef6887848d171cc7e) | fix | **pr:** properly name the rebase command |
| [89bffa6](https://github.com/angular/dev-infra/commit/89bffa67983455338008c320ef8573bf3cd3f2c2) | fix | **pr:** rename the positional arguments for pull requests |
| [01bb903](https://github.com/angular/dev-infra/commit/01bb903d5186d054d73dd0676fa1292f80e92c9e) | fix | release notes not capturing multiple note keywords from single commit |
## Special Thanks
Joey Perrott, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.5.1"></a>
# 2022.5.1 (2022-05-01)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [93fef04](https://github.com/angular/dev-infra/commit/93fef044b38a3818d292be5bad0817ca6578f3e5) | fix | do not throw if multiple remotes point to angular remote |
| [f77a668](https://github.com/angular/dev-infra/commit/f77a6689d7dc27ec1e6e684a934cb1b47c83e887) | fix | make `new-main-branch` command more flexible to local setup |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.4.24"></a>
# 2022.4.24 (2022-04-24)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [5f7f2df](https://github.com/angular/dev-infra/commit/5f7f2df229f3b561538f941801c251a272a68024) | feat | allow for firebase functions to be deployed via bazel |
| [a5dd094](https://github.com/angular/dev-infra/commit/a5dd0943945e99d97a5b196af2bdd0d67efc57aa) | feat | create status column |
| [8a7e038](https://github.com/angular/dev-infra/commit/8a7e038d773fbae483d5366d7f27bd403f072665) | feat | create summary column ([#520](https://github.com/angular/dev-infra/pull/520)) |
| [6390a7e](https://github.com/angular/dev-infra/commit/6390a7ec8a1ad5bd07f011c9c22fcc2d1e76112e) | feat | create target column |
| [01394f7](https://github.com/angular/dev-infra/commit/01394f72bedb6991dac69c2565f03cc6254e3eec) | feat | handle label webhook events from github |
| [ba150d2](https://github.com/angular/dev-infra/commit/ba150d244300e9072ddc03c0bdf410c09f8fbaf8) | feat | handle status webhook events from github |
| [0469835](https://github.com/angular/dev-infra/commit/0469835fb01368a5d98b8cd70acdf48cca488f1f) | feat | make the github token from a user's claim available in the app |
| [ccf9d47](https://github.com/angular/dev-infra/commit/ccf9d47545b4eba72633447dc30b957e04509468) | feat | Update label model to include font color ([#520](https://github.com/angular/dev-infra/pull/520)) |
| [f6fd0c4](https://github.com/angular/dev-infra/commit/f6fd0c4b5c9b3ec49489980fb9fad9f9c95a5de7) | feat | use syncronous login functions to augment firebase authentication. |
| [c9d0bf5](https://github.com/angular/dev-infra/commit/c9d0bf5e5facaf816f0af90547728fb8752ef97e) | fix | avoid symlink that breaks github action cloning |
| [e3386cc](https://github.com/angular/dev-infra/commit/e3386cc6280347bbb77b2bbe8fd77115ae37010b) | fix | move the getConverter logic into the base class |
| [2a9fe46](https://github.com/angular/dev-infra/commit/2a9fe4677808f51a9d654198afc3c4c01dc2c0b5) | fix | Properly set the initial value state for isDecorated on models |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.4.17"></a>
# 2022.4.17 (2022-04-17)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [44e81e1](https://github.com/angular/dev-infra/commit/44e81e16f235c8bdc846c854128a60987bd2ee38) | feat | create the base of the pull request table |
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [03acd84](https://github.com/angular/dev-infra/commit/03acd844a311d66ed63a70edcccffc405570513b) | feat | improve error output on intgeration test failure |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.4.10"></a>
# 2022.4.10 (2022-04-10)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [3e10e5f](https://github.com/angular/dev-infra/commit/3e10e5f0510f114bea9b91be36723f230cd38986) | feat | create account menu component ([#502](https://github.com/angular/dev-infra/pull/502)) |
| [11e58e3](https://github.com/angular/dev-infra/commit/11e58e35a6dd1d15e709fe2dd5fa1b24cb34c437) | feat | create base of prs application |
| [28d1d81](https://github.com/angular/dev-infra/commit/28d1d815e56275482b92ec45d7d38626403c8e18) | feat | create githubWebhook function |
| [bf5983a](https://github.com/angular/dev-infra/commit/bf5983af2f77fc01ce06fb3c28c8a59aea772be7) | feat | create initial model set in shared models directory |
| [50857c6](https://github.com/angular/dev-infra/commit/50857c6aa6532660e84d2974272f6b0041e291b8) | feat | create login page ([#502](https://github.com/angular/dev-infra/pull/502)) |
| [82ecd90](https://github.com/angular/dev-infra/commit/82ecd903e2a1b79b79f4ec4c7d282c330138270e) | feat | establish firebase base for functions and local emulation |
## Special Thanks
Joey Perrott and Paul Gschwendtner
