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
        sha256 = "4e89a56b61db2fe494d4072d551b24e81833608318c5ba347b5d16a19687674e",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1121551/chrome-linux.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/linux_x64/browser-bin.zip",
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
        sha256 = "c03e32f338dffee3404881b4950563d26812d0246c1372ad2f4800547382bb91",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1121551/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/mac_x64/browser-bin.zip",
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
        sha256 = "4eb94b113fc995d20fafeca366b4b0cddf172ac1b2cdedc053464b764b74d1c0",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1121551/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/mac_arm64/browser-bin.zip",
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
        sha256 = "fdc221bb1e898ab851c4a5bc50ca1f88a5b388acb5510df4c4606c87d8be0230",
        # 114.0.5673.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/1121551/chrome-win.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/windows_x64/browser-bin.zip",
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
        sha256 = "8b9823d07706db02d0f83189c7d658fff14796ccb07f3eac3b327f3f0230f6c7",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1121551/chromedriver_linux64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/linux_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_linux64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_x64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "1c66bd01e53ee406f9f30d5f9ccbf4ea0f9c0f1b959c6ace9758cf0d35a6e4b3",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/1121551/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/mac_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_arm64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "7eba8dd97537ca787628ae11346e5c897473c0c0871df0fc4a313bd4a48a83dc",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1121551/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/mac_arm64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "db94b7f35041e3a76fa9a50808f196e61c27f43762df99526c1876244a196526",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/1121551/chromedriver_win32.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/1121551/windows_x64/driver-bin.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_win32/chromedriver.exe",
        },
    )
