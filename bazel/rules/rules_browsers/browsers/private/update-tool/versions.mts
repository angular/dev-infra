interface ChromeForTestingLatestVersionsPerMilestone {
  milestone: string;
  version: string;
  revision: string;
}

// The milestones in this response apply for all binaries supported by the
// Chrome for Testing project: chrome, chromedriver, chrome-headless-shell
interface ChromeForTestingLatestVersionsPerMilestoneResponse {
  timestamp: string;
  milestones: Record<string, ChromeForTestingLatestVersionsPerMilestone>;
}

export async function getChromeMilestones(maxMilestones: number): Promise<Array<string>> {
  const response = await fetch(
    'https://googlechromelabs.github.io/chrome-for-testing/latest-versions-per-milestone.json',
  );
  const responseJson =
    (await response.json()) as ChromeForTestingLatestVersionsPerMilestoneResponse;
  const milestones = Object.keys(responseJson.milestones);
  return [...milestones].slice(-maxMilestones);
}

interface FirefoxMajorReleasesResponse {
  [version: string]: string;
}

export async function getFirefoxMilestones(maxMilestones: number): Promise<Array<string>> {
  const response = await fetch(
    'https://product-details.mozilla.org/1.0/firefox_history_major_releases.json',
  );
  const responseJson = (await response.json()) as FirefoxMajorReleasesResponse;
  const milestones = Object.keys(responseJson);
  return [...milestones].slice(-maxMilestones).map((milestone) => 'stable_' + milestone);
}
