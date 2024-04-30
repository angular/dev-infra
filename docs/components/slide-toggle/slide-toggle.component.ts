/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Input, forwardRef, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'docs-slide-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlideToggle),
      multi: true,
    },
  ],
})
export class SlideToggle implements ControlValueAccessor {
  @Input({required: true}) buttonId!: string;
  @Input({required: true}) label!: string;
  @Input() disabled = false;

  // Implemented as part of ControlValueAccessor.
  private onChange: (value: boolean) => void = (_: boolean) => {};
  private onTouched: () => void = () => {};

  protected readonly checked = signal(false);

  // Implemented as part of ControlValueAccessor.
  writeValue(value: boolean): void {
    this.checked.set(value);
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Toggles the checked state of the slide-toggle.
  toggle(): void {
    if (this.disabled) {
      return;
    }

    this.checked.update((checked) => !checked);
    this.onChange(this.checked());
    this.onTouched();
  }
}
