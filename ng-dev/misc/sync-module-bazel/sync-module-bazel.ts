/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Log} from '../../utils/logging';

export interface PackageJson {
  engines?: {
    pnpm?: string;
    node?: string;
  };
  dependencies?: {
    typescript?: string;
  };
  devDependencies?: {
    typescript?: string;
  };
}

interface RepositoryInfo {
  filename: string;
  sha: string;
  type: string;
}

const REPOSITORY_TYPES: Record<string, string> = {
  'darwin-arm64.tar.gz': 'darwin_arm64',
  'darwin-x64.tar.gz': 'darwin_amd64',
  'linux-x64.tar.xz': 'linux_amd64',
  'linux-arm64.tar.xz': 'linux_arm64',
  'linux-s390x.tar.xz': 'linux_s390x',
  'win-x64.zip': 'windows_amd64',
  'linux-ppc64le.tar.xz': 'linux_ppc64le',
};

/** RegExp that matches the pnpm version assignment in MODULE.bazel. */
const PNPM_VERSION_REGEXP = /pnpm_version(?:_from)? = ".*?"/;
/** RegExp that matches the pnpm integrity assignment in MODULE.bazel. */
const PNPM_INTEGRITY_REGEXP = /pnpm_version_integrity = ".*?"/;
/** RegExp that matches the TypeScript version assignment in MODULE.bazel. */
const TS_VERSION_REGEXP = /ts_version(?:_from)? = ".*?"/;
/** RegExp that matches the TypeScript integrity assignment in MODULE.bazel. */
const TS_INTEGRITY_REGEXP = /ts_integrity = ".*?"/;
/** RegExp that matches the Node.js version assignment in MODULE.bazel. */
const NODE_VERSION_REGEXP = /node_version = "(.*?)"/;
/** RegExp that matches the Node.js version from nvmrc assignment in MODULE.bazel. */
const NODE_VERSION_FROM_NVMRC_REGEXP = /node_version_from_nvmrc = ".*?"/;
/** RegExp that matches the Node.js repositories assignment in MODULE.bazel. */
const NODE_REPOSITORIES_REGEXP = /node_repositories = \{[\s\S]*?\}/;

/** Fetches the integrity for a given package version from the npm registry. */
async function getNpmPackageIntegrity(pkg: string, version: string): Promise<string> {
  const response = await fetch(`https://registry.npmjs.org/${pkg}/${version}`);
  if (!response.ok) {
    throw new Error(`Failed to request ${pkg}@${version}: ${response.statusText}`);
  }

  const {dist} = (await response.json()) as {dist: {integrity: string}};

  return dist.integrity;
}

/** Fetches the repository information for a given Node.js version. */
async function getNodeJsRepositories(version: string): Promise<RepositoryInfo[]> {
  const response = await fetch(`https://nodejs.org/dist/v${version}/SHASUMS256.txt`);
  if (!response.ok) {
    throw new Error(`Failed to get SHASUMS for Node.js v${version}: ${response.statusText}`);
  }
  const text = await response.text();

  return text
    .split('\n')
    .filter(Boolean)
    .map((line: string): RepositoryInfo | undefined => {
      const [sha, filename] = line.trim().split(/\s+/);
      if (!filename) return undefined;

      const fileTypeSuffix = filename.replace(/^node-v[\d.]+-/, '');
      const type = REPOSITORY_TYPES[fileTypeSuffix];

      return type ? {filename, sha, type} : undefined;
    })
    .filter((repo): repo is RepositoryInfo => repo !== undefined);
}

/** Updates the version and integrity in the MODULE.bazel content for PNPM/TS. */
function updateVersionAndIntegrity(
  content: string,
  version: string,
  integrity: string,
  versionRegExp: RegExp,
  integrityRegExp: RegExp,
  versionKey: string,
  integrityKey: string,
): string {
  const newVal = `${versionKey} = "${version}"`;
  const result = content.replace(versionRegExp, newVal);

  return integrityRegExp.test(result)
    ? result.replace(integrityRegExp, `${integrityKey} = "${integrity}"`)
    : result.replace(newVal, `${newVal},\n    ${integrityKey} = "${integrity}"`);
}

/**
 * Processes a `node.toolchain` block args string and updates it with
 * the correct versions and repositories.
 */
