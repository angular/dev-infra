"Macro definition to copy & modify root config files"

load("@jq.bzl//jq:jq.bzl", "jq")

# JQ expressions to update Angular project output paths from dist/* to projects/*/dist
# We do this to avoid mutating the files in the source tree, so that the native tooling without Bazel continues to work.
# Note: This assumes that 1P linking projects follow the `projects/<project>/` folder structure.
JQ_DIST_REPLACE_TSCONFIG = """
    .compilerOptions.paths |= if . then map_values(
      map(
        gsub("^dist/(?<p>.+)$"; "projects/"+.p+"/dist")
      )
    ) else {} end
"""

# Similarly update paths in angular.json
# This time we can properly know the project root and have the `dist` folder
# local to the BUILD file of the target/project.
JQ_DIST_REPLACE_ANGULAR = """
(
  .projects | to_entries | map(
    if .value.architect.test.builder != "@angular/build:unit-test" then
      .value.architect.test.options.preserveSymlinks = true
    else
      .
    end
    |
    if .value.projectType == "application" then
      .value.architect.build.options.outputPath = "./" + .value.root + "/dist"
      |
      .value.architect.build.options.preserveSymlinks = true
    else
      .
    end
  ) | from_entries
) as $updated |
. * {projects: $updated}
"""

# buildifier: disable=function-docstring
def ng_config(name, **kwargs):
    jq(
        name = "angular",
        srcs = ["angular.json"],
        filter = JQ_DIST_REPLACE_ANGULAR,
    )

    # NOTE: project dist directories are under the project dir unlike the Angular CLI default of the root dist folder
    jq(
        name = "tsconfig",
        srcs = ["tsconfig.json"],
        filter = JQ_DIST_REPLACE_TSCONFIG,
    )

    native.filegroup(
        name = name,
        srcs = [":angular", ":tsconfig"],
        **kwargs
    )
