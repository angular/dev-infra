<a name="2022.12.11"></a>
# 2022.12.11 (2022-12-11)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [3aaeb79](https://github.com/angular/dev-infra/commit/3aaeb793399fd74bdeea5c23940952fafdb938b0) | feat | expose `spec_entrypoint` rule as part of public API |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [ffa92df](https://github.com/angular/dev-infra/commit/ffa92dff110f1f96cea2614bdc5760ac954544f9) | feat | add label checks to unified status check ([#927](https://github.com/angular/dev-infra/pull/927)) |
| [75946ef](https://github.com/angular/dev-infra/commit/75946efdc475c60937e061ad8a252b424d5fa780) | feat | include note on comment being updated for previews |
| [51f34ba](https://github.com/angular/dev-infra/commit/51f34baeaffbc8b5df200e9e8cf5a4bde1cc9714) | feat | include repository name in preview channel name |
| [96fdaaa](https://github.com/angular/dev-infra/commit/96fdaaa056f1cfa7ffbc4c69b7e9007279f76c94) | fix | only create a single preview channel per PR |
| [2a121d4](https://github.com/angular/dev-infra/commit/2a121d4efab3616a43fc8b3261cb3f9afb07db33) | fix | update merge status when target label changes |
| [faf76ec](https://github.com/angular/dev-infra/commit/faf76ec6b24ea84584b48ff33abf1a50e1c2bfb3) | perf | compress preview artifacts before uploading |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [6d049bb](https://github.com/angular/dev-infra/commit/6d049bb52bd72e2f08b94f0a37a5603e660ac27b) | fix | **caretaker:** gracefully handle failing URLs during caretaker check ([#933](https://github.com/angular/dev-infra/pull/933)) |
| [b78ab75](https://github.com/angular/dev-infra/commit/b78ab750819c6667daed5534169a4e0ff2207a1f) | fix | **caretaker:** update to new saucelabs url ([#933](https://github.com/angular/dev-infra/pull/933)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.12.4"></a>
# 2022.12.4 (2022-12-04)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [856c3ab](https://github.com/angular/dev-infra/commit/856c3ab37a47984cb859f1dc73c729e9e072cd0e) | feat | create a unified status action ([#912](https://github.com/angular/dev-infra/pull/912)) |
| [a818bed](https://github.com/angular/dev-infra/commit/a818bed04b1cf671f9af4f61331b12250da39a49) | feat | introduce actions for safely deploying previews |
| [d30e424](https://github.com/angular/dev-infra/commit/d30e42411eee61f75e39cb39ffd5e1c7946a7ed5) | feat | move deploy directory to temporary directory to allow for editing |
| [49d2afa](https://github.com/angular/dev-infra/commit/49d2afadffb93beaf0753014ca0bbfa8b3a5c9b0) | fix | do not attempt to join path with |
| [eba7bac](https://github.com/angular/dev-infra/commit/eba7bac8f0c7afd20cf63d48de1942d06efd0972) | fix | do not nest deploy directory in final tmp dir |
| [f1a26a0](https://github.com/angular/dev-infra/commit/f1a26a04e1edb6d0f2cf239a4036fa67b062447c) | fix | fix missing close quote for actions yaml expression ([#916](https://github.com/angular/dev-infra/pull/916)) |
| [4172435](https://github.com/angular/dev-infra/commit/41724359ffa36fe35e9846f01ffe5c8465dbf4a6) | fix | only change temporary directory to ensure write access |
| [d98be19](https://github.com/angular/dev-infra/commit/d98be19c2fb18239eb86145a2bc2f63728da636c) | fix | remove unnecessary quote in action composite bash script |
| [f2bde1b](https://github.com/angular/dev-infra/commit/f2bde1bab32bd4496728d479d80d41874c7fcfad) | fix | use proper variable names when accessing deploy metadata |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.11.27"></a>
# 2022.11.27 (2022-11-27)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [fcdcc61](https://github.com/angular/dev-infra/commit/fcdcc612303a4564848a9935582ba75a6316afae) | feat | update to use the proper Github app for authentication ([#905](https://github.com/angular/dev-infra/pull/905)) |
## Special Thanks
Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.11.20"></a>
# 2022.11.20 (2022-11-20)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [d829965](https://github.com/angular/dev-infra/commit/d8299657f57570f77698684af4c7836af99b39b8) | feat | Add the `area: buid & ci` label automatically for PRs with `build` and `ci` type commits ([#904](https://github.com/angular/dev-infra/pull/904)) |
| [bea95d6](https://github.com/angular/dev-infra/commit/bea95d6e50847f8a0bd69d0aa228bc58ce2d653a) | feat | setup action for enabling bazel remote exec ([#898](https://github.com/angular/dev-infra/pull/898)) |
| [f60c5f4](https://github.com/angular/dev-infra/commit/f60c5f44a991b223685157e5add23b887fdcc42e) | fix | labels sync action not actually checking target repos ([#895](https://github.com/angular/dev-infra/pull/895)) |
| [df2f203](https://github.com/angular/dev-infra/commit/df2f203d6be69088c60e32b0acccc5b7e511de58) | fix | properly pass auth token to octokit ([#897](https://github.com/angular/dev-infra/pull/897)) |
| [a632a16](https://github.com/angular/dev-infra/commit/a632a1601469c0c0a2104cfa6bf1421d706ce80e) | fix | set remote exec script as executable and prevent regression |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [2f48b93](https://github.com/angular/dev-infra/commit/2f48b93e57be9eb898f4a5c7fc9f5fae1a5ecc7e) | feat | expose label definitions for org-wide labels ([#896](https://github.com/angular/dev-infra/pull/896)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.11.6"></a>
# 2022.11.6 (2022-11-06)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [e6c9fce](https://github.com/angular/dev-infra/commit/e6c9fceba1adedcfd68db1ad0feee6e086849fde) | feat | create an assistant to the branch manager ([#888](https://github.com/angular/dev-infra/pull/888)) |
## Special Thanks
Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.10.30"></a>
# 2022.10.30 (2022-10-30)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [cdea115](https://github.com/angular/dev-infra/commit/cdea11500841e703a84bfe141424898f9bd484b5) | feat | create a local branch manager github action ([#885](https://github.com/angular/dev-infra/pull/885)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [d87b1b5](https://github.com/angular/dev-infra/commit/d87b1b56a970132f90301624cea6b6d70b6d9489) | feat | **caretaker:** add status urls to caretaker check |
| [8a9577a](https://github.com/angular/dev-infra/commit/8a9577ac1b776828ab7bedeff80c2b7304234f9c) | feat | print pull request title when merging ([#877](https://github.com/angular/dev-infra/pull/877)) |
| [8d84592](https://github.com/angular/dev-infra/commit/8d845921644134ea69ed3f1c1e26ea31911852ed) | fix | properly catch github API errors and print clean output ([#877](https://github.com/angular/dev-infra/pull/877)) |
### shared-scripts
| Commit | Type | Description |
| -- | -- | -- |
| [e7b8ac6](https://github.com/angular/dev-infra/commit/e7b8ac68367700f09887e722ee13844cf9189aea) | fix | cut down on dependencies from `@angular-devkit/build-angular` |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.10.23"></a>
# 2022.10.23 (2022-10-23)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [f12f251](https://github.com/angular/dev-infra/commit/f12f251f684c8a9f7a11ed1b2a825a1f33527ef2) | fix | esbuild ESM bundles should prioritize ESM main field |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [02089f7](https://github.com/angular/dev-infra/commit/02089f73ff4779878577868ba32bb3a59bca4bab) | feat | create action to syncronize labels in angular repositories ([#841](https://github.com/angular/dev-infra/pull/841)) |
| [6da368a](https://github.com/angular/dev-infra/commit/6da368ad35912dc0985af3e246e955ade8598949) | feat | do not override g3 status if pointing to CL |
| [299eae4](https://github.com/angular/dev-infra/commit/299eae409b8c508b89b5bb595bd53d9ec6fb4ecb) | feat | google-internal-tests action should support g3-sync configuration file |
| [fadc4f4](https://github.com/angular/dev-infra/commit/fadc4f4b2efc4e832d4f390dec087c8ebc5e760b) | feat | introduce action to identify PRs affecting Google ([#848](https://github.com/angular/dev-infra/pull/848)) |
| [455d625](https://github.com/angular/dev-infra/commit/455d625537f4d6c8a01d070aa4b0bee59635f1bc) | feat | support exclusion of files in google-internal-tests action |
| [a64f351](https://github.com/angular/dev-infra/commit/a64f3515ea822a8b228ebaab1c52e76e557a580c) | feat | update the default labels used for feature request action |
| [c1dca16](https://github.com/angular/dev-infra/commit/c1dca166f21a2910191e291d11418270eae1ff0c) | fix | allow for other pull request event actions |
| [10a859b](https://github.com/angular/dev-infra/commit/10a859bcb02d834d95f4be5826461ca6c5afa3bf) | fix | fix imports to actions/core given CJS |
| [19e3093](https://github.com/angular/dev-infra/commit/19e3093ab74acad0d21aca43935f2dbd1f2c3c7e) | fix | improve error logging and fix ESM node resolution |
| [fac5f7c](https://github.com/angular/dev-infra/commit/fac5f7cd944a71f4680a1754164a5fd92e3b8866) | fix | only run google internal tests action for sync branch PRs |
| [453ff04](https://github.com/angular/dev-infra/commit/453ff04991d515ef0f37526194a1d64c14a97e2d) | fix | specify commit status context instead of using `default` ([#851](https://github.com/angular/dev-infra/pull/851)) |
| [798dbd9](https://github.com/angular/dev-infra/commit/798dbd9f8e53691cb3cf0daf0cb39c0eb9f141b6) | fix | use continue instead of return |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [3df1a9f](https://github.com/angular/dev-infra/commit/3df1a9f4bcc3953634b5418b3e1d3a9e280b5959) | feat | include all labels from the team's label schema ([#841](https://github.com/angular/dev-infra/pull/841)) |
| [03c8a7b](https://github.com/angular/dev-infra/commit/03c8a7b5bc743d1d6198b6a26789c6512fbc4037) | fix | update `caretaker check` to support canonical config for g3-sync |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.10.9"></a>
# 2022.10.9 (2022-10-09)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [b12cd73](https://github.com/angular/dev-infra/commit/b12cd73948225d0d3056d9610eee2c60286e6fdd) | fix | **browsers:** exclude chromium debug logs on remaining platforms |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [c9b2ff0](https://github.com/angular/dev-infra/commit/c9b2ff083a50d0eac742da1e69e0cbdb98bf53dd) | feat | support skipping CLA validation check forcibly |
## Special Thanks
Derek Cormier and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.10.2"></a>
# 2022.10.2 (2022-10-02)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [40aaf38](https://github.com/angular/dev-infra/commit/40aaf3831425d472965dd61e58cbd5854abd7214) | feat | add a rule to filter the first matching output |
## Special Thanks
Derek Cormier

<!-- CHANGELOG SPLIT MARKER -->
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
