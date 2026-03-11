load("@aspect_rules_js//js:defs.bzl", "js_run_devserver")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@bazel_lib//lib:run_binary.bzl", "run_binary")

def optimize_angular_app(
        name,
        srcs = [],
        deps = [],
        env = {},
        include_zonejs = False,
        jq_config_filter = ""):
    npm_package(
        name = "_%s_package" % name,
        tags = ["manual"],
        srcs = srcs,
        # Include everything matched, even outside of the current package.
        # This allows for common utilities from e.g. the WORKSPACE root to be available.
        include_srcs_packages = ["**"],
        root_paths = [""],
    )

    run_binary(
        name = "_%s_build" % name,
        tool = "@rules_angular//src/optimization:optimize",
        tags = ["manual"],
        srcs = [
            ":_%s_package" % name,
            "@yq_toolchains//:resolved_toolchain",
            "@rules_angular//src/optimization/boilerplate",
            "@rules_angular//src/optimization:ng_cli_tool",
        ] + deps,
        out_dirs = ["%s_cli_execution" % name],
        use_default_shell_env = True,
        progress_message = "Optimizing Angular app: %{label}",
        mnemonic = "OptimizeAngular",
        env = dict({
            "NG_CLI_TOOL_RUNFILES_PATH": "$(rlocationpath @rules_angular//src/optimization:ng_cli_tool)",
            "BAZEL_BINDIR": ".",
            "OUT_DIR": "$(@)",
            "CURRENT_PACKAGE": native.package_name(),
            "BOILERPLATE_DIR": "$(execpath @rules_angular//src/optimization/boilerplate)",
            "INPUT_PACKAGE": "$(execpath :_%s_package)" % name,
            "JQ_CONFIG_FILTER": jq_config_filter,
            "INCLUDE_ZONEJS": str(include_zonejs),
            "YQ_BIN": "$(YQ_BIN)",
        }, **env),
        toolchains = ["@yq_toolchains//:resolved_toolchain"],
    )

    npm_package(
        name = name,
        srcs = [":_%s_build" % name],
        include_srcs_packages = ["."],
        include_srcs_patterns = ["%s_cli_execution/dist/boilerplate/browser/**" % name],
        replace_prefixes = {
            "%s_cli_execution/dist/boilerplate/browser" % name: "",
        },
    )

    js_run_devserver(
        name = name + ".serve",
        tags = ["manual"],
        tool = "@rules_angular//src/optimization:ng_cli_tool",
        chdir = "%s/%s_cli_execution" % (native.package_name(), name),
        args = ["serve", "boilerplate"],
        data = [":_%s_build" % name] + deps,
    )
