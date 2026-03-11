load("//src/toolchain:configure_sass.bzl", "configure_sass")
load("//src/toolchain:versions.bzl", "PLATFORMS", "VERSION")

def _sass_extension(_):
    for platform in PLATFORMS.keys():
        info = VERSION[platform]

        configure_sass(
            name = "%s_sass" % platform,
            file = info["file"],
            sha256 = info["sha256"],
            constraints = PLATFORMS[platform].compatible_with,
        )

sass = module_extension(
    implementation = _sass_extension,
    tag_classes = {
        "toolchain": tag_class(attrs = {}),
    },
)
