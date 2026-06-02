/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, input} from '@angular/core';
import {fine, FineType} from './other_file';

@Component({
  selector: 'my-comp',
  template: '<div></div>',
})
export class MyComponent {
  name = input.required<string>();
  isFine: FineType = fine;
}
