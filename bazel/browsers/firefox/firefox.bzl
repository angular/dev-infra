load("//bazel/browsers:browser_archive_repo.bzl", "browser_archive")

"""
  Defines repositories for Firefox that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_firefox_repositories():
    # Instructions on updating the Firefox version can be found in the `README.md` file
    # next to this file.

    browser_archive(
        name = "org_mozilla_firefox_linux_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "3d0f74790fe6ff5e38324222ab0c47e10edb31970ed67c6dd7a1c84e7017d1a5",
        # Firefox v97.0
        urls = [
            "https://storage.googleapis.com/dev-infra-mirror/firefox/97.0/linux_x64/browser-bin.tar.bz2",
        ],
        named_files = {
            "FIREFOX": "firefox/firefox",
        },
    )

    browser_archive(
        # Firefox has a launcher that conditionally starts x64/arm64
        name = "org_mozilla_firefox_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "c06c4e58179acaf55d05c3be41d0d4cdd68f811a75322a39557d91121aa2ef74",
        # Firefox v97.0
        urls = [
            "https://storage.googleapis.com/dev-infra-mirror/firefox/97.0/mac_x64/browser-bin.dmg",
        ],
        named_files = {
            "FIREFOX": "Firefox.app/Contents/MacOS/firefox",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_linux_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "12c37f41d11ed982b7be43d02411ff2c75fb7a484e46966d000b47d1665baa88",
        # Geckodriver v0.30.0
        urls = [
            "https://storage.googleapis.com/dev-infra-mirror/firefox/97.0/linux_x64/driver-bin.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "560ba192666c1fe8796404153cfdf2d12551515601c4b3937aabcba6ee300f8c",
        # Geckodriver v0.30.0
        urls = [
            "https://storage.googleapis.com/dev-infra-mirror/firefox/97.0/mac_x64/driver-bin.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_arm64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "895bc2146edaea434d57a3b5d9a141be5cb3c5f8e8804916bd4869978ddfd4db",
        # Geckodriver v0.30.0
        urls = [
            "https://storage.googleapis.com/dev-infra-mirror/firefox/97.0/mac_arm64/driver-bin.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )
