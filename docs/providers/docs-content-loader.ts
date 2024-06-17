/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, inject} from '@angular/core';
import {RedirectCommand, ResolveFn, Router} from '@angular/router';
import {DocContent, DocsContentLoader} from '../interfaces/index';

export const DOCS_CONTENT_LOADER = new InjectionToken<DocsContentLoader>('DOCS_CONTENT_LOADER');

export function contentResolver(contentPath: string): ResolveFn<DocContent | RedirectCommand> {
  return async () => {
    const router = inject(Router);
    const loader = inject(DOCS_CONTENT_LOADER);
    const result = await loader.getContent(contentPath)
    if (!result) {
      const notFoundPage = router.createUrlTree(['/404']);
      const currentNavigation = router.getCurrentNavigation();
      // If there is a current navigation, redirect to 404 page without changing the target URL
      const browserUrl = currentNavigation?.finalUrl ? currentNavigation.finalUrl : notFoundPage;
      return new RedirectCommand(notFoundPage, {browserUrl});
    } 

    return result;
  };
}
