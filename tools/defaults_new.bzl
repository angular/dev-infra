load("@aspect_rules_ts//ts:defs.bzl", _ts_config = "ts_config", _ts_project = "ts_project")
load("@aspect_bazel_lib//lib:write_source_files.bzl", _write_source_files = "write_source_files")
load("@aspect_rules_js//js:defs.bzl", _js_library = "js_library")
load("@aspect_rules_esbuild//esbuild:defs.bzl", _esbuild = "esbuild")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", _copy_to_bin = "copy_to_bin")
load("@aspect_bazel_lib//lib:copy_file.bzl", _copy_file = "copy_file")
load("@aspect_bazel_lib//lib:directory_path.bzl", _directory_path = "directory_path")

js_library = _js_library
write_source_files = _write_source_files
copy_file = _copy_file
copy_to_bin = _copy_to_bin
directory_path = _directory_path
esbuild = _esbuild
ts_config = _ts_config

def ts_library(
        tsconfig = "//:tsconfig",
        declaration = True,
        **kwargs):
    _ts_project(
        tsconfig = tsconfig,
        declaration = declaration,
        **kwargs
    )

def ng_module(
        tsconfig = "//:tsconfig",
        declaration = True,
        **kwargs):
    _ts_project(
        tsconfig = tsconfig,
        declaration = declaration,
        tsc = "//tools/ngc",
        tsc_worker = "//tools/ngc:worker",
        **kwargs
    )
