/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {ErrorType} from '../services/node-runtime-state.service';
import {PreviewError} from './preview-error.component';

describe('PreviewError', () => {
  let fixture: ComponentFixture<PreviewError>;
  let component: PreviewError;

  function mockError({type, message}: {type: ErrorType; message?: string}) {
    spyOn(component, 'error').and.returnValue({
      message,
      type,
    });
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewError);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the error message for iOS', () => {
    // @ts-expect-error - readonly property
    component['isIos'] = true;
    mockError({type: ErrorType.UNSUPPORTED_BROWSER_ENVIRONMENT});

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Open angular.dev on desktop to code in your browser',
    );
  });

  it('should display the error message for Firefox', () => {
    // @ts-expect-error - readonly property
    component['isFirefox'] = true;
    mockError({type: ErrorType.UNSUPPORTED_BROWSER_ENVIRONMENT});

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Firefox');
  });

  it('should display the error message for disabled cookies', () => {
    mockError({type: ErrorType.COOKIES});

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('cookies');
  });

  it('should display out of memory error', () => {
    mockError({type: ErrorType.OUT_OF_MEMORY});

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('out of memory');
  });

  it('should display the error message', () => {
    const message = 'test error message';
    mockError({type: ErrorType.UNKNOWN, message});

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(message);
  });

  it('should not display the error message if not defined', () => {
    mockError({type: ErrorType.UNKNOWN});

    fixture.detectChanges();

    const smallElement = fixture.debugElement.query(By.css('small'));
    const codeElement = fixture.debugElement.query(By.css('small > code'));

    expect(smallElement).toBeNull();
    expect(codeElement).toBeNull();
  });
});
