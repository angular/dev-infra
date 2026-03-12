# rules_sass

> [!IMPORTANT]
> The source code for this library is maintained in the [angular/dev-infra](https://github.com/angular/dev-infra/tree/main/bazel/rules/rules_sass) repository.
> Please open any issues or pull requests in that repository.

## Usage

Add the dependency for `rules_sass` to your `MODULE.bazel` file.

```starlark
bazel_dep(name = "rules_sass")

git_override(
    module_name = "rules_sass",
    remote = "https://github.com/angular/rules_sass.git",
    commit = "{SHA}",
)
```
