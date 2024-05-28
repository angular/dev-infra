load("@npm//@bazel/concatjs:index.bzl", _ts_library = "ts_library")

def ts_library(name, testonly = False, deps = [], srcs = [], devmode_module = None, **kwargs):
    _ts_library(
        name = name,
        devmode_module = devmode_module if devmode_module != None else "umd",
        devmode_target = "es2020",
        prodmode_module = "esnext",
        prodmode_target = "es2020",
        tsconfig = kwargs.pop("tsconfig", "//:tsconfig"),
        testonly = testonly,
        deps = deps,
        srcs = srcs,
        **kwargs
    )
