/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';

import {debounceTime} from 'rxjs/operators';
import {TerminalHandler, TerminalType} from '../services/terminal-handler.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WINDOW} from '../../providers/index';
import {NgIf} from '@angular/common';
import {fromEvent} from 'rxjs';

@Component({
  selector: 'docs-tutorial-terminal',
  standalone: true,
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf],
  // ViewEncapsulation is disabled to allow Xterm.js's styles to be applied
  // to the terminal element.
  encapsulation: ViewEncapsulation.None,
})
export class Terminal implements AfterViewInit {
  @Input({required: true}) type!: TerminalType;
  @ViewChild('terminalOutput') private terminalElementRef!: ElementRef<HTMLElement>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly terminalHandler = inject(TerminalHandler);
  private readonly window = inject(WINDOW);

  ngAfterViewInit() {
    this.terminalHandler.registerTerminal(this.type, this.terminalElementRef.nativeElement);

    fromEvent(this.window, 'resize')
      .pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.handleResize();
      });
  }

  private handleResize(): void {
    this.terminalHandler.resizeToFitParent(this.type);
  }
}
