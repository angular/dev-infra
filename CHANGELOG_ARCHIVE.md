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

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.4.3"></a>
# 2022.4.3 (2022-04-03)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [e80739b](https://github.com/angular/dev-infra/commit/e80739bfd27297af647953b950ec0e62d58ca21c) | feat | **api-golden:** allow for module types to be provided |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [c05de8e](https://github.com/angular/dev-infra/commit/c05de8e176d7930fb959bc1a893cad9f3b984458) | feat | **pullapprove:** handle references to `author` in condition |
| [9b5b3d4](https://github.com/angular/dev-infra/commit/9b5b3d453d8beea74bbb7b7d29ed8c0b85a070af) | feat | **pullapprove:** support `in` operator in condition evaluation |
| [87e5ec9](https://github.com/angular/dev-infra/commit/87e5ec9d2b01e5b9f89f758fc1e72763bc2e96de) | feat | add simple migration command for master branch rename |
| [31fa837](https://github.com/angular/dev-infra/commit/31fa8373b90641452197a4539f7a06ef2b225943) | feat | improve debug output for git client command dispatching |
| [72fcac4](https://github.com/angular/dev-infra/commit/72fcac4a9272a4d4566ac78566cab00ac2f34bd1) | fix | do not print git client command stderr on success |
| [e9ce8d5](https://github.com/angular/dev-infra/commit/e9ce8d577f2eb459704e341417821e5523f14b86) | fix | fix github token retrieval logic |
## Special Thanks
Alan Agius, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.3.27"></a>
# 2022.3.27 (2022-03-27)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [6379fcf](https://github.com/angular/dev-infra/commit/6379fcf00a013f3695d18b5281888f671424e37a) | feat | api-golden test should leverage package exports information for finding entries |
| [38f2a98](https://github.com/angular/dev-infra/commit/38f2a980e08337f150c2840d961e44cc361aa37d) | fix | continue to support non-exports resolution in api-golden test |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [d831eaa](https://github.com/angular/dev-infra/commit/d831eaabed39001fe776a4d4d0f11c7fdcf4afae) | fix | lock formatting dependencies to avoid formating failures |
## Special Thanks
Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.3.20"></a>
# 2022.3.20 (2022-03-20)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [cd25674](https://github.com/angular/dev-infra/commit/cd25674bf426cd367b6b5700550c6b75b07de6e9) | fix | use correct `LinkerPackageMappingInfo` field name |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [2c7dece](https://github.com/angular/dev-infra/commit/2c7dece49c9a83992899140c4c6e636a926d2bb2) | fix | avoid runtime error when pull request does not have status/checks |
## Special Thanks
George Kalpakas, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.3.13"></a>
# 2022.3.13 (2022-03-13)
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [c0d2a02](https://github.com/angular/dev-infra/commit/c0d2a028bb46e37c52911273cb3b8e7dcfd496c1) | feat | format yaml files with prettier by default |
| [fa77b14](https://github.com/angular/dev-infra/commit/fa77b144ff927a719ab33c510830d1453e89db1d) | fix | correctly indent bullets in breaking changes and deprecations sections |
## Special Thanks
Alan Agius and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.3.6"></a>
# 2022.3.6 (2022-03-06)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [81a01c5](https://github.com/angular/dev-infra/commit/81a01c58bebfe2112f78a7ef63047232506c5593) | feat | **integration:** support for executables to be provided in tool mappings |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [e43bee7](https://github.com/angular/dev-infra/commit/e43bee7dcbc6d6c2118436d542a4aecb759e0631) | feat | support skipping version stamp in release stamp env |
| [b555dd0](https://github.com/angular/dev-infra/commit/b555dd0c28fab88f132c0858cd2f1f130d707361) | fix | **release:** only match on a single character prefixed version for snapshotting ([#449](https://github.com/angular/dev-infra/pull/449)) |
| [104c49a](https://github.com/angular/dev-infra/commit/104c49ad795097101ab3aa268a8e9af2cdf04a8d) | fix | limit the amount of CPUs used by workers ([#436](https://github.com/angular/dev-infra/pull/436)) |
## Special Thanks
Alan Agius, George Kalpakas, Jason Bedard, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.2.27"></a>
# 2022.2.27 (2022-02-27)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [53786a3](https://github.com/angular/dev-infra/commit/53786a3d630f1ba10bbb6697913768215ca41308) | feat | add rule for extracting type definitions from targets ([#430](https://github.com/angular/dev-infra/pull/430)) |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [c969fc8](https://github.com/angular/dev-infra/commit/c969fc8c87b91faf2e415baae9ccce8fec310dc1) | feat | expose entry-point with code-splitting for runtime consumers ([#430](https://github.com/angular/dev-infra/pull/430)) |
| [a9c4860](https://github.com/angular/dev-infra/commit/a9c48602d4f54850beabdf7933e05a9ce89e9dd5) | fix | uncommitted changes check returning false-positives ([#416](https://github.com/angular/dev-infra/pull/416)) |
## Special Thanks
Charles Lyding, George Kalpakas, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.2.20"></a>
# 2022.2.20 (2022-02-20)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [09cb90c](https://github.com/angular/dev-infra/commit/09cb90cd7e273966d8bc1e1a2dd98484e347a4cf) | feat | **karma:** expose karma web test rule in shared karma code |
| [a3ad969](https://github.com/angular/dev-infra/commit/a3ad969facdad942bbb0a6a75100fe25f9243b26) | feat | setup karma web test wrapper with "local" debug target ([#403](https://github.com/angular/dev-infra/pull/403)) |
| [5b35e20](https://github.com/angular/dev-infra/commit/5b35e20aeb147b713c31ba5c269cf2128c746d46) | fix | **karma:** web test arguments not passed through |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [74b89a4](https://github.com/angular/dev-infra/commit/74b89a46292330ba949652680c30b0280249db74) | feat | **format:** add staged files back ([#405](https://github.com/angular/dev-infra/pull/405)) |
## Special Thanks
Paul Gschwendtner, dario-piotrowicz and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
<a name="2022.2.13"></a>
# 2022.2.13 (2022-02-13)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [a3cbcf1](https://github.com/angular/dev-infra/commit/a3cbcf1c7329b9a44123c3a90eed7f3fb6049ffd) | feat | **browsers:** update chromium to 99.0.4759.0 |
| [f27b1d9](https://github.com/angular/dev-infra/commit/f27b1d9e3921f8f9c129bc92d9d2f2b6989f57ec) | feat | **browsers:** update firefox and geckodriver to v97.0 |
| [19e2bfd](https://github.com/angular/dev-infra/commit/19e2bfd6e4f7a303b9426c6b416255150397c0bd) | fix | **browsers:** invalid browser firefox geckodriver checksum |
### ng-dev
| Commit | Type | Description |
| -- | -- | -- |
| [1c1d5c5](https://github.com/angular/dev-infra/commit/1c1d5c5d28f1c670ecdf9615c4e62a87f48151ee) | fix | **pr:** do not fail assertions for changes for target label when the fixup label is applied ([#392](https://github.com/angular/dev-infra/pull/392)) |
## Special Thanks
Alan Agius, Joey Perrott, Lukas Spirig, Paul Gschwendtner and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->
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
