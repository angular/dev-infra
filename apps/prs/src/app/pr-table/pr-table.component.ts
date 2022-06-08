import {CdkColumnDef} from '@angular/cdk/table';
import {Component, Injector, AfterViewInit, ViewChild, ViewContainerRef, Type} from '@angular/core';
import {
  MatColumnDef,
  MatHeaderRowDef,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {PullRequest} from '../../models/pull-request.js';
import {BaseColumn} from './columns/base.js';
import {SummaryColumn} from './columns/summary/summary.component.js';
import {StatusColumn} from './columns/status/status.component.js';
import {TargetColumn} from './columns/target/target.component.js';

@Component({
  selector: 'pr-table',
  templateUrl: './pr-table.component.html',
  styleUrls: ['./pr-table.component.scss'],
})
export class PrTableComponent implements AfterViewInit {
  /** The columns used in the PR table. */
  columns: Type<BaseColumn>[] = [SummaryColumn, StatusColumn, TargetColumn];
  /** Data source for the table providing the list of pull requests/ */
  dataSource: MatTableDataSource<PullRequest> = new MatTableDataSource();
  /** The table. */
  @ViewChild(MatTable, {static: true}) table!: MatTable<PullRequest>;
  /** The row definintion. */
  @ViewChild(MatRowDef, {static: true}) tableRow!: MatRowDef<PullRequest>;
  /** The header row definition. */
  @ViewChild(MatHeaderRowDef, {static: true}) tableHeaderRow!: MatHeaderRowDef;

  constructor(private injector: Injector, private vcr: ViewContainerRef) {}

  ngAfterViewInit(): void {
    const columns = this.columns.map((column) => {
      /** The column definition for the generated column. */
      const columnDef = new MatColumnDef();
      /**
       * The injector to provide to the BaseColumn derived class, allowing it to be provided to the
       * cell definitions in the template.
       */
      const injector = Injector.create({
        providers: [{provide: CdkColumnDef, useValue: columnDef}],
        parent: this.injector,
      });
      // The name, cell and headerCell are obtained from the generated component and set on the
      // generated column definition.
      const {name, cell, headerCell} = this.vcr.createComponent(column, {injector}).instance;
      columnDef.name = name;
      columnDef.cell = cell;
      columnDef.headerCell = headerCell;
      this.table.addColumnDef(columnDef);
      return name;
    });
    // Set the columns for the rows in the table.
    this.tableRow.columns = columns;
    this.tableHeaderRow.columns = columns;
  }
}
