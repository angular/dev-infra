#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
import {tsCircularDependenciesBuilder} from './ts-circular-dependencies/index';
import {buildPullapproveParser} from './pullapprove/cli';
import {buildCommitMessageParser} from './commit-message/cli';
import {buildFormatParser} from './format/cli';
import {buildReleaseParser} from './release/cli';
import {buildPrParser} from './pr/cli';
import {captureLogOutputForCommand} from './utils/console';
import {buildCaretakerParser} from './caretaker/cli';
import {buildNgbotParser} from './ngbot/cli';

yargs.scriptName('ng-dev')
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
    .command('ngbot <command>', false, buildNgbotParser)
    .wrap(120)
    .strict()
    .parse();
