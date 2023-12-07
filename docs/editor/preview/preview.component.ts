/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {delay, filter, map} from 'rxjs';

import {LoadingStep} from '../services/node-runtime-sandbox.service';
import {NodeRuntimeSandbox} from '../services/node-runtime-sandbox.service';
import {NodeRuntimeState} from '../services/node-runtime-state.service';

// TODO(josephperrott): Determine how we can load the preview error component dynamically again.
import {PreviewError} from './preview-error.component';

type PreviewUrlEmittedValue = {
  url: string | null;
  previewIframe: ElementRef<HTMLIFrameElement>;
};

@Component({
  standalone: true,
  selector: 'docs-tutorial-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIf, NgSwitch, NgSwitchCase],
})
export class Preview implements AfterViewInit {
  @ViewChild('preview') previewIframe: ElementRef<HTMLIFrameElement> | undefined;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly nodeRuntimeSandbox = inject(NodeRuntimeSandbox);
  private readonly nodeRuntimeState = inject(NodeRuntimeState);

  loadingProgressValue = this.nodeRuntimeState.loadingStep;
  loadingEnum = LoadingStep;

  previewErrorComponent: typeof PreviewError | undefined;

  constructor() {
    effect(async () => {
      if (this.nodeRuntimeState.loadingStep() === LoadingStep.ERROR) {
        this.previewErrorComponent = PreviewError;

        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngAfterViewInit() {
    this.nodeRuntimeSandbox.previewUrl$
      .pipe(
        map((url) => ({url, previewIframe: this.previewIframe})),
        filter((value): value is PreviewUrlEmittedValue => !!value.previewIframe),
        // Note: The delay is being used here to workaround the flickering issue
        // while switching tutorials
        delay(100),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({url, previewIframe}) => {
        // Known issue - Binding to the src of an iframe causes the iframe to flicker: https://github.com/angular/angular/issues/16994
        previewIframe.nativeElement.src = url ?? '';
      });
  }
}
