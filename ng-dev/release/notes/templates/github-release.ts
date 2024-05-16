/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default `
<a name="<%- urlFragmentForRelease %>"></a>
# <%- version %><% if (title) { %> "<%- title %>"<% } %> (<%- dateStamp %>)

<%_
const commitsInChangelog = commits.filter(includeInReleaseNotes());
for (const group of asCommitGroups(commitsInChangelog)) {
_%>

### <%- group.title %>
| Commit | Description |
| -- | -- |
<%_
  for (const commit of group.commits) {
_%>
| <%- commitToBadge(commit) %> | <%- commit.description %> |
<%_
  }
}
_%>

<%_
const breakingChanges = commits.filter(hasBreakingChanges);
if (breakingChanges.length) {
_%>
## Breaking Changes

<%_
  for (const group of asCommitGroups(breakingChanges)) {
_%>
### <%- group.title %>
<%_
    for (const commit of group.commits) {
      for (const breakingChange of commit.breakingChanges) {
_%>
<%- bulletizeText(breakingChange.text) %>
<%_
      }
    }
  }
}
_%>

<%_
const deprecations = commits.filter(hasDeprecations);
if (deprecations.length) {
_%>
## Deprecations
<%_
  for (const group of asCommitGroups(deprecations)) {
_%>
### <%- group.title %>
<%_
    for (const commit of group.commits) {
      for (const deprecation of commit.deprecations) {
_%>
<%- bulletizeText(deprecation.text) %>
<%_
      }
    }
  }
}
_%>
`;
