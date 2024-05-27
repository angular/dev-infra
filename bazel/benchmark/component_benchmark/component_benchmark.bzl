load("//bazel/app-bundling:index.bzl", "app_bundle")
load("//bazel/http-server:index.bzl", "http_server")
load("//bazel:expand_template.bzl", "expand_template")
load("@npm//@angular/bazel:index.bzl", "ng_module")
load("//bazel:defaults.bzl", "ts_library")
load(":benchmark_test.bzl", "benchmark_test")

def copy_default_index_html(output_name, bundle_target_name):
    """Copies the default `index.html` file to the current package."""

    expand_template(
        name = "copy_default_index_html_%s" % output_name,
        output_name = output_name,
        template = "//bazel/benchmark/component_benchmark/defaults:index-template.html",
        substitutions = {"{bundle_target_name}": bundle_target_name},
    )

def copy_default_file(origin, destination):
    """
    Copies a file from ./defaults to the destination.

    Args:
        origin: The name of a file in ./defaults to be copied.
        destination: Where the original file will be clopied to.
    """
    native.genrule(
        name = "copy_default_" + origin + "_file_genrule",
        srcs = ["//bazel/benchmark/component_benchmark/defaults:" + origin],
        outs = [destination],
        cmd = "cat $(SRCS) >> $@",
    )

def component_benchmark(
        name,
        prefix,
        driver,
        driver_deps,
        ng_srcs,
        ng_deps = [
            "@npm//@angular/core",
            "@npm//@angular/platform-browser",
        ],
        ng_assets = [],
        assets = None,
        styles = None,
        entry_point = None):
    """
    Runs a benchmark test against the given angular app using the given driver.

    This rule was created with the intention of reducing the amount of
    duplicate/boilderplate code, while also allowing you to be as verbose with
    your app as you'd like. The goal being that if you just want to test a
    simple component, the only thing you'd need to provide are the component
    (via ng_srcs) and driver.

    ** USAGE NOTES **

    (assets/styles): The default index.html imports a stylesheet named
    "styles.css". This allows the use of the default index.html with a custom
    stylesheet through the styles arg by providing either a styles.css in the
    prefix directory or by providing a css binary named styles.css.

    (assets): The default index.html expects that the root selector for
    the benchmark app is "app-root".

    (entry_point): The default entry_point expects a file named "app.module" to
    export the root NgModule for the benchmark application. It also expects that the
    root NgModule is named "AppModule" and has a bootstrap component declared with
    the selector `app-root`.

    TIP: The server is named `name + "_server"` so that you can view/debug the
    app.

    Args:
      name: The name of the benchmark_test to be run
      prefix: The relative path to the root directory of the benchmark app
      driver: The ts driver for running the benchmark
      driver_deps: Driver's dependencies
      ng_srcs: All of the ts srcs for the angular app
      ng_deps: Dependencies for the angular app
      ng_assets: The static assets for the angular app
      assets: Static files
      styles: Stylesheets
      entry_point: Main entry point for the angular app. If specified, must
        be part of the `ng_srcs`
    """
    app_lib = name + "_app_lib"
    app_main = name + "_app_main"
    benchmark_driver = name + "_driver"
    server = name + "_server"
    ng_bundle_deps = [":%s" % app_lib]

    # If the user doesn't provide assets, entry_point, or styles, we use a
    # default version.
    # Note that we copy the default files to the same directory as what is used
    # by the app for three reasons:
    # 1. To avoid having the entry point be defined in a different package from
    # where this macro is called.
    # 2. So that we can use relative paths for imports in entry point.
    # 3. To make using default static files as seamless as possible.

    if not entry_point:
        entry_point = prefix + "default_index.ts"
        ng_srcs.append(entry_point)
        copy_default_file("index.ts", entry_point)

        # Note: In the default entry-point index, `zone.js` is imported in a way that is not
        # checked by TypeScript. We add the dependency only for bundling to reduce the compilation
        # scope and to make it easier to replace this dependency inside the `angular/angular`
        # repository with its corresponding source target that does not come with any typings.
        ng_bundle_deps.append("@npm//zone.js")

    if not assets:
        html = prefix + "index.html"
        assets = [html]

        copy_default_index_html(html, app_main)

    if not styles:
        css = prefix + "styles.css"
        styles = [css]
        copy_default_file("styles.css", css)

    # Bootstraps the application and creates
    # additional files to be imported by the entry_point file.
    ng_module(
        name = app_lib,
        srcs = ng_srcs,
        assets = ng_assets,
        deps = ng_deps,
        tsconfig = "//bazel/benchmark/component_benchmark:tsconfig-e2e.json",
    )

    # Bundle the application (needed for the http server).
    app_bundle(
        name = app_main,
        entry_point = entry_point,
        deps = ng_bundle_deps,
    )

    # The ts_library for the driver that runs tests against the benchmark app.
    ts_library(
        name = benchmark_driver,
        tsconfig = "//bazel/benchmark/component_benchmark:tsconfig-e2e.json",
        testonly = True,
        srcs = [driver],
        deps = driver_deps,
    )

    # The server for our application.
    http_server(
        name = server,
        srcs = assets + styles,
        deps = [":%s.min.js" % app_main],
        additional_root_paths = ["//bazel/benchmark/component_benchmark/defaults"],
    )

    # Runs a protractor test that's set up to use @angular/benchpress.
    benchmark_test(
        name = name,
        server = ":" + server,
        deps = [":" + benchmark_driver],
    )
