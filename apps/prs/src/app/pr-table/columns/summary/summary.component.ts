import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseColumn} from '../base.js';

@Component({
  selector: 'summary-column',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryColumn extends BaseColumn {
  name = 'summary';
}
