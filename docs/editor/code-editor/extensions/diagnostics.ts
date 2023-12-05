/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Diagnostic, linter} from '@codemirror/lint';
import {TsVfsWorkerActions} from '../workers/enums/actions.js';
import {Signal} from '@angular/core';
import {EditorFile} from '../interfaces/editor-file.js';
import {ActionMessage} from '../workers/interfaces/message.js';
import {DiagnosticsRequest} from '../workers/interfaces/diagnostics-request.js';
import {Subject, filter, take} from 'rxjs';
import {DiagnosticWithLocation, DiagnosticsState} from '../services/diagnostics-state.service.js';

// Factory method for diagnostics extension.
export const getDiagnosticsExtension = (
  eventManager: Subject<ActionMessage>,
  currentFile: Signal<EditorFile>,
  sendRequestToTsVfs: (request: ActionMessage<DiagnosticsRequest>) => void,
  diagnosticsState: DiagnosticsState,
) => {
  return linter(
    async (view): Promise<Diagnostic[]> => {
      sendRequestToTsVfs({
        action: TsVfsWorkerActions.DIAGNOSTICS_REQUEST,
        data: {
          file: currentFile().filename,
        },
      });

      const diagnostics = await new Promise((resolve) => {
        eventManager
          .pipe(
            filter((event) => event.action === TsVfsWorkerActions.DIAGNOSTICS_RESPONSE),
            take(1),
          )
          .subscribe((response: ActionMessage<Diagnostic[]>) => {
            resolve(response.data);
          });
      });

      const result = !!diagnostics ? (diagnostics as DiagnosticWithLocation[]) : [];

      diagnosticsState.setDiagnostics(result);

      return result;
    },
    {
      delay: 400,
    },
  );
};