async function processNodeToolchainArgs(
  args: string,
  nvmrcVersion: string | undefined,
): Promise<string> {
  const versionMatch = args.match(NODE_VERSION_REGEXP);
  let effectiveVersion = versionMatch?.[1];

  if (effectiveVersion === nvmrcVersion) {
    return args;
  }

  if (effectiveVersion) {
    args = args.replace(NODE_VERSION_REGEXP, `node_version = "${nvmrcVersion}"`);
    effectiveVersion = nvmrcVersion;
  } else if (NODE_VERSION_FROM_NVMRC_REGEXP.test(args)) {
    if (!nvmrcVersion) {
      throw new Error('node_version_from_nvmrc used but .nvmrc not found');
    }

    effectiveVersion = nvmrcVersion;
    // TODO(alanagius): This is needed as currently 'node_version_from_nvmrc' is buggy with 'node_repositories'.
    // This should be addressed in version of rules_nodejs > 6.6.2
    args = args.replace(NODE_VERSION_FROM_NVMRC_REGEXP, `node_version = "${nvmrcVersion}"`);
  }

  if (!effectiveVersion) {
    return args;
  }

  Log.info(`Resolving Node.js repositories for v${effectiveVersion}...`);
  const repositories = await getNodeJsRepositories(effectiveVersion);
  const lines = repositories.map(({filename, sha, type}) => {
    const strippedFilename = filename.replace(/(\.tar)?\.[^.]+$/, '');

    return `        "${effectiveVersion}-${type}": ("${filename}", "${strippedFilename}", "${sha}"),`;
  });

  const reposDict = `{\n${lines.join('\n')}\n    }`;

  if (NODE_REPOSITORIES_REGEXP.test(args)) {
    return args.replace(NODE_REPOSITORIES_REGEXP, `node_repositories = ${reposDict}`);
  }

  const separator = args.trim().endsWith(',') ? '' : ',';
  return `${args.trim()}${separator}\n    node_repositories = ${reposDict}\n`;
}

/** Synchronizes the PNPM version and integrity in MODULE.bazel. */
export async function syncPnpm(content: string, version: string): Promise<string> {
  if (!PNPM_VERSION_REGEXP.test(content)) {
    return content;
  }

  Log.info(`Resolving integrity for pnpm@${version}...`);
  const pnpmIntegrity = await getNpmPackageIntegrity('pnpm', version);

  return updateVersionAndIntegrity(
    content,
    version,
    pnpmIntegrity,
    PNPM_VERSION_REGEXP,
    PNPM_INTEGRITY_REGEXP,
    'pnpm_version',
    'pnpm_version_integrity',
  );
}

/** Synchronizes the TypeScript version and integrity in MODULE.bazel. */
export async function syncTypeScript(content: string, version: string): Promise<string> {
  if (!TS_VERSION_REGEXP.test(content)) {
    return content;
  }

  Log.info(`Resolving integrity for typescript@${version}...`);
  const tsIntegrity = await getNpmPackageIntegrity('typescript', version);

  return updateVersionAndIntegrity(
    content,
    version,
    tsIntegrity,
    TS_VERSION_REGEXP,
    TS_INTEGRITY_REGEXP,
    'ts_version',
    'ts_integrity',
  );
}

/** Finds the index of the closing parenthesis for a balanced block. */
function findClosedParenIndex(content: string, startIndex: number): number {
  let balance = 1;

  for (let i = startIndex + 1; i < content.length; i++) {
    if (content[i] === '(') {
      balance++;
    } else if (content[i] === ')') {
      balance--;
    }

    if (balance === 0) {
      return i;
    }
  }

  return -1;
}

/** Synchronizes the Node.js toolchain versions and repositories in MODULE.bazel. */
export async function syncNodeJs(
  content: string,
  nvmrcVersion: string | undefined,
): Promise<string> {
  const parts: string[] = [];
  let lastIndex = 0;
  let startIndex = 0;

  while ((startIndex = content.indexOf('node.toolchain(', startIndex)) !== -1) {
    const openParenIndex = startIndex + 'node.toolchain('.length - 1;
    const endIndex = findClosedParenIndex(content, openParenIndex);

    if (endIndex === -1) {
      break;
    }

    parts.push(content.slice(lastIndex, startIndex));

    const args = content.slice(openParenIndex + 1, endIndex);
    const updatedArgs = await processNodeToolchainArgs(args, nvmrcVersion);
    parts.push(`node.toolchain(${updatedArgs})`);

    lastIndex = endIndex + 1;
    startIndex = lastIndex;
  }

  parts.push(content.slice(lastIndex));

  return parts.join('');
}
