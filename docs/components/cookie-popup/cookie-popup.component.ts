/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NgIf} from '@angular/common';
import {LOCAL_STORAGE} from '../../providers/index';

/**
 * Decelare gtag as part of the window in this file as gtag is expected to already be loaded.
 */
declare const window: Window & typeof globalThis & {gtag?: Function};

export const STORAGE_KEY = 'docs-accepts-cookies';
export function setCookieConsent(state: 'denied' | 'granted'): void {
  try {
    if (window.gtag) {
      const consentOptions = {
        ad_user_data: state,
        ad_personalization: state,
        ad_storage: state,
        analytics_storage: state,
      };

      if (state === 'denied') {
        window.gtag('consent', 'default', {
          ...consentOptions,
          wait_for_update: 500,
        });
      } else if (state === 'granted') {
        window.gtag('consent', 'update', {
          ...consentOptions,
        });
      }
    }
  } catch {
    if (state === 'denied') {
      console.error('Unable to set default cookie consent.');
    } else if (state === 'granted') {
      console.error('Unable to grant cookie consent.');
    }
  }
}

@Component({
  selector: 'docs-cookie-popup',
  standalone: true,
  imports: [NgIf],
  templateUrl: './cookie-popup.component.html',
  styleUrls: ['./cookie-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiePopup {
  private readonly localStorage = inject(LOCAL_STORAGE);

  /** Whether the user has accepted the cookie disclaimer. */
  hasAccepted = signal<boolean>(false);

  constructor() {
    // Needs to be in a try/catch, because some browsers will
    // throw when using `localStorage` in private mode.
    try {
      this.hasAccepted.set(this.localStorage?.getItem(STORAGE_KEY) === 'true');
    } catch {
      this.hasAccepted.set(false);
    }
  }

  /** Accepts the cookie disclaimer. */
  protected accept(): void {
    try {
      this.localStorage?.setItem(STORAGE_KEY, 'true');
    } catch {}

    this.hasAccepted.set(true);

    // Enable Google Analytics consent properties
    setCookieConsent('granted');
  }
}
