<a name="2023.2.12"></a>
# 2023.2.12 (2023-02-12)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [0e1bb89](https://github.com/angular/dev-infra/commit/0e1bb894046dd3b071d8fa6e18877f2bba180431) | fix | ignore all credential helpers when using the git client ([#1005](https://github.com/angular/dev-infra/pull/1005)) |
| [511c2b3](https://github.com/angular/dev-infra/commit/511c2b31c65d9a8d23c481e12c125086d87d51d8) | fix | properly use the fork of the user when updating yarn ([#1005](https://github.com/angular/dev-infra/pull/1005)) |
## Special Thanks
Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.2.5"></a>
# 2023.2.5 (2023-02-05)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [e8ed81e](https://github.com/angular/dev-infra/commit/e8ed81e6188999368c573e9c76d1eb0376488f44) | fix | branch manager incorrectly syncs all PRs |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.1.29"></a>
# 2023.1.29 (2023-01-29)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [30b176f](https://github.com/angular/dev-infra/commit/30b176fe4bf578afe354a647c209b0823d6a9cb2) | fix | do Github requests serially in branch manager |
## Special Thanks
Alan Agius

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.1.15"></a>
# 2023.1.15 (2023-01-15)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [3115c3d](https://github.com/angular/dev-infra/commit/3115c3d1eeeb4311fc67605838766c3bab7d6c5e) | feat | never build metafile by default in esbuild actions |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [ad1374e](https://github.com/angular/dev-infra/commit/ad1374e8222825244b36a91d0f085f8fc3c7126d) | fix | close superseded PRs when using create-pr-for-changes |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [9666ef2](https://github.com/angular/dev-infra/commit/9666ef229408b6bc23b5069bf00d1eb4e6e19b15) | feat | allow for additional custom stamping |
| [156cc26](https://github.com/angular/dev-infra/commit/156cc268d0e823a64267baa765c133d6a41761b0) | feat | delete the temporary exceptional minor NPM dist tag when turning stable |
| [668a07a](https://github.com/angular/dev-infra/commit/668a07a6f07d0a75f530728f77da8e3c78f0374a) | feat | expose `convertVersionBranchToSemVer` function |
| [9cf7591](https://github.com/angular/dev-infra/commit/9cf75915e1a040d4fbf651076df6823568b956ed) | feat | introduce combined command for dealing with NPM dist tags |
| [10e6f1b](https://github.com/angular/dev-infra/commit/10e6f1bf1532550063043cf0d8b519e269b61e3b) | fix | always emit project version info as stable stamping keys |
| [2aee1b5](https://github.com/angular/dev-infra/commit/2aee1b570eb5aef6d8c0b8d192ba88916a20e57d) | fix | filter alternate angular robot name from changelogs |
| [5c674f2](https://github.com/angular/dev-infra/commit/5c674f284f19ce71fc717437419fd5a058b7a234) | fix | remove loopback authentication schema ([#970](https://github.com/angular/dev-infra/pull/970)) |
## Special Thanks
Alan Agius, Charles Lyding, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.12.25"></a>
# 2022.12.25 (2022-12-25)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [d5693db](https://github.com/angular/dev-infra/commit/d5693db584b780f669f5685c13549396a05d3e98) | feat | release info should print exceptional minors |
| [12034dc](https://github.com/angular/dev-infra/commit/12034dcd44ff6d234299792df2220f62c5dd3bab) | feat | support exceptional minor release train in merge targeting |
| [50b9d66](https://github.com/angular/dev-infra/commit/50b9d664740bc71710a25d56d0f3ed86c0cf6da5) | feat | support exceptional minor release trains |
| [b7beaeb](https://github.com/angular/dev-infra/commit/b7beaeb3ad3f2bf6bf23a9d10638698b98d06435) | feat | support exceptional minors in release publish tool |
| [4058cc6](https://github.com/angular/dev-infra/commit/4058cc6be9bc55102a5fc3429b48b9fbf232bed6) | feat | wire up exceptional minor actions in publish tool |
| [c37e8ac](https://github.com/angular/dev-infra/commit/c37e8ac8e5007ff680fc0cd0fb7609652a0fcb72) | fix | configure next as major action never selectable |
| [5cffacd](https://github.com/angular/dev-infra/commit/5cffacd8e5d029d1df8fede70306f5e0e587960e) | fix | properly catch target label/branch errors |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.12.18"></a>
# 2022.12.18 (2022-12-18)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [d4d1329](https://github.com/angular/dev-infra/commit/d4d1329adbe1cdb5fd382d618e830c69e578c41b) | feat | allow for benchmark driver utilities to be linked |
| [d2840aa](https://github.com/angular/dev-infra/commit/d2840aa6cb7326d00a925fa2fff350bc210d0867) | feat | always consider transitive specs for spec-entrypoint |
| [246cebb](https://github.com/angular/dev-infra/commit/246cebbf2a78566ff1fe9b88fdde2459606568dc) | feat | avoid TS code relying on CommonJS-specific features |
| [30acfb3](https://github.com/angular/dev-infra/commit/30acfb31077ddc552b6be501516833ec234ce5c1) | feat | support detection of `_test` files for spec-bundling |
| [edfb9b5](https://github.com/angular/dev-infra/commit/edfb9b570b66e9196dc3b91b757dc2d3827274a8) | feat | support explicit files in spec-entrypoint |
| [07c1c19](https://github.com/angular/dev-infra/commit/07c1c1998ee39322c2bdd1b7c5524e1e72aeb8f1) | feat | support using es2020 in spec-bundled tests |
| [9a7aea3](https://github.com/angular/dev-infra/commit/9a7aea32300233a850eb3bb10874953a56cd2588) | fix | always downlevel async/await when bundling for production application |
| [7246a9c](https://github.com/angular/dev-infra/commit/7246a9c004fe00231816f71c6433df329d8e6c1f) | fix | app bundle rule does not declare other files as side-effect free |
| [c154da1](https://github.com/angular/dev-infra/commit/c154da1d34262b64173508b229302afa9a96cfaf) | fix | downlevel async generators along with async/await |
| [4d9ea67](https://github.com/angular/dev-infra/commit/4d9ea67a331c5333fc4b0ffbfa32479a8ec0a17b) | fix | http server should support loading jsonp files |
| [fc8badf](https://github.com/angular/dev-infra/commit/fc8badf89c5107486bb47c8c55b20747668db3d5) | fix | spec-bundle rule should never consider transitive files |
| [e03e8fe](https://github.com/angular/dev-infra/commit/e03e8fe3c4ec565e07774caa1913d8ce243ba6af) | fix | spec-bundling rule should keep original names |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [47f3420](https://github.com/angular/dev-infra/commit/47f34200c206f119acb14e2e00e478b7fe2d4725) | feat | merge all validation results instead of exiting on first non-passing validation ([#938](https://github.com/angular/dev-infra/pull/938)) |
| [51b292e](https://github.com/angular/dev-infra/commit/51b292edb052b047f57782fcd8f7dc8486394e09) | fix | make check title more succinct ([#941](https://github.com/angular/dev-infra/pull/941)) |
| [f1e8862](https://github.com/angular/dev-infra/commit/f1e8862e5034f046cc0bc66641d37f5b36d3e9b5) | fix | rename status check name to `Merge Ready Tracking` ([#941](https://github.com/angular/dev-infra/pull/941)) |
### shared-scripts
| Commit | Type | Description |
| -- | -- | -- |
| [bc7bf8b](https://github.com/angular/dev-infra/commit/bc7bf8bfc84492f04d18dc1cbf4b7547e51c3786) | feat | support only running linker on subset of files |
| [57b5fea](https://github.com/angular/dev-infra/commit/57b5fea0ace8cee1dff586d192383ddf00576b31) | fix | properly use `isSideEffectFree` function |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
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
