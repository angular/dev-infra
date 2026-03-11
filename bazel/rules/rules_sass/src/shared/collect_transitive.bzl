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
# Fork of: https://github.com/bazelbuild/rules_sass.

load("@rules_sass//src/shared:providers.bzl", "SassInfo")

def collect_transitive_sources(srcs, deps):
    "Sass compilation requires all transitive .sass source files"
    return depset(
        srcs,
        transitive = [dep[SassInfo].transitive_sources for dep in deps],
        # Provide .sass sources from dependencies first
        order = "postorder",
    )

def collect_transitive_mappings(deps):
    "All of the module mappings need to be collected to be available at the binary target"
    mappings = {}
    for dep in deps:
        for (k, v) in dep[SassInfo].module_mappings.items():
            mappings[k] = v
    return mappings
