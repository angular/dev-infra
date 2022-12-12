import {NormalizedState, PullRequest} from './pull-request.js';

type ValidationResult = {
  state: NormalizedState;
  description: string;
};

export type ValidationFunction = (pullRequest: PullRequest) => ValidationResult;

export type ValidationResults = {
  pending: ValidationResult[];
  success: ValidationResult[];
  failure: ValidationResult[];
};

function getState(results: ValidationResults): NormalizedState {
  if (results.failure.length > 0) {
    return 'failure';
  }
  if (results.pending.length > 0) {
    return 'pending';
  }
  if (results.success.length > 0) {
    return 'success';
  }
  return 'pending';
}

function getTitle(state: NormalizedState, results: ValidationResults) {
  const openMoreInfoText = ' (open details for more info)';

  if (state === 'success') {
    return 'Pull Request is ready for merge!';
  }

  let title = results[state].map(({description}) => description).join(' ');
  if (title.length >= 160) {
    return `${title.slice(0, 160 - openMoreInfoText.length)}${openMoreInfoText}`;
  }
  return title;
}

function getSummary(results: ValidationResults, pullRequest: PullRequest) {
  return `
### Validations

#### Failing
${
  results.failure.length
    ? results.failure.map(({description}) => ` - ${description}`).join('\n')
    : 'No failing validations.'
}

#### Pending
${
  results.pending.length
    ? results.pending.map(({description}) => ` - ${description}`).join('\n')
    : 'No pending validations.'
}

#### Success
${
  results.success.length
    ? results.success.map(({description}) => ` - ${description}`).join('\n')
    : 'No successful validations.'
}


### Status and Check Results
${pullRequest.statuses.all
  .map(({name, state, description}) => {
    return ` - ${stateToIconMap.get(state)} **${name}**: ${description}`;
  })
  .join('\n')}
`;
}

const stateToIconMap = new Map<NormalizedState, string>([
  ['failure', '❌'],
  ['pending', '🟡'],
  ['success', '✅'],
]);

export function buildCheckResultOutput(results: ValidationResults, pullRequest: PullRequest) {
  const state = getState(results);
  return {
    state,
    title: getTitle(state, results),
    summary: getSummary(results, pullRequest),
  };
}
