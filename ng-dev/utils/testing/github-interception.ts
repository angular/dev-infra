/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {buildGithubPaginationResponseHeader} from './github-pagination-header.js';
import {ParsedUrlQuery} from 'querystring';
import nock from 'nock';

/**
 * Fakes a Github server response with pagination.
 *
 * @see https://docs.github.com/en/rest/guides/traversing-with-pagination.
 * @example https://docs.github.com/en/rest/reference/repos#list-branches.
 */
export function fakeGithubPaginationResponse(url: string, data: unknown[]) {
  // For each data entry, create its own API page so that pagination is required
  // to resolve all data.
  for (let index = 0; index < data.length; index++) {
    // Pages start with `1` as per the Github API specification.
    const pageNum = index + 1;
    const entry = data[index];
    const linkHeader = buildGithubPaginationResponseHeader(data.length, pageNum, url);

    // For the first page, either `?page=1` needs to be set, or no `page` should be specified.
    const queryMatch =
      pageNum === 1
        ? (params: ParsedUrlQuery) => params.page === '1' || params.page === undefined
        : {page: pageNum};

    nock(url).get('').query(queryMatch).reply(200, [entry], {
      link: linkHeader,
    });
  }
}
