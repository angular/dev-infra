# rules_browsers

Use browsers in Bazel and run tests with them.

## Usage

Add the dependency for `rules_browsers` to your `MODULE.bazel` file.

```starlark
bazel_dep(name = "rules_browsers", version = "0.4.0")
```

This allows you to use provided testing macros. You can also use the
`browser_group` and `browser_toolchain_alias` targets in the browser
directories.

By default, browsers will be used at the _default version_. The default version
is usually the latest version that was available at the time of the used release
of `rules_browsers`. The consequence of this is that upgrading `rules_browsers`
usually means changing the default browser version.

> [!NOTE]
> The default version of browsers can change in any release.

You can manually specify the exact browser version to use for each browser by
providing a version in your own `MODULE.bazel` file. The set of available
versions can be found in `browsers/private/versions/<browser>.bzl`.

```starlark
browsers = use_extension("@rules_browsers//browsers:extensions.bzl", "browsers")
browsers.chrome(version = "x.x.x")
browsers.chromedriver(version = "x.x.x")
browsers.firefox(version = "x.x.x")
```

## Supported Browsers

- Chrome _(`chrome-headless-shell`)_
- Chromedriver
- Firefox

Each browser is provided for the following OS x architecture combinations:

- `linux_x64`
- `macos_x64`
- `macos_arm64`
- `windows_x64`

## Version Policy

This project does not explicitly follow any versioning policy at this time. Any
release may include breaking changes.
