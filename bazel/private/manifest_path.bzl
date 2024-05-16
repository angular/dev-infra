"""Starlark helpers for Bazel manifest paths."""

def get_manifest_path(ctx, file):
    """Computes the manifest path for the given `File`.

    For example: `../some/file` becomes `<wksp_name>/some/file` or
                 `../external_wksp/some/file` becomes `external_wksp/some/file`.

    Args:
      ctx: Rule context
      file: File for which to retrieve the manifest path.
    Returns:
      A manifest path for the given file.
    """

    # If a short path starts with `../`, then the file is from an external
    # workspace and we can just strip off the leading segment.
    if file.short_path.startswith("../"):
        return file.short_path[3:]

    return "%s/%s" % (ctx.workspace_name, file.short_path)
