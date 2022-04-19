import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MatTableModule} from '@angular/material/table';
import {SummaryColumn} from './summary/summary.component';
import {TargetColumn} from './target/target.component';
import {StatusColumn} from './status/status.component';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [SummaryColumn, TargetColumn, StatusColumn],
  imports: [CommonModule, MatTableModule, MatIconModule],
})
export class ColumnsModule {}
