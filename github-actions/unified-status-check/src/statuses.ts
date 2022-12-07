import * as core from '@actions/core';
import {PullRequest} from './pull-request.js';
import {ValidationFunction} from './validation.js';

/** Status matchers which must match at least one of the current statuses . */
const requiredStatuses = core.getMultilineInput('required', {trimWhitespace: true});

export const checkRequiredStatuses: ValidationFunction = ({statuses}: PullRequest) => {
  const missingStatuses = requiredStatuses.filter(
    (matcher) => !statuses.all.some(({name}) => name.match(matcher)),
  );
  if (missingStatuses.length > 0) {
    return {
      state: 'PENDING',
      description: `Pending ${missingStatuses.length} status(es): ${missingStatuses.join(', ')}`,
    };
  }
  return {
    state: 'SUCCESS',
    description: 'All expected statuses are present',
  };
};

export const checkOnlyPassingStatuses: ValidationFunction = ({statuses}: PullRequest) => {
  if (statuses.failing.length > 0) {
    return {
      state: 'FAILURE',
      description: `${statuses.failing} expected status(es) failing`,
    };
  }

  if (statuses.pending.length > 0) {
    return {
      state: 'PENDING',
      description: 'Other tracked statuses are still pending',
    };
  }

  return {
    state: 'SUCCESS',
    description: 'All tracked statuses are passing',
  };
};
