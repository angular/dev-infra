load("@aspect_rules_ts//ts:defs.bzl", _ts_config = "ts_config")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("//tools:ts_project_interop.bzl", _ts_project = "ts_project")

ts_config = _ts_config

def _determine_tsconfig(testonly):
    if native.package_name().startswith("ng-dev"):
        return "//ng-dev:tsconfig_test" if testonly else "//ng-dev:tsconfig"

def ts_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def ng_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        rule_impl = _ng_project,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )
