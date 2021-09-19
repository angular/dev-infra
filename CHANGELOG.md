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
