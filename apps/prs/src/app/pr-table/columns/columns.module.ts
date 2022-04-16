import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MatTableModule} from '@angular/material/table';
import {SummaryColumn} from './summary/summary.component';

@NgModule({
  declarations: [SummaryColumn],
  imports: [CommonModule, MatTableModule],
})
export class ColumnsModule {}
