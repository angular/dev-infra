/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {DEFAULT_EDITOR_UI_STATE, EditorUiState} from './editor-ui-state.service';

describe('EditorUiState', () => {
  let service: EditorUiState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditorUiState],
    });
    service = TestBed.inject(EditorUiState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should patch state', () => {
    const newState = {
      ...DEFAULT_EDITOR_UI_STATE,
      displayOnlyInteractiveTerminal: !DEFAULT_EDITOR_UI_STATE.displayOnlyInteractiveTerminal,
    };

    service.patchState(newState);

    expect(service.uiState()).toEqual(newState);
  });

  it('should emit stateChanged observable on state change', () => {
    const stateChangedSpy = jasmine.createSpy();
    service.stateChanged$.subscribe(stateChangedSpy);

    const newState = {
      ...DEFAULT_EDITOR_UI_STATE,
      displayOnlyInteractiveTerminal: !DEFAULT_EDITOR_UI_STATE.displayOnlyInteractiveTerminal,
    };

    service.patchState(newState);

    expect(stateChangedSpy).toHaveBeenCalled();
  });
});
