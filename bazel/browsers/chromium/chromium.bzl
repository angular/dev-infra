load("//bazel/browsers:browser_archive_repo.bzl", "browser_archive")

"""
  Defines repositories for Chromium that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_chromium_repositories():
    # To update to a newer version of Chromium see instructions in
    # https://github.com/angular/dev-infra/blob/master/bazel/browsers/README.md.

    browser_archive(
        name = "org_chromium_chromium_linux_x64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "a1acae80108562f1f28020ed45d29daf3337d6e04912fa45e41ecb9f5199a736",
        # 99.0.4759.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/950435/chrome-linux.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/linux_x64/browser-bin.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-linux/chrome",
        },
        exclude_patterns = [
            # Exclude a log file that chromium writes to each run, causing remote cache misses.
            "chrome-linux/chrome_debug.log",
        ],
        exports_files = ["chrome-linux"],
    )

    browser_archive(
        name = "org_chromium_chromium_macos_x64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "8a97f0b00348ffdd090f65caa6c7e3fbadb65c8fdd6af2ca40bdf9d158c3468f",
        # 99.0.4759.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/950435/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/mac_x64/browser-bin.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        },
        exclude_patterns = [
            # Exclude a log file that chromium writes to each run, causing remote cache misses.
            "chrome-mac/Chromium.app/Contents/Frameworks/Chromium Framework.framework/Versions/*/chrome_debug.log",
        ],
        exports_files = ["chrome-mac"],
    )

    browser_archive(
        name = "org_chromium_chromium_macos_arm64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "c9d78a33285e0a9ab202ded7e3cef8d8db943489e223a98152e7c9a2aab740d6",
        # 99.0.4759.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/950435/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/mac_arm64/browser-bin.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        },
        exclude_patterns = [
            # Exclude a log file that chromium writes to each run, causing remote cache misses.
            "chrome-mac/Chromium.app/Contents/Frameworks/Chromium Framework.framework/Versions/*/chrome_debug.log",
        ],
        exports_files = ["chrome-mac"],
    )

    browser_archive(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "12a729dfa5b312d5c5e2570d26ca09568ebed245a4cc47c91ad7fa80e2546fcd",
        # 99.0.4759.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/950435/chrome-win.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/windows_x64/browser-bin.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-win/chrome.exe",
        },
        exclude_patterns = [
            # Exclude files with spaces to prevent errors when symlinked as runfiles (https://github.com/bazelbuild/bazel/issues/4327).
            "chrome-win/First Run",
            # Exclude a log file that chromium writes to each run, causing remote cache misses.
            "chrome-win/debug.log",
        ],
        exports_files = ["chrome-win"],
    )

    browser_archive(
        name = "org_chromium_chromedriver_linux_x64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "1ec8ee5d4e81332eedd1354e7e77e8a0edebdd41c1ccd5122335fc7a383b412c",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/950435/chromedriver_linux64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/linux_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_linux64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_x64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "3d399774601b14f76ed4535aa5af89f59495f5440273dff97a5f1057ce32bf3e",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/950435/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/mac_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_arm64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "78ac690dde71a1f8fe56faeb4102d406718f0bb1462933327b80eb545df3267d",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/950435/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/mac_arm64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "70086f730190cdbba7877a2d93d87cf65de2801e2521607fa59543ea5585426e",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/950435/chromedriver_win32.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/950435/windows_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_win32/chromedriver.exe",
        },
    )
