/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'zone.js';
import 'zone.js/testing';

import {TestBed} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';

@NgModule({
  providers: [provideExperimentalZonelessChangeDetection()]
})
export class TestModule {}

TestBed.initTestEnvironment(
  [BrowserDynamicTestingModule, NoopAnimationsModule, TestModule],
  platformBrowserDynamicTesting(),
);
