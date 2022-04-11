import {Directive, ViewChild} from '@angular/core';
import {MatCellDef, MatHeaderCellDef} from '@angular/material/table';

// A Directive is used to satisfy the Angular compiler which wants a decorated class
// even though its abstract.
@Directive()
export abstract class BaseColumn {
  /** The cell definintion for a row. */
  @ViewChild(MatCellDef, {static: true}) cell!: MatCellDef;
  /** The header cell definintion for a row. */
  @ViewChild(MatHeaderCellDef, {static: true}) headerCell!: MatHeaderCellDef;
  /** The name of the column.  */
  abstract name: string;
}
