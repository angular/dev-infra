<a name="2021.11.7"></a>
# 2021.11.7 (2021-11-07)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [7605373](https://github.com/angular/dev-infra/commit/7605373472c9eb4aa0c35f6df2f02bb12db94e3c) | feat | allow integration commands to resolve executables through expansion ([#285](https://github.com/angular/dev-infra/pull/285)) |
| [8c73f43](https://github.com/angular/dev-infra/commit/8c73f43c4e28b537326e5a1f2e459c5a4400ace0) | feat | create toolchain alias rule for browser metadata targets |
| [818ad64](https://github.com/angular/dev-infra/commit/818ad64b42714af36b077598c5a1e15e297f8502) | feat | expose toolchain aliases for exposed browsers |
| [21956b6](https://github.com/angular/dev-infra/commit/21956b6315608a2d925158bc0a23e3e175e01572) | feat | support bazel make variable expansion in integration test rule |
| [baa69aa](https://github.com/angular/dev-infra/commit/baa69aac18a2cd9aeeaf17a4d3ca84acbd3f8e6c) | fix | failure messages accidentally printing `[Object object]` for commands |
| [4c02c1b](https://github.com/angular/dev-infra/commit/4c02c1bc17fed4f127442512c16a5b6b19c24a18) | fix | integration test env variable expansion not respecting custom variables |
| [4dc6a89](https://github.com/angular/dev-infra/commit/4dc6a89e96473c17719504f510aedf6b3c22624a) | fix | integration test rule not collecting transitive runfiles of `data` |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [1ac7a5f](https://github.com/angular/dev-infra/commit/1ac7a5fecedab23a7848104a063c614d1d44c228) | fix | **release:** fix description for TagRecentMajorAsLatest action ([#282](https://github.com/angular/dev-infra/pull/282)) |
### tslint-rules
| Commit | Type | Description |
| -- | -- | -- |
| [e34f1a6](https://github.com/angular/dev-infra/commit/e34f1a67293aa44f815ac97da1ce1f650de94475) | feat | move validate-import-for-esm-cjs-interop from framework |
## Special Thanks
Joey Perrott, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.10.31"></a>
# 2021.10.31 (2021-10-31)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [471437d](https://github.com/angular/dev-infra/commit/471437d21eb1d94615fb4e48b3f8d6175277467c) | feat | **format:** support mjs and cjs files with prettier and clang-format ([#274](https://github.com/angular/dev-infra/pull/274)) |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.10.24"></a>
# 2021.10.24 (2021-10-24)
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [6fb5d71](https://github.com/angular/dev-infra/commit/6fb5d7162863b67cd1e006b2262db7da78608c88) | feat | ensure pull requests with deprecation commits have a deprecation label ([#269](https://github.com/angular/dev-infra/pull/269)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [7b66fb5](https://github.com/angular/dev-infra/commit/7b66fb5dc44b92fb4ecbd6a7d52b67a3e15339eb) | fix | **release:** ensure installed node modules do not break within Bazel ([#271](https://github.com/angular/dev-infra/pull/271)) |
## Special Thanks
Alan Agius, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.10.17"></a>
# 2021.10.17 (2021-10-17)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [3cc5232](https://github.com/angular/dev-infra/commit/3cc523269f0219a7beeb895af3a9c5066249f9a6) | feat | add support for custom environment variables in integration tests ([#270](https://github.com/angular/dev-infra/pull/270)) |
| [053cd9a](https://github.com/angular/dev-infra/commit/053cd9a761f891ee60393a68e9b805a07d470637) | feat | introduce rule for running integration tests with Bazel |
| [4c652ca](https://github.com/angular/dev-infra/commit/4c652caff46440bf44b5a0822ee62e66dd83c3b5) | feat | provide remote-execution platform with network access. |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [8cec60f](https://github.com/angular/dev-infra/commit/8cec60fa9e14cef6f29fcac429c8246f0bd93531) | feat | remove prerelease changelog entries when cutting a stable release ([#260](https://github.com/angular/dev-infra/pull/260)) |
| [387b9d2](https://github.com/angular/dev-infra/commit/387b9d22e6ea5f67257a85431b59ddd460468331) | feat | support removing all prerelease changelog entries ([#260](https://github.com/angular/dev-infra/pull/260)) |
| [f31797a](https://github.com/angular/dev-infra/commit/f31797a431ece334d127090ddc7921f07b8ee734) | fix | **release:** run yarn integrity and verify-trees checks before performing a release ([#264](https://github.com/angular/dev-infra/pull/264)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.10.10"></a>
# 2021.10.10 (2021-10-10)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [87ee867](https://github.com/angular/dev-infra/commit/87ee86733980a2ef64b60100a32c892161fd8239) | fix | add `DEPRECATION` to invalid commit message ([#250](https://github.com/angular/dev-infra/pull/250)) |
| [cce6d07](https://github.com/angular/dev-infra/commit/cce6d07bb4a1c0c3ff19aea614253164f05ec564) | fix | allow deprecations in PRs during feature freeze ([#256](https://github.com/angular/dev-infra/pull/256)) |
## Special Thanks
Alan Agius and Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.10.3"></a>
# 2021.10.3 (2021-10-03)
## Breaking Changes
### ng-dev
- `claSignedLabel` is not longer used as an attribute on the `PullRequestConfig`
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [2556d72](https://github.com/angular/dev-infra/commit/2556d72d0f4b695309e5fa23e1c39f4c22909526) | fix | **pr:** check CLA status rather than label for CLA passing status on pr merges ([#242](https://github.com/angular/dev-infra/pull/242)) |
| [2c6f847](https://github.com/angular/dev-infra/commit/2c6f84778dae1c285513f97838431c1718e4c3bb) | fix | **pr:** correctly retrieve both github checks and statuses and normalize them together ([#242](https://github.com/angular/dev-infra/pull/242)) |
| [e638278](https://github.com/angular/dev-infra/commit/e638278dafb51a09bb06929dbfa44b3ac26e4030) | fix | **release:** prepare-commit-message hook accidentally running when bump commit is created ([#247](https://github.com/angular/dev-infra/pull/247)) |
| [eca29df](https://github.com/angular/dev-infra/commit/eca29dfefbe243eaedcce233cda5f53e57c6e1d4) | fix | only include LTS label as a target label if the release configuration is defined ([#245](https://github.com/angular/dev-infra/pull/245)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.9.26"></a>
# 2021.9.26 (2021-09-26)
## Breaking Changes
### ng-dev
- `MergeConfig` has been renamed to `PullRequestConfig` and is now accessed via `pullRequest` on the provided
ng-dev config.
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [0a83a42](https://github.com/angular/dev-infra/commit/0a83a42160652246e37253287a261f45a7e11313) | feat | **protos:** automatically generate typescript implementation of bazel test_status proto ([#239](https://github.com/angular/dev-infra/pull/239)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [cf92a66](https://github.com/angular/dev-infra/commit/cf92a666d40fee957e1e7f964016054ccb023ab1) | feat | **ci:** create a common tool for gathering test results from bazel ([#239](https://github.com/angular/dev-infra/pull/239)) |
| [c3f5729](https://github.com/angular/dev-infra/commit/c3f5729376048af3ce939a505e5389dba11ff7d2) | fix | **pr:** rename MergeConfig to PullRequestConfig, discover the attribute at pullRequest instead of merge ([#237](https://github.com/angular/dev-infra/pull/237)) |
## Special Thanks
Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.9.19"></a>
# 2021.9.19 (2021-09-19)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [6aecdfb](https://github.com/angular/dev-infra/commit/6aecdfb022b03064a1eb3782983c324697682af7) | feat | support for terser v5 and 2020 in rollup_bundle rule ([#215](https://github.com/angular/dev-infra/pull/215)) |
| [57a4705](https://github.com/angular/dev-infra/commit/57a47054551f3b343cca25efb2f16b4138346d49) | feat | switch away from deprecated rollup plugins |
| [703aefc](https://github.com/angular/dev-infra/commit/703aefcc941eb22339991958bd8f2a7c0d666d95) | fix | no browsers matching for windows x86_64 cpu ([#220](https://github.com/angular/dev-infra/pull/220)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [33c7394](https://github.com/angular/dev-infra/commit/33c7394ec5973888c6a25415920ad873cbd33c63) | feat | **pr:** include comment for PR merges on all autosquashed merges |
| [284cb3d](https://github.com/angular/dev-infra/commit/284cb3dab5fa9c9e49f549586cf05a2bc77b0bdb) | feat | **release:** add marker between generated changelog entries ([#212](https://github.com/angular/dev-infra/pull/212)) |
| [7bdd465](https://github.com/angular/dev-infra/commit/7bdd46591b6300ca636f3c78fd1b427d7f3fdf38) | feat | add safety checks for shallow repositories ([#218](https://github.com/angular/dev-infra/pull/218)) |
| [5e1f351](https://github.com/angular/dev-infra/commit/5e1f3518776419f91526cfc46ee7c916ea359613) | fix | **pr:** Move the cleanup of the merge attempt to the finally block ([#216](https://github.com/angular/dev-infra/pull/216)) |
| [9416a56](https://github.com/angular/dev-infra/commit/9416a568fdbac8a272d44dd55616f334c7467004) | fix | **pr:** Use `--deepen` in place of `--depth` during fetches in rebasing |
| [ad534e2](https://github.com/angular/dev-infra/commit/ad534e2fd3448abc4bf4c4c8bd7254ce4289fc93) | fix | **release:** Use new changelog writer each time an entry is prepending to the changelog file ([#224](https://github.com/angular/dev-infra/pull/224)) |
| [faae17f](https://github.com/angular/dev-infra/commit/faae17f6e216b9b0ae8337de52737b7d6f2bd229) | fix | merge tool accidentally performing unauthenticated Github requests ([#228](https://github.com/angular/dev-infra/pull/228)) |
## Special Thanks
Joey Perrott, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.9.9"></a>
# 2021.9.9 (2021-09-09)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [0ffac18](https://github.com/angular/dev-infra/commit/0ffac1824d67209240efa5ae362b9a7a4d9a0b54) | feat | support browsers for m1 platform |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [8747538](https://github.com/angular/dev-infra/commit/874753848246c88fb08e51fe8a30c41134ea0362) | feat | **release:** support prepending new release note entries to the changelog ([#204](https://github.com/angular/dev-infra/pull/204)) |
| [f631e36](https://github.com/angular/dev-infra/commit/f631e361a2e748a280dd41a90f77843b3b6c1301) | feat | support performing configuration assertions in the getConfig function ([#204](https://github.com/angular/dev-infra/pull/204)) |
| [c5da4aa](https://github.com/angular/dev-infra/commit/c5da4aa001b388b323ba80167a8ca8435bbfe7eb) | fix | **release:** fetch release notes compare tag and store it locally ([#207](https://github.com/angular/dev-infra/pull/207)) |
| [12c4de0](https://github.com/angular/dev-infra/commit/12c4de00bc410a1082e32fff7c082a7d216660b0) | fix | set `_` as the username in the URL when creating authenticated git URLs ([#199](https://github.com/angular/dev-infra/pull/199)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.8.31"></a>
# 2021.8.31 (2021-08-31)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [2589dcd](https://github.com/angular/dev-infra/commit/2589dcd9a393830b696fa7ade0e0a4c750d067ee) | feat | **release:** Allow retrieving the number of commits in the release notes ([#180](https://github.com/angular/dev-infra/pull/180)) |
| [c76f891](https://github.com/angular/dev-infra/commit/c76f89188ab5a0cca9756ba22daa806684405959) | feat | allow for setting the cached configuration object imperatively ([#180](https://github.com/angular/dev-infra/pull/180)) |
| [80b22b0](https://github.com/angular/dev-infra/commit/80b22b0d339ab57ed82f30fa58811fe28e0ba829) | feat | create a spinner utility ([#183](https://github.com/angular/dev-infra/pull/183)) |
| [39af989](https://github.com/angular/dev-infra/commit/39af989a0862e684b7f4934fd6a61be6bc65f423) | feat | sort commits in release notes based on description |
## Special Thanks
Angular Robot, Charles Lyding, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
