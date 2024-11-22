/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Spanner} from '@google-cloud/spanner';

export interface WorkflowPerformanceRowResult {
  commit_sha: string;
  value: number;
  name: string;
}

export async function addWorkflowPerformanceResult(result: WorkflowPerformanceRowResult) {
  const spanner = new Spanner({
    projectId: 'internal-200822',
  });

  const instance = spanner.instance('ng-measurables');
  const database = instance.database('commit_performance');
  const workflowPerformanceTable = database.table('WorkflowPerformance');

  try {
    await workflowPerformanceTable.insert([result]);
  } finally {
    await database.close();
  }
}
