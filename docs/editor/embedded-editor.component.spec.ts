/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {CodeEditor} from './code-editor/code-editor.component';
import {EmbeddedEditor} from './embedded-editor.component';
import {NodeRuntimeSandbox} from './services/node-runtime-sandbox.service';
import {Preview} from './preview/preview.component';
import {TerminalType} from './services/terminal-handler.service';
import {Terminal} from './terminal/terminal.component';

@Component({
  selector: 'docs-tutorial-terminal',
  template: '<div>FakeTerminal</div>',
  standalone: true,
})
class FakeTerminal {
  @Input({required: true}) type!: TerminalType;
}

@Component({
  selector: 'docs-tutorial-code-editor',
  template: '<div>FakeCodeEditor</div>',
  standalone: true,
})
class FakeCodeEditor {}

@Component({
  selector: 'docs-tutorial-preview',
  template: '<div>FakePreview</div>',
  standalone: true,
})
class FakePreview {}

describe('EmbeddedEditor', () => {
  let component: EmbeddedEditor;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        {
          provide: NodeRuntimeSandbox,
          useValue: {},
        },
      ],
    }).compileComponents();

    TestBed.overrideComponent(EmbeddedEditor, {
      remove: {
        imports: [Terminal, CodeEditor, Preview],
      },
      add: {
        imports: [FakeTerminal, FakeCodeEditor, FakePreview],
      },
    });
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(EmbeddedEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize resize observer on init', () => {
    component.ngAfterViewInit();

    expect(component['resizeObserver'] instanceof ResizeObserver).toBeTruthy();
  });

  it('should disconnect resize observer on destroy', () => {
    const disconnectSpy = spyOn(component['resizeObserver'] as ResizeObserver, 'disconnect');

    component.ngOnDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
