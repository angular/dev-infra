import {PullRequest as SharedPullRequest} from '../../../shared/models/app-models';
import {FirestorePullRequest} from '../../../shared/models/pull-request';

export class PullRequest extends SharedPullRequest {
  target: string | undefined;

  override async setData(data: FirestorePullRequest) {
    await super.setData(data);
    this.target = this.labels.find((l) => l?.name?.startsWith('target:'))?.name || '';
  }
}
