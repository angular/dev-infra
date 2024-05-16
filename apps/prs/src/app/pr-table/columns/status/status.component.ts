import {ChangeDetectionStrategy, Component} from '@angular/core';
import {StatusEvent} from '@octokit/webhooks-types';
import {BaseColumn} from '../base.js';

@Component({
  selector: 'status-column',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusColumn extends BaseColumn {
  name = 'status';

  getStatusIconForStatus(state: StatusEvent['state']) {
    switch (state) {
      case 'pending':
        return 'pending';
      case 'success':
        return 'check_circle';
      case 'failure':
        return 'error';
      case 'error':
        return 'error';
    }
    throw Error('An invalid state was provided for retrieving the icon.');
  }
}
