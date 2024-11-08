stampSubstitutions = {
    # The variables are special statuses generated within the Bazel workspace
    # status command stamping script.
    "{SCM_HEAD_SHA}": "{BUILD_SCM_COMMIT_SHA}",
}

noStampSubstitutions = dict(stampSubstitutions, **{})

basePackageSubstitutions = {
    # Remove devDependencies for shipped built packages.
    # For some odd reason, yarn is tring to resolve the patches when this is installed in angular/angular
    # Couldn't find any versions for "@angular/bazel" that matches "patch:@angular/bazel@npm:14.1.0-next.2#.yarn/patches/@angular-bazel-npm.patch"
    # ? Please choose a version of "@angular/bazel" from this list: (Use arrow keys)
    "\"devDependencies\":[\\w\\W\\s]+?\\s+},\\s+": "",
    "(#|//)\\s+BEGIN-DEV-ONLY[\\w\\W]+?(#|//)\\s+END-DEV-ONLY": "",
    "    \"prepare\": \"husky install\",\n": "",
    "@dev-infra//bazel/": "@npm//@angular/build-tooling/bazel/",
    "rlocation \"dev-infra/": "rlocation \"npm/@angular/build-tooling/",
    "//bazel/": "@npm//@angular/build-tooling/bazel/",
    "//bazel:": "@npm//@angular/build-tooling/bazel:",
    "//lint-rules/tslint/": "@npm//@angular/build-tooling/tslint/",
    "//lint-rules/tslint:": "@npm//@angular/build-tooling/tslint:",
    "//lint-rules/stylelint/": "@npm//@angular/build-tooling/stylelint/",
    "//lint-rules/stylelint:": "@npm//@angular/build-tooling/stylelint:",
    "//shared-scripts/": "@npm//@angular/build-tooling/shared-scripts/",
    "//shared-scripts:": "@npm//@angular/build-tooling/shared-scripts:",
    "//:tsconfig.json": "@npm//@angular/build-tooling:tsconfig.json",
}

NPM_PACKAGE_SUBSTITUTIONS = select({
    "//tools:stamp": dict(basePackageSubstitutions, **stampSubstitutions),
    "//conditions:default": dict(basePackageSubstitutions, **noStampSubstitutions),
})

# These packages are allowed to use macros from `defaults.bzl`. This is a
# little safety improvement to avoid accidentally relying on the defaults
# which are not available when the dev-infra tooling is consumed.
BZL_DEFAULTS_ALLOW_PACKAGES = [
    ".github/local-actions",
    "",
    "apps",
    "bazel/browsers/update-script",
    "github-actions",
    "ng-dev",
    "tools",
    "lint-rules/tslint",
    "lint-rules/stylelint",
    "docs",
]
