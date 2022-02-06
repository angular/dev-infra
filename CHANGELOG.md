<a name="2022.2.6"></a>
# 2022.2.6 (2022-02-06)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [a90f807](https://github.com/angular/dev-infra/commit/a90f807bd664e27f8109069e31959cb2f780179d) | fix | disable angular linker sourcemaps |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [c922f5b](https://github.com/angular/dev-infra/commit/c922f5b23611024bc9d94833ae147f6048ab0275) | feat | abbreviated SHA stamp ([#373](https://github.com/angular/dev-infra/pull/373)) |
## Special Thanks
Alan Agius, Derek Cormier, Joey Perrott, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.1.30"></a>
# 2022.1.30 (2022-01-30)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [b066f7b](https://github.com/angular/dev-infra/commit/b066f7bc383e78a791505b6e7817bf2ef412a266) | feat | move devserver from angular/components to dev-infra |
| [e7f43ba](https://github.com/angular/dev-infra/commit/e7f43ba426f482caf3aabc53fccb02883f5c0c00) | fix | **benchmark:** expose benchpress test results as bazel test output |
| [8298e12](https://github.com/angular/dev-infra/commit/8298e121c51960857ef39abc16b743775ff6be68) | fix | **benchmark:** missing uuid runtime dependency for perf utils |
| [98b0de7](https://github.com/angular/dev-infra/commit/98b0de771265aad02241c1127e8d3afb6d12f648) | fix | **benchmark:** switch to http-server for perf tests to support Apple M1 |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [68a5b58](https://github.com/angular/dev-infra/commit/68a5b58c2dc8df50d6a5a49c8aa40fa9cc3c3b7d) | feat | format json files by default with prettier |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.1.16"></a>
# 2022.1.16 (2022-01-16)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [47168ba](https://github.com/angular/dev-infra/commit/47168baf0b140436ad30c923ba8de24cad0aefc2) | feat | allow options to be passed into esbuild ng linker plugin for bazel |
## Special Thanks
AleksanderBodurri and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.12.19"></a>
# 2021.12.19 (2021-12-19)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [edafc47](https://github.com/angular/dev-infra/commit/edafc47dd94893a32ba2399c72b09533f8fec5ea) | fix | do not always treat parts of `app_bundle` rule as testonly |
| [8f9c560](https://github.com/angular/dev-infra/commit/8f9c5606d6cc867b90a6b1dff2d4c099034b0fc5) | fix | unable to set tags for `app_bundle` rule due to conflict |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [0b4cae4](https://github.com/angular/dev-infra/commit/0b4cae4acd9d42f33af92951947a30d6aa165070) | feat | **release:** support experimental release packages |
| [3ea42c1](https://github.com/angular/dev-infra/commit/3ea42c1a2ce5812b610a4495c5b4d9a2ddf421b7) | fix | **release:** resolved yarn instance not used for "release info" command |
| [c24f7bf](https://github.com/angular/dev-infra/commit/c24f7bfcd036159d7dcf4df74e6248f9e37c99d9) | fix | do not accidentally leak github tokens for errors |
## Special Thanks
Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.12.12"></a>
# 2021.12.12 (2021-12-12)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [885008c](https://github.com/angular/dev-infra/commit/885008c8215ce0254ba191ae0cfa01b43c815405) | fix | benchmark angular compilation pipeline not working with APF v13 |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [1516a4e](https://github.com/angular/dev-infra/commit/1516a4ef6d42bdcf008a7984409468183ab67808) | fix | **release:** do not error when yarn version of publish branch is older |
## Special Thanks
Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.11.28"></a>
# 2021.11.28 (2021-11-28)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [30c518d](https://github.com/angular/dev-infra/commit/30c518dd8396e860f25ca4295dc6f4cd4a09b1da) | feat | add tooling to update vendored yarn version |
## Special Thanks
Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.11.21"></a>
# 2021.11.21 (2021-11-21)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [c0901db](https://github.com/angular/dev-infra/commit/c0901dbfbfbbe7fd086bc8ea3ce4c6ecb9bc9f8a) | feat | allow for linker mappings and external NPM package extraction in extract rule |
| [8b007f3](https://github.com/angular/dev-infra/commit/8b007f379515974f9b648e16637cd6e05d22308b) | feat | allow for working directory to be configured in integration tests |
| [32a04e0](https://github.com/angular/dev-infra/commit/32a04e0070f44f05e6822735e80f0cc5680ee996) | feat | introduce canonical place for esbuild bazel rules |
| [e67feed](https://github.com/angular/dev-infra/commit/e67feed1a753da554a120ac03910adc8c468b160) | feat | introduce rule for bundling specs with optional angular linker |
### github-actions
| Commit | Type | Description |
| -- | -- | -- |
| [912311a](https://github.com/angular/dev-infra/commit/912311af713004c92ddc3ac73eb0f43ceb55867f) | fix | properly set the authentication token for feature request action ([#306](https://github.com/angular/dev-infra/pull/306)) |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2021.11.14"></a>
# 2021.11.14 (2021-11-14)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [88d1b37](https://github.com/angular/dev-infra/commit/88d1b37354dad996d399f8ca0ace6cd1ba7e3307) | feat | expose browser driver binaries through toolchain aliases |
| [4144181](https://github.com/angular/dev-infra/commit/4144181a07b80c8a1c6c0ca35c6751253e1cc3db) | fix | integration rule not working with legacy external runfiles disabled |
| [afceae0](https://github.com/angular/dev-infra/commit/afceae0cd799b8f18865ead4d2579d9ed735c67a) | fix | integration rule using incorrect casing for working dir of commands |
| [ff39f60](https://github.com/angular/dev-infra/commit/ff39f60188b219ca368e463e4022be680ba7c73b) | fix | integration test rule not able to setup mappings for resolutions ([#286](https://github.com/angular/dev-infra/pull/286)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [0474a28](https://github.com/angular/dev-infra/commit/0474a28f6c7dbc47b8075e78223b2eeb8cd37c2e) | fix | **release:** properly ensure local ng-dev version is up-to-date |
## Special Thanks
Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
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
