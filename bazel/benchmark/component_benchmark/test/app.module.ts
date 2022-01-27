/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `<button (click)="updateText()">{{ text }}</button>`,
})
class AppComponent {
  text = 'Hello';

  updateText() {
    this.text = 'New';
  }
}

@NgModule({
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
