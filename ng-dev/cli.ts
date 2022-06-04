#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import yargs from 'yargs';

import {buildCaretakerParser} from './caretaker/cli';
import {buildCiParser} from './ci/cli';
import {buildCommitMessageParser} from './commit-message/cli';
import {buildFormatParser} from './format/cli';
import {buildMiscParser} from './misc/cli';
import {buildNgbotParser} from './ngbot/cli';
import {buildPrParser} from './pr/cli';
import {buildPullapproveParser} from './pullapprove/cli';
import {buildReleaseParser} from './release/cli';
import {tsCircularDependenciesBuilder} from './ts-circular-dependencies/index';
import {captureLogOutputForCommand} from './utils/logging';

yargs(process.argv.slice(2))
  .scriptName('ng-dev')
  .middleware(captureLogOutputForCommand)
  .demandCommand()
  .recommendCommands()
  .command('commit-message <command>', '', buildCommitMessageParser)
  .command('format <command>', '', buildFormatParser)
  .command('pr <command>', '', buildPrParser)
  .command('pullapprove <command>', '', buildPullapproveParser)
  .command('release <command>', '', buildReleaseParser)
  .command('ts-circular-deps <command>', '', tsCircularDependenciesBuilder)
  .command('caretaker <command>', '', buildCaretakerParser)
  .command('misc <command>', '', buildMiscParser)
  .command('ngbot <command>', false, buildNgbotParser)
  .command('ci <command>', false, buildCiParser)
  .wrap(120)
  .strict()
  .parse();
