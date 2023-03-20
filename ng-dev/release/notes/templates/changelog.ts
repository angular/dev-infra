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

<%_
const commitsInChangelog = commits.filter(includeInReleaseNotes());
for (const group of asCommitGroups(commitsInChangelog)) {
_%>

### <%- group.title %>
| Commit | Type | Description |
| -- | -- | -- |
<%_
  for (const commit of group.commits) {
    const descriptionWithMarkdownLinks = convertPullRequestReferencesToLinks(
      commit.description);
_%>
| <%- commitToLink(commit) %> | <%- commit.type %> | <%- descriptionWithMarkdownLinks %> |
<%_
  }
}
_%>

<%_
const authors = commitAuthors(commits);
if (authors.length === 1) {
_%>
## Special Thanks
<%- authors[0]%>
<%_
}
if (authors.length > 1) {
_%>
## Special Thanks
<%- authors.slice(0, -1).join(', ') %> and <%- authors.slice(-1)[0] %>
<%_
}
_%>
`;
