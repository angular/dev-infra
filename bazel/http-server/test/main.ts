/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference lib="dom" />

const spanEl = document.createElement('span');
const secretValue = (window as any)['GOOGLE_MAPS_API_KEY']!;

spanEl.innerHTML = `My key: ${secretValue}`;

document.body.appendChild(spanEl);
