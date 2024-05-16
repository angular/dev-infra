import 'zone.js';
import 'zone.js/testing';

import {JSDOM} from 'jsdom';
import {Component} from '@angular/core';
import {fakeAsync, flush, TestBed, waitForAsync} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

describe('native async/await downleveled', () => {
  beforeAll(() => {
    const {window} = new JSDOM();

    (global as any).window = window;
    (global as any).document = window.document;
    (global as any).Node = window.Node;
    (global as any).MouseEvent = window.MouseEvent;

    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  it('should properly detect changes', fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
    });
    const fixture = TestBed.createComponent(AppComponent);
    const el = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
    el.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    // Flush the timeout macrotask from the click handler.
    // Then we attempt detecting changes.
    flush();
    fixture.detectChanges();

    expect(el.textContent).toBe('Yes');
  }));
});

@Component({
  selector: 'app-component',
  template: `<span>{{ triggered ? 'Yes' : 'No' }}</span>`,
  host: {
    '(click)': 'click()',
  },
})
class AppComponent {
  triggered = false;

  async click() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.triggered = true;
  }
}
