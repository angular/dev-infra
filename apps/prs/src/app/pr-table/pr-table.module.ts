import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PrTableComponent} from './pr-table.component.js';
import {MatTableModule} from '@angular/material/table';
import {ColumnsModule} from './columns/columns.module.js';

@NgModule({
  declarations: [PrTableComponent],
  exports: [PrTableComponent],
  imports: [CommonModule, MatTableModule, ColumnsModule],
})
export class PrTableModule {}
