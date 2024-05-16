def path_relative_to_label(label, short_path):
    """
      Gets a path relative to the specified label. This is achieved by just removing the label
      package path from the specified path. e.g. the path is "guides/test/my-text.md" and the
      label package is "guides/". The expected path would be "test/my-text.md".
    """
    return short_path[len(label.package) + 1:]
