/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, afterNextRender, inject, signal} from '@angular/core';
import {ENVIRONMENT} from '../providers/index';
import {SearchResult} from '../interfaces/index';
import {toObservable} from '@angular/core/rxjs-interop';
import {debounceTime, filter, from, of, switchMap} from 'rxjs';
import algoliasearch, {SearchClient} from 'algoliasearch/lite';
import {NavigationEnd, Router} from '@angular/router';

export const SEARCH_DELAY = 200;
// Maximum number of facet values to return for each facet during a regular search.
export const MAX_VALUE_PER_FACET = 5;

@Injectable({
  providedIn: 'root',
})
export class Search {
  private readonly _searchQuery = signal('');
  private readonly _searchResults = signal<undefined | SearchResult[]>(undefined);

  private readonly router = inject(Router);
  private readonly config = inject(ENVIRONMENT);
  private readonly client: SearchClient = (algoliasearch as any)(
    this.config.algolia.appId,
    this.config.algolia.apiKey,
  );
  private readonly index = this.client.initIndex(this.config.algolia.indexName);

  searchQuery = this._searchQuery.asReadonly();
  searchResults = this._searchResults.asReadonly();

  searchResults$ = toObservable(this.searchQuery).pipe(
    debounceTime(SEARCH_DELAY),
    switchMap((query) => {
      return !!query
        ? from(
            this.index.search(query, {
              maxValuesPerFacet: MAX_VALUE_PER_FACET,
            }),
          )
        : of(undefined);
    }),
  );

  constructor() {
    afterNextRender(() => {
      this.listenToSearchResults();
      this.resetSearchQueryOnNavigationEnd();
    });
  }

  updateSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  private listenToSearchResults(): void {
    this.searchResults$.subscribe((response) => {
      this._searchResults.set(
        response ? this.getUniqueSearchResultItems(response.hits) : undefined,
      );
    });
  }

  private getUniqueSearchResultItems(items: SearchResult[]): SearchResult[] {
    const uniqueUrls = new Set<string>();

    return items.filter((item) => {
      if (item.url && !uniqueUrls.has(item.url)) {
        uniqueUrls.add(item.url);
        return true;
      }
      return false;
    });
  }

  private resetSearchQueryOnNavigationEnd(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateSearchQuery('');
    });
  }
}
