"""Implementation of the `browser_repo` rule."""

def _browser_repo_impl(ctx):
    urls = ctx.attr.urls
    sha256 = ctx.attr.sha256

    # If the URL resolves to a `.dmg` file, then we need to convert the file
    # to a zip so that we can extract the actual binaries.
    if urls[0].endswith(".dmg"):
        download_file_name = "_download_file_%s.dmg" % ctx.attr.name
        result_zip_name = "_converted_file_%s.zip" % ctx.attr.name

        ctx.download(urls, download_file_name, sha256)
        exec_result = ctx.execute([
            ctx.path(Label("//browsers/private:convert_dmg_to_zip.sh")),
            download_file_name,
            result_zip_name,
        ])
        if exec_result.return_code != 0:
            fail("Could not extract DMG archive: %s" % exec_result.stderr)

        ctx.extract(result_zip_name)

        ctx.delete(result_zip_name)
        ctx.delete(download_file_name)
    else:
        ctx.download_and_extract(
            url = urls,
            sha256 = sha256,
        )

    named_files_label_dict = {}
    for name, value in ctx.attr.named_files.items():
        named_files_label_dict[":%s" % value] = name

    # The browser archive has been downloaded and extracted. We now generate a repository
    # `BUILD.bazel` file that exposes the archive files, together with the specified
    # named files using the `browser_artifact` rule.
    ctx.file("BUILD.bazel", content = """
load("@rules_browsers//browsers/private:browser_artifact.bzl", "browser_artifact")

browser_artifact(
  name = "info",
  files = glob(["**/*"], exclude = %s),
  named_files = %s,
  visibility = ["//visibility:public"],
)

exports_files(%s)
""" % (
        str(ctx.attr.exclude_patterns),
        str(named_files_label_dict),
        str(ctx.attr.exports_files),
    ))

_DOC = """
  Rule that can be used to download and unpack a browser archive in a dedicated Bazel
  repository. Additionally, files within the archive can be denoted with an unique name
  so that web tests can access browser files in a platform-agnostic way, regardless of
  which `browser_repo` repository is added as dependency.

  As an example for the concept of denoting archive files with an unique name, consider a case
  where a web test decides conditionally based on the current exec platform which
  `browser_repo` repository is used (e.g. mac, windows or linux). The archives are different
  for each platform. The test usually would need to determine the current platform, and know how
  each archive is structured in order to access the browser binary within the repository. By
  defining named files though, the web test could just pull a named file called `BINARY` that
  always resolves to the browser binary in a platform-agnostic way.

  Note #1: This rule exists as an alternative to the `platform_http_file` concept
  from `rules_webtesting` because the `platform_http_file` rule does not extract the archive
  directly, but relies on later build actions to perform the unpacking. This results in less
  efficient caching because build actions are invalidated more frequently (e.g. `bazel clean).
  We also noticed that the extraction within RBE containers is rather unstable, and extracting
  the archives as part of a Bazel repository mitigates this (as extractions happens on the host).

  Note #2: Additionally `rules_webtesting` defines a single repository for all platforms,
  where only an archive for the current host platform is pulled. This breaks cross-compilation
  because the wrong platform archive would be used for web tests that run in the exec platform.
"""
browser_repo = repository_rule(
    implementation = _browser_repo_impl,
    doc = _DOC,
    attrs = {
        "urls": attr.string_list(
            doc = "URLs used for downloading the archive. Multiple URLs can be serve as fallback.",
            mandatory = True,
        ),
        "sha256": attr.string(
            doc = "SHA256 checksum for the archive.",
            mandatory = True,
        ),
        "named_files": attr.string_dict(
            doc = """
              Dictionary that maps files to unique identifiers. This is useful
              if browser archives are different on different platforms and the web
              tests would not want to care about archive-specific paths. e.g. targets
              expect a `CHROMIUM` key to point to the Chromium browser binary.
            """,
            mandatory = True,
        ),
        "exclude_patterns": attr.string_list(
            default = [],
            doc = """Patterns of files which should be excluded from the browser runfiles.

              This is useful for example when files with spaces are shipped as part of the
              archives of browsers. Runfiles with spaces cause issues within Bazel and if
              these files are not strictly needed, they should be omitted.
            """,
        ),
        "exports_files": attr.string_list(
            default = [],
            doc = """Patterns of files which should be added to exports_files.

              This is useful for example when files with spaces are shipped as part of the
              archives of browsers. Instead of individual files, the top-level source directory
              can be depended on which resolves the runfiles with spaces issue. NB: source
              directories are not compatible with remote execution so a target that uses sources
              directory inputs should be tagged "local".
            """,
        ),
    },
)
