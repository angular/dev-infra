#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {runParserWithCompletedFunctions} from './utils/yargs.js';

import {buildCaretakerParser} from './caretaker/cli.js';
import {buildCommitMessageParser} from './commit-message/cli.js';
import {buildFormatParser} from './format/cli.js';
import {buildMiscParser} from './misc/cli.js';
import {buildNgbotParser} from './ngbot/cli.js';
import {buildPrParser} from './pr/cli.js';
import {buildPullapproveParser} from './pullapprove/cli.js';
import {buildReleaseParser} from './release/cli.js';
import {tsCircularDependenciesBuilder} from './ts-circular-dependencies/index.js';
import {captureLogOutputForCommand} from './utils/logging.js';
import {ngDevVersionMiddleware} from './utils/version-check.js';
import {buildAuthParser} from './auth/cli.js';
import {buildPerfParser} from './perf/cli.js';
import {buildConfigParser} from './config/cli.js';
import {buildAiParser} from './ai/cli.js';
import {Argv} from 'yargs';

runParserWithCompletedFunctions((yargs: Argv) => {
  process.exitCode = 0;
  return yargs
    .scriptName('ng-dev')
    .middleware([captureLogOutputForCommand, ngDevVersionMiddleware], true)
    .demandCommand()
    .recommendCommands()
    .command('auth <command>', false, buildAuthParser)
    .command('commit-message <command>', '', buildCommitMessageParser)
    .command('format <command>', '', buildFormatParser)
    .command('pr <command>', '', buildPrParser)
    .command('pullapprove <command>', '', buildPullapproveParser)
    .command('release', '', buildReleaseParser)
    .command('ts-circular-deps <command>', '', tsCircularDependenciesBuilder)
    .command('caretaker <command>', '', buildCaretakerParser)
    .command('misc <command>', '', buildMiscParser)
    .command('ngbot <command>', false, buildNgbotParser)
    .command('perf <command>', '', buildPerfParser)
    .command('ai <command>', '', buildAiParser)
    .command('config <command>', false, buildConfigParser)
    .wrap(120)
    .strict();
});
