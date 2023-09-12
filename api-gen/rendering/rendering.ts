import {runfiles} from '@bazel/runfiles';
import {readFileSync} from 'fs';
import nunjucks from 'nunjucks';
import {DocRenderEntry} from './render-entities';

export function renderEntry(entry: DocRenderEntry): string {
  // TODO: get template based on type of entity
  // TODO: only read each template once per program invocation.
  const templatePath = runfiles.resolvePackageRelative('./templates/component-reference.njk');
  const template = readFileSync(templatePath, {encoding: 'utf8'});
  return nunjucks.renderString(template, entry);
}
