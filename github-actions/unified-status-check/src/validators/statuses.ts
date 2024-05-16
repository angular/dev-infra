import * as core from '@actions/core';
import {PullRequest} from '../pull-request.js';
import {ValidationFunction} from '../validator.js';

/** Status matchers which must match at least one of the current statuses . */
const requiredStatuses = core.getMultilineInput('required', {trimWhitespace: true});

export const checkRequiredStatuses: ValidationFunction = ({statuses}: PullRequest) => {
  const missingStatuses = requiredStatuses.filter(
    (matcher) => !statuses.all.some(({name}) => name.match(matcher)),
  );
  if (missingStatuses.length > 0) {
    return {
      state: 'pending',
      description: `Pending ${missingStatuses.length} status(es): ${missingStatuses.join(', ')}`,
    };
  }
  return {
    state: 'success',
    description: 'All expected statuses are present',
  };
};

export const checkOnlyPassingStatuses: ValidationFunction = ({statuses}: PullRequest) => {
  if (statuses.failure.length > 0) {
    return {
      state: 'failure',
      description: `${statuses.failure.length} expected status(es) failing`,
    };
  }

  if (statuses.pending.length > 0) {
    return {
      state: 'pending',
      description: 'Other tracked statuses are still pending',
    };
  }

  return {
    state: 'success',
    description: 'All tracked statuses are passing',
  };
};
