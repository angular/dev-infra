/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';

import {LOCAL_STORAGE, WINDOW} from '../../providers';

import {
  AlertManager,
  AlertReason,
  MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES,
} from './alert-manager.service';

type FakeLocalStorageType = Pick<WindowLocalStorage['localStorage'], 'setItem' | 'getItem'>;

describe('AlertManager', () => {
  let service: AlertManager;

  let localStorageMap: Map<string, string>;

  const fakeLocalStorage: FakeLocalStorageType = {
    setItem: (key: string, value: string) => localStorageMap.set(key, value),
    getItem: (key: string) => localStorageMap.get(key) || null,
  };

  beforeEach(() => {
    localStorageMap = new Map();

    // fake map to store event listeners
    const eventListeners: Map<string, () => {}> = new Map();

    TestBed.configureTestingModule({
      providers: [
        AlertManager,
        {provide: MatSnackBar, useValue: {}},
        {
          provide: WINDOW,
          useValue: {
            addEventListener: (event: string, callback: () => {}) => {
              eventListeners.set(event, callback);
            },
            dispatchEvent: (event: Event) => {
              eventListeners.get(event.type)?.();
            },
          },
        },
        {
          provide: LOCAL_STORAGE,
          useValue: fakeLocalStorage,
        },
        {
          provide: MatSnackBar,
          useValue: {
            openFromComponent: () => {},
          },
        },
      ],
    });

    service = TestBed.inject(AlertManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should increase the instances counter when initialized', () => {
    expect(service['getStoredCountOfWebcontainerInstances']()).toBe(0);

    service.init();

    expect(service['getStoredCountOfWebcontainerInstances']()).toBe(1);
  });

  it('should decrease the instances counter on page close', () => {
    service.init();
    expect(service['getStoredCountOfWebcontainerInstances']()).toBe(1);

    service['window'].dispatchEvent(new Event('beforeunload'));

    expect(service['getStoredCountOfWebcontainerInstances']()).toBe(0);
  });

  it('should open a snackbar when the number of instances reaches the maximum recommended', () => {
    spyOn(service as any, 'getStoredCountOfWebcontainerInstances').and.returnValue(
      MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES,
    );

    const openSnackBar = spyOn(service as any, 'openSnackBar');

    service.init();

    expect(openSnackBar).toHaveBeenCalledWith(AlertReason.OUT_OF_MEMORY);
  });

  it('should open a snackbar when running on a mobile device', () => {
    spyOn(service as any, 'isMobile').and.returnValue(true);

    const openSnackBar = spyOn(service as any, 'openSnackBar');

    service.init();

    expect(openSnackBar).toHaveBeenCalledWith(AlertReason.MOBILE);
  });
});
