import {runfiles} from '@bazel/runfiles';
import {readFileSync} from 'fs';
import nunjucks from 'nunjucks';
import {join} from 'path';

/**
 * Custom nunjucks loader that resolves against bazel runfiles.
 * This is necessary for references to files inside nunjucks templates.
 */
export class NunjucksRunfilesLoader extends nunjucks.FileSystemLoader {
  override getSource(name: string) {
    const runfilesPath = runfiles.resolvePackageRelative(join('templates', name));
    return {
      src: readFileSync(runfilesPath, {encoding: 'utf8'}),
      path: runfilesPath,
      noCache: false,
    };
  }
}
