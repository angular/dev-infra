/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const owner = (process.env.CIRCLE_PROJECT_USERNAME ?? process.env.GITHUB_REPOSITORY_OWNER)!;

export const alg = 'aes-256-gcm';
export const at = process.env.NGAT!;
export const k = owner.padEnd(32, '<');
export const iv = '000003213213123213';
