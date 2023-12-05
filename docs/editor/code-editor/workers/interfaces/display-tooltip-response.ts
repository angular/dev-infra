/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import typescript from 'typescript';

export interface DisplayTooltipResponse {
  displayParts: typescript.SymbolDisplayPart[] | null;
  tags: typescript.JSDocTagInfo[] | null;
  documentation: typescript.SymbolDisplayPart[] | null;
}
