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
        sha256 = "673ee08b4cfaff128ef0b4f7517acb6b6b25c9315fc6494ec328ab38aaf952d1",
        # 94.0.4578.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/902390/chrome-linux.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chrome-linux.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-linux/chrome",
        },
    )

    browser_archive(
        name = "org_chromium_chromium_macos_x64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "75f6bd26744368cd0fcbbec035766dea82e34def60e938fb48630be6799d46c7",
        # 94.0.4578.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/902390/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chrome-mac_x64.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        },
    )

    browser_archive(
        name = "org_chromium_chromium_macos_arm64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "4845ce895d030aeb8bfd877a599f1f07d8c7a77d1e08513e80e60bb0093fca24",
        # 94.0.4578.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/902390/chrome-mac.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chrome-mac_arm64.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        },
    )

    browser_archive(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "8919cd2f8a4676af4acc50d022b6a946a5b21a5fec4e078b0ebb0c8e18f1ce90",
        # 94.0.4578.0
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/902390/chrome-win.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chrome-win.zip",
        ],
        named_files = {
            "CHROMIUM": "chrome-win/chrome.exe",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_linux_x64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "1d2e73a19632031f5de876916e12b497d5b0e3dc83d1ce2fbe8665061adfd114",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/902390/chromedriver_linux64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chromedriver_linux64.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_linux64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_x64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "36cc50c5194767b043913534f6ec16a7d7a85636b319729a67ffff486b30a5f6",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac/902390/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chromedriver_mac_x64.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_arm64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "1f100aacf4bab4b3ac4218ecf654b17d66f2e07dd455f887bb3d9aa8d21862e1",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/902390/chromedriver_mac64.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chromedriver_mac_arm64.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "48392698f2ba338a0b9192f7c2154058a0b0b926aef0a5ef22aa6706b2bbc7b6",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Win/902390/chromedriver_win32.zip",
            "https://storage.googleapis.com/dev-infra-mirror/chromium/902390/chromedriver_win32.zip",
        ],
        named_files = {
            "CHROMEDRIVER": "chromedriver_win32/chromedriver.exe",
        },
    )
