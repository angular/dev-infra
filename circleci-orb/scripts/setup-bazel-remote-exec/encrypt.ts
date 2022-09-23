/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createCipheriv} from 'crypto';
import {k, iv, alg} from './constants';
import fs from 'fs';

const [inputPath, outputPath] = process.argv.slice(2);
const input = fs.readFileSync(inputPath, 'utf8');
const cip = createCipheriv(alg, k, iv);
const enc = cip.update(input, 'utf8', 'binary') + cip.final('binary');

fs.writeFileSync(outputPath, enc, 'binary');

console.info('Auth tag:', cip.getAuthTag().toString('base64'));
