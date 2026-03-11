load("@aspect_rules_ts//ts:defs.bzl", _ts_project = "ts_project")
load("@bazel_lib//lib:utils.bzl", "to_label")

def ts_project(
        name,
        tsconfig = None,
        **kwargs):
    """ts_project using `rules_angular` worker implementation for fast and consistent DX.

    Args:
        name: The target's name
        tsconfig: The tsconfig to be used as a base configuration for the compilation.
        **kwargs: Additional arguments passed along to the underlying `rules_ts` ts_project.
    """

    if tsconfig == None:
        fail("No tsconfig was provided. You must set the tsconfig attribute on {}.".format(to_label(name)))

    if type(tsconfig) == type(dict()):
        fail("A dictionary representation of tsconfig is not a valid parameter for tsconfig in this rule.")

    _ts_project(
        name = name,
        tsconfig = tsconfig,
        # Use the worker from our own Angular rules, as the default worker
        # from `rules_ts` is incompatible with TS5+ and abandoned. We need
        # worker for efficient, consistent and fast DX.
        supports_workers = 1,
        tsc_worker = "@rules_angular//src/worker:worker_vanilla_ts",
        build_progress_message = select({
            "@rules_angular//src/ng_project/config:partial_compilation_enabled": "Compiling TS (partial compilation): {label}",
            "//conditions:default": "Compiling TS: {label}",
        }),
        **kwargs
    )
