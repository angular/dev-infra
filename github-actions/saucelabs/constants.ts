/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const alg = 'aes-256-gcm';
export const at = process.env.NGAT!;
export const k = process.env.SAUCELABS_TOKEN_KEY!;
export const iv = '000003213213123213';
