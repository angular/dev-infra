"""Extension that allows loading browser repositories."""

load("//browsers/chromium:chromedriver.bzl", "define_chromedriver_repositories")
load("//browsers/chromium:chromium.bzl", "define_chrome_repositories")
load("//browsers/firefox:firefox.bzl", "define_firefox_repositories")
load("//browsers/private/versions:chromedriver.bzl", CHROMEDRIVER_DEFAULT_VERSION = "DEFAULT_VERSION")
load("//browsers/private/versions:chromium.bzl", CHROMIUM_DEFAULT_VERSION = "DEFAULT_VERSION")
load("//browsers/private/versions:firefox.bzl", FIREFOX_DEFAULT_VERSION = "DEFAULT_VERSION")

def _find_version_providing_modules(module_ctx):
    """Finds the modules eligible for providing versions.

    Finds the root and `rules_browsers` (i.e. this) modules on the module graph. Versions may only
    be specified by the root module. If the root module does not specify versions, we always fall
    back to the default versions used in this module.

    Args:
      module_ctx: The module context from the module_extension implementation.

    Returns:
      The modules to use for version lookup in order of precedence.
      Fails if this module (`rules_browsers`) cannot be found.
    """
    root = None
    this_module = None
    for mod in module_ctx.modules:
        if mod.is_root:
            root = mod
        if mod.name == "rules_browsers":
            this_module = mod
    if root == None:
        root = this_module
    if this_module == None:
        fail("could not find `rules_browsers` module")
    return [root, this_module]

def _get_single_version(candidate_modules, version_tag_name):
    """Retrieves the single version specified on a tag in the candidate modules.

    Checks all candidate modules for the specified tag in order. Returns the "version" attribute
    from the first matching module. Fails if a module provides the desired tag more than once.

    Args:
      candidate_modules: Modules that will be checked for the version_tag_name in order.
      version_tag_name: Name of the tag to find. The tag must have a `version` attribute.

    Returns:
      The version from the first candidate module providing the tag. None if no candidate module
      provides the tag.
    """
    for mod in candidate_modules:
        version_tag = getattr(mod.tags, version_tag_name)
        if len(version_tag) == 1:
            return version_tag[0].version
        elif len(version_tag) > 1:
            fail("module %s provided %d versions for %s, only one is allowed" % (mod.name, len(version_tag), version_tag_name))
    return None

def _browsers_impl(module_ctx):
    version_providing_modules = _find_version_providing_modules(module_ctx)

    chrome_version = _get_single_version(version_providing_modules, "chrome")
    if chrome_version:
        define_chrome_repositories(chrome_version)

    chromedriver_version = _get_single_version(version_providing_modules, "chromedriver")
    if chromedriver_version:
        define_chromedriver_repositories(chromedriver_version)

    firefox_version = _get_single_version(version_providing_modules, "firefox")
    if firefox_version:
        define_firefox_repositories(firefox_version)

browsers = module_extension(
    implementation = _browsers_impl,
    tag_classes = {
        "chrome": tag_class(attrs = {
            "version": attr.string(
                default = CHROMIUM_DEFAULT_VERSION,
            ),
        }),
        "chromedriver": tag_class(attrs = {
            "version": attr.string(
                default = CHROMEDRIVER_DEFAULT_VERSION,
            ),
        }),
        "firefox": tag_class(attrs = {
            "version": attr.string(
                default = FIREFOX_DEFAULT_VERSION,
            ),
        }),
    },
)
