/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'zone.js/dist/zone';

import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

// @ts-ignore This file will be provided by the consumer.
import {AppModule} from './app.module';

enableProdMode();
platformBrowser().bootstrapModule(AppModule);
