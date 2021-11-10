stampSubstitutions = {
    # The variables are special statuses generated within the Bazel workspace
    # status command stamping script.
    "{SCM_HEAD_SHA}": "{BUILD_SCM_COMMIT_SHA}",
}

noStampSubstitutions = dict(stampSubstitutions, **{})

basePackageSubstitutions = {
    "    \"prepare\": \"husky install\",\n": "",
    "@dev-infra//bazel/": "@npm//@angular/dev-infra-private/bazel/",
    "//bazel/": "@npm//@angular/dev-infra-private/bazel/",
    "//bazel:": "@npm//@angular/dev-infra-private/bazel:",
    "//ng-dev/": "@npm//@angular/dev-infra-private/ng-dev/",
    "//ng-dev:": "@npm//@angular/dev-infra-private/ng-dev:",
    "//tslint-rules/": "@npm//@angular/dev-infra-private/tslint-rules/",
    "//tslint-rules:": "@npm//@angular/dev-infra-private/tslint-rules:",
    "//:tsconfig.json": "@npm//@angular/dev-infra-private:tsconfig.json",
}

NPM_PACKAGE_SUBSTITUTIONS = select({
    "//tools:stamp": dict(basePackageSubstitutions, **stampSubstitutions),
    "//conditions:default": dict(basePackageSubstitutions, **noStampSubstitutions),
})
