/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'base-component',
  templateUrl: './base.component.html',
})
export class BaseComponent {
  counterValue = 0;

  updateCounter() {
    this.counterValue++;
  }
}
