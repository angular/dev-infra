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

SassInfo = provider(
    doc = "Provider holding relevant Sass files use in binary compilations",
    fields = {
        "transitive_sources": "Sass sources for this target and its dependencies",
        "module_mappings": "Module mappings provided by the this target and its dependencies",
    },
)
