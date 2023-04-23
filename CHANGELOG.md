<a name="2023.4.23"></a>
# 2023.4.23 (2023-04-23)
### apps
| Commit | Type | Description |
| -- | -- | -- |
| [3f26e9e](https://github.com/angular/dev-infra/commit/3f26e9eca758ddbd54b744c03f25104c54b0811c) | feat | create the code of conduct managing functions ([#1109](https://github.com/angular/dev-infra/pull/1109)) |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [08f8d67](https://github.com/angular/dev-infra/commit/08f8d677da7b0811a00e2898596ef329e3450c88) | fix | gracefully attempt to delete PR branches |
| [1564c4e](https://github.com/angular/dev-infra/commit/1564c4e45db49460f2351cba356311e28062aa2f) | fix | properly delete obsolete branches ([#1104](https://github.com/angular/dev-infra/pull/1104)) |

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.4.16"></a>
# 2023.4.16 (2023-04-16)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [7dc7d13](https://github.com/angular/dev-infra/commit/7dc7d13db8c94ed79a0a8b59e7f8aa338a77ad99) | fix | update changelog generation templates ([#1089](https://github.com/angular/dev-infra/pull/1089)) |

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.4.9"></a>
# 2023.4.9 (2023-04-09)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [d28e5f7](https://github.com/angular/dev-infra/commit/d28e5f71d00e1d55abafea9eea315bcccd3bc17c) | fix | resolve generated temporary directory ([#1086](https://github.com/angular/dev-infra/pull/1086)) |
## Special Thanks
Alan Agius

<!-- CHANGELOG SPLIT MARKER -->
<a name="2023.4.2"></a>
# 2023.4.2 (2023-04-02)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [314a37b](https://github.com/angular/dev-infra/commit/314a37b96a11ff87f2aee3a2de7ab81d78c12e64) | feat | centralize lock-closed action ([#1079](https://github.com/angular/dev-infra/pull/1079)) |
| [8b7f6b9](https://github.com/angular/dev-infra/commit/8b7f6b94197d14448c7fcc0e1bd4aa74a66f99aa) | fix | no longer use promisify ([#1084](https://github.com/angular/dev-infra/pull/1084)) |
| [4d96664](https://github.com/angular/dev-infra/commit/4d96664b8fe4c1e8fbd51ffe89f402bd7e003dbf) | fix | update lock-closed inputs ([#1083](https://github.com/angular/dev-infra/pull/1083)) |
## Special Thanks
Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->
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
