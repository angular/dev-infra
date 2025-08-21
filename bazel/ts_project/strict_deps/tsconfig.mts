/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {dirname} from 'path';

export function readTsConfig(filePath: string) {
  const configFile = ts.readConfigFile(filePath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.formatDiagnostics([configFile.error], ts.createCompilerHost({})));
  }

  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dirname(filePath));

  if (parsedConfig.errors.length > 0) {
    throw new Error(ts.formatDiagnostics(parsedConfig.errors, ts.createCompilerHost({})));
  }

  return parsedConfig;
}
