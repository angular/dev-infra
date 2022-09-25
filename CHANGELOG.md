<a name="2022.9.25"></a>
# 2022.9.25 (2022-09-25)
### circleci-orb
| Commit | Type | Description |
| -- | -- | -- |
| [989b9f5](https://github.com/angular/dev-infra/commit/989b9f572138afc4d89d7489cc19a39919b056ef) | feat | command for setting up remote bazel execution ([#839](https://github.com/angular/dev-infra/pull/839)) |
| [6ca5640](https://github.com/angular/dev-infra/commit/6ca5640c3347698e3ed39ab7a99cd234e304bf62) | fix | do not cut off branch names with slashes |
| [5770ea7](https://github.com/angular/dev-infra/commit/5770ea71551fd1ee244fce1420ffab156a1699d0) | fix | improve packing of circleci inline commands |
| [3846e48](https://github.com/angular/dev-infra/commit/3846e4819f2369e863ee4e0f13b32231c9d4f6e6) | fix | incorrect messaging for head and base refs |
| [0f3a67f](https://github.com/angular/dev-infra/commit/0f3a67fec375bf3b5b9899e2650dad4c661d4088) | fix | properly pass through revision parameters |
| [87ac315](https://github.com/angular/dev-infra/commit/87ac3150d4bb01151ffb439bcaf640c4e2d39976) | fix | rebase script not working on windows |
| [16a0ad3](https://github.com/angular/dev-infra/commit/16a0ad3592bea9d6cab6297a85d98f87b8fae30c) | fix | support empty input parameters when e.g. running in cronjob |
| [86168ee](https://github.com/angular/dev-infra/commit/86168ee09dc6321045f2705b80a764fbd54a67c5) | fix | support non-existent bazelrc paths |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [953a36a](https://github.com/angular/dev-infra/commit/953a36a776ed09f7030afbf338c08f3f46e4a1a7) | feat | support `target: feature` in merge tooling ([#831](https://github.com/angular/dev-infra/pull/831)) |
| [5b747aa](https://github.com/angular/dev-infra/commit/5b747aa0f3198901823476ace4e0ffc4ba2dd61f) | fix | **release:** avoid accidentally incorporating unexpected changes in release build |
## Special Thanks
Greg Magolan, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.9.18"></a>
# 2022.9.18 (2022-09-18)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [4165870](https://github.com/angular/dev-infra/commit/4165870dc0579d1497a80f3138aa04e6455ce646) | feat | **remote-execution:** expose exec_properties constant to enable networking on remote |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [639ed26](https://github.com/angular/dev-infra/commit/639ed26765ceff0353822ff96b228816f69dc7b0) | feat | allow specifying a base branch in `create-pr-for-changes` |
| [5497ef9](https://github.com/angular/dev-infra/commit/5497ef98db930407f058f675fbc9454af2796d1b) | fix | use GitHub PAT instead of GitHub App key in `create-pr-for-changes` |
## Special Thanks
Derek Cormier, George Kalpakas and angular-robot[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.8.28"></a>
# 2022.8.28 (2022-08-28)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [c5cbcd3](https://github.com/angular/dev-infra/commit/c5cbcd31cf2dc3680d247db84fbb76f52cf2934d) | fix | ensure credential service login only works with `@google.com` mail ([#789](https://github.com/angular/dev-infra/pull/789)) |
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [7af5d34](https://github.com/angular/dev-infra/commit/7af5d349d13b39e2f7fe87716f8eb9e870072468) | fix | **browsers:** exclude a log file that chromium writes to on linux ([#795](https://github.com/angular/dev-infra/pull/795)) |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [2078bb2](https://github.com/angular/dev-infra/commit/2078bb254583653e99b932c33b43404d5613d358) | feat | implement GitHub Action for creating a PR from local changes |
| [4b84feb](https://github.com/angular/dev-infra/commit/4b84feb3bfdcbb88dd0199dd3593658da61da404) | fix | update generated `main.js` for `create-pr-for-changes` GitHub Action |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [88c198a](https://github.com/angular/dev-infra/commit/88c198ae1a3462223cb5c1e83338e4b94b435283) | feat | add logging and messaging to ng-dev auth login ([#798](https://github.com/angular/dev-infra/pull/798)) |
| [806c568](https://github.com/angular/dev-infra/commit/806c568a439877f69b975aedbf5e4eb26fd7eaaf) | fix | order results of forks when searching for user owned forks ([#796](https://github.com/angular/dev-infra/pull/796)) |
## Special Thanks
Derek Cormier, George Kalpakas, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.8.21"></a>
# 2022.8.21 (2022-08-21)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [286b46a](https://github.com/angular/dev-infra/commit/286b46a5a3e4f6a5c3bd0b0af9802e101d2ca654) | feat | automatically add `comp: docs` label for pulls that contain docs changes ([#778](https://github.com/angular/dev-infra/pull/778)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [682adb7](https://github.com/angular/dev-infra/commit/682adb7d0089f7cfaf568a482f40e460b6705b31) | feat | **ts-circular-dependencies:** support ignoring type only imports/exports for circular dependency checks ([#772](https://github.com/angular/dev-infra/pull/772)) |
| [f502be3](https://github.com/angular/dev-infra/commit/f502be36cab7e314e9c85ff04d7a63862fbda75c) | feat | automatically remove credentials generated by ng-dev auth service after use ([#776](https://github.com/angular/dev-infra/pull/776)) |
| [613e401](https://github.com/angular/dev-infra/commit/613e401ebf59e12f1b0378e19c8ec7391c3aac49) | feat | validate all licenses as being allowed for our Angular projects ([#644](https://github.com/angular/dev-infra/pull/644)) |
| [5d0da98](https://github.com/angular/dev-infra/commit/5d0da987d6fd7637ee65542d99138a8bda1d2542) | fix | always include the github token option on merge. ([#771](https://github.com/angular/dev-infra/pull/771)) |
| [ba8f786](https://github.com/angular/dev-infra/commit/ba8f786d2770cb476882b4c6fea54cca2b3c62c4) | fix | assorted typing fixes that typescript wants ([#774](https://github.com/angular/dev-infra/pull/774)) |
| [8d1d6c5](https://github.com/angular/dev-infra/commit/8d1d6c50da320b2e5d600033ac54913fcbecc951) | fix | properly handle github token escapes with ng-dev service auth ([#774](https://github.com/angular/dev-infra/pull/774)) |
| [9323859](https://github.com/angular/dev-infra/commit/9323859dd14fab851865ca6725d60f207c3545a7) | fix | use token to determine if the AuthenticatedGitClient has been configured ([#773](https://github.com/angular/dev-infra/pull/773)) |
## Special Thanks
George Kalpakas, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.8.14"></a>
# 2022.8.14 (2022-08-14)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [55daf7d](https://github.com/angular/dev-infra/commit/55daf7df431dd8a4c38628df746e9d7658e58a1f) | feat | create system for registering functions to be called on command completion ([#765](https://github.com/angular/dev-infra/pull/765)) |
| [8842b87](https://github.com/angular/dev-infra/commit/8842b874929d1285c752ab6d5e78835878cb4793) | feat | enable the use of ng-dev credential service for pr merging ([#758](https://github.com/angular/dev-infra/pull/758)) |
| [3b57ad6](https://github.com/angular/dev-infra/commit/3b57ad6c59cf7dad7a9ae950ba486865469af4b6) | feat | set usage of ng-dev service via repository configuration ([#764](https://github.com/angular/dev-infra/pull/764)) |
| [c2cdc26](https://github.com/angular/dev-infra/commit/c2cdc26b7db0eba2647ece8718b883a6dd0590bb) | fix | properly catch errors for finding the ng-dev token in the filesystem ([#767](https://github.com/angular/dev-infra/pull/767)) |
| [1c22264](https://github.com/angular/dev-infra/commit/1c22264e2b24f792a02ca397fa587bff03111a13) | fix | properly encode URLs for GitHub queries in caretaker check ([#766](https://github.com/angular/dev-infra/pull/766)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
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
