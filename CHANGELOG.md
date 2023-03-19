<a name="2023.3.19"></a>
# 2023.3.19 (2023-03-19)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [8367e5d](https://github.com/angular/dev-infra/commit/8367e5d95e6f16c0671bc2401373adc9b448eb54) | fix | use two Github clients for post approval changes ([#1066](https://github.com/angular/dev-infra/pull/1066)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [24361c5](https://github.com/angular/dev-infra/commit/24361c53e2152d00868a3a7bf3af9387de9e47c3) | feat | **release:** properly mark releases as latest on GitHub |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.3.12"></a>
# 2023.3.12 (2023-03-12)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [203b517](https://github.com/angular/dev-infra/commit/203b51732903339c14a32304e7a7ae0a9d8bf2b5) | feat | use Googler organization to determine who is allowed to perform post approval changes ([#1015](https://github.com/angular/dev-infra/pull/1015)) |
| [18f41e8](https://github.com/angular/dev-infra/commit/18f41e8ad9af5a585b249845bcd302fb5ea25f12) | fix | determine post approval change check based on the actor rather than author ([#1015](https://github.com/angular/dev-infra/pull/1015)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [a9312d3](https://github.com/angular/dev-infra/commit/a9312d38d24c94636b7e135b58828c5732eb5212) | feat | support special action to cut lts minor release |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.2.26"></a>
# 2023.2.26 (2023-02-26)
## Breaking Changes
### lint-rules
- tslint rules are now imported from @angular/build-tooling/lint-rules/tslint
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [6636367](https://github.com/angular/dev-infra/commit/6636367d3b7e42d2a2b849a1c38a9a19a3fb832a) | fix | rbe initialization error in github actions |
### lint-rules
| Commit | Type | Description |
| -- | -- | -- |
| [1cc3056](https://github.com/angular/dev-infra/commit/1cc3056989f52d200bf527b850965c01de6dcb68) | feat | create style lint rules ([#1029](https://github.com/angular/dev-infra/pull/1029)) |
| [f877532](https://github.com/angular/dev-infra/commit/f87753221d5a6a3b1027725903b4650c7d78f275) | refactor | move tslint-rules into a lint-rules directory ([#1029](https://github.com/angular/dev-infra/pull/1029)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [1338115](https://github.com/angular/dev-infra/commit/133811578faa6cca589fadb2dd11a9b7218000a9) | fix | **pr:** add timeout to wait before commenting on pr merge ([#1038](https://github.com/angular/dev-infra/pull/1038)) |
| [d3026e7](https://github.com/angular/dev-infra/commit/d3026e7059e4803d482ec0a35847947feef8a293) | fix | **pr:** use atomic push when pushing to upstream merges ([#1038](https://github.com/angular/dev-infra/pull/1038)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.2.19"></a>
# 2023.2.19 (2023-02-19)
### circleci-orb
| Commit | Type | Description |
| -- | -- | -- |
| [82bf866](https://github.com/angular/dev-infra/commit/82bf866dd936abf5e6826a282d8da6e720dd1aa2) | fix | rotate GCP key ([#1031](https://github.com/angular/dev-infra/pull/1031)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
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
