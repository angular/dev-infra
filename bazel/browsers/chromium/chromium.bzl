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
        sha256 = "e45b0439b7f69e0e885d6cae9535a9f1e5f0c206fd619044288e9a53e8a004c7",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1263141/chrome-linux.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/linux_x64/browser-bin.zip",
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
        sha256 = "c18ba7a79fda6bc82229fd9ff685ff0d7b41ab32845b7fb989daecd8a2b10a00",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1263141/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/mac_x64/browser-bin.zip",
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
        sha256 = "2debe4e82002cd898a7573a1e132fafd2cb21a5af70c811fda50ebe9abe37d08",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1263141/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/mac_arm64/browser-bin.zip",
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
        sha256 = "05f0d21f822531ab05e1daa33fb7bf1fcec51a2b6103a3f8b2b3edf3a3cd0ce0",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/1263141/chrome-win.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/windows_x64/browser-bin.zip",
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
        sha256 = "3bd1ed0fee4153ab78eb61109c73657a965f6eabbbba8d0895626967b068beaa",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1263141/chromedriver_linux64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/linux_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_linux64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_x64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "1a08bdfb06bd395caafbbb5fe9be982edf5c3c5d07e8082b06f0cf416389a5af",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1263141/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/mac_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_arm64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "0548bc04cd7d3a9016002034bc30b1df18283612fe99bb7cf1811a60258d60a0",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1263141/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/mac_arm64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "fe9dd78b5257a804bb46d81225af84da6eaa5308ce7a69a4b96d31fb31e2c834",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/1263141/chromedriver_win32.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1263141/windows_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_win32/chromedriver.exe",
        },
    )
