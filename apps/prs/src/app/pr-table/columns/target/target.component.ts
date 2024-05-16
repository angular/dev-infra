import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseColumn} from '../base.js';

/** The targets available, and the text to show in the UI. */
const Targets = [
  {
    label: 'target: patch',
    text: 'Patch',
  },
  {
    label: 'target: minor',
    text: 'Minor',
  },
  {
    label: 'target: major',
    text: 'Major',
  },
  {
    label: 'target: lts',
    text: 'LTS',
  },
  {
    label: 'target: rc',
    text: 'RC',
  },
  {
    label: 'target: feature branch',
    text: 'Feature Branch',
  },
];

@Component({
  selector: 'target-column',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TargetColumn extends BaseColumn {
  name = 'target';

  getTargetText(target: string) {
    return Targets.find((t) => t.label === target)?.text ?? 'No Target';
  }
}
