# Copyright 2025 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""The `npm_sass_library` rule for importing and exposing sass files from npm packages for compilations."""

load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load("@rules_sass//src/shared:providers.bzl", "SassInfo")

def _npm_sass_library_impl(ctx):
    """npm_sass_library collects all transitive sources for the provided npm packages provided in deps."""
    transitive_sources = []
    module_mappings = {}

    for dep in ctx.attr.deps:
        if JsInfo not in dep:
            fail("The provided package (%s) does not contain JsInfo" % dep.label)

        # We select the first npm_package_store_info as npm packages will always have only one definition.
        package = dep[JsInfo].npm_package_store_infos.to_list()[0].package

        # Set the module mapping for the specific package name to the location of the package.
        module_mappings[package] = "%s/%s/%s" % (
            ctx.bin_dir.path,
            dep[JsInfo].target.package,
            dep[JsInfo].target.name,
        )

        # Add all of the npm sources sources to the transitive source files.
        transitive_sources.append(dep[JsInfo].npm_sources)

    outputs = depset(transitive = transitive_sources)

    return [
        SassInfo(
            transitive_sources = outputs,
            module_mappings = module_mappings,
        ),
        DefaultInfo(
            files = outputs,
            runfiles = ctx.runfiles(transitive_files = outputs),
        ),
    ]

npm_sass_library = rule(
    implementation = _npm_sass_library_impl,
    attrs = {
        "deps": attr.label_list(
            doc = "Npm package targets containing provinding sass",
            allow_files = False,
        ),
    },
)
