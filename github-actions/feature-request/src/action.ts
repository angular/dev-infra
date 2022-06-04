import {GitHubAPI, GitHubIssueAPI, MarkedComment, Issue} from './api';
import {log} from './log';

/**
 * CommentMarkers are used to distinguish individual comments
 * posted from the action. This way we track when the voting
 * process has started, when we have posted a warning message,
 * and when it's time to move to the next stage.
 */
export enum CommentMarkers {
  StartVoting = '<!-- 6374bc4f-3ca6-4ebb-b416-250033c91ab5 -->',
  Warn = '<!-- 727acbae-59f4-4cde-b59e-4c9847cabcca -->',
  Close = '<!-- 5bb7b168-3bff-4685-ac2a-be3174a97af4 -->',
}

export interface Config {
  organization: string;

  featureRequestLabel: string;
  requiresVotesLabel: string;
  inBacklogLabel: string;
  underConsiderationLabel: string;

  // For old issues we don't want to go to the standard
  // process because they have been already open for long enough.
  // Instead we want to wait `oldIssuesDaysWarnDuration` number of days
  // until we post a warning and close it in `closeAfterWarnDaysDuration`.
  oldIssueWarnDaysDuration: number;
  // This flag indicates for how long after the initial comment
  // that kicks off the voting process we should post a warning comment.
  warnDaysDuration: number;
  // Indicates how may days after the warning comment we should close
  // the issue and post an explanation.
  closeAfterWarnDaysDuration: number;

  closeComment: string;
  warnComment: string;
  startVotingComment: string;

  // Number of votes up required to add the `underConsiderationLabel`.
  minimumVotesForConsideration: number;
  // Number of comments from unique authors required to add the `underConsiderationLabel`.
  // Keep in mind that this includes comments from the bot and team members.
  minimumUniqueCommentAuthorsForConsideration: number;

  // If set to true, the bot will automatically close the issue
  // when voting has ended, if the request has not collected a sufficient number of votes.
  // Alternatively, the bot will just add a `votingFinishedLabel`.
  closeWhenNoSufficientVotes: boolean;
  insufficientVotesLabel: string;

  // Sets the number of issues we want to perform the action over.
  // Use -1 for all the issues in the repository.
  limit: number;
}

export const run = async (api: GitHubAPI, config: Config) => {
  const issues = api.query({
    q: `is:open is:issue label:"${config.featureRequestLabel}" -label:"${config.inBacklogLabel}" -label:"${config.underConsiderationLabel}" -label:"${config.insufficientVotesLabel}" sort:created-asc`,
  });

  let limit = config.limit === -1 ? Infinity : config.limit;
  for await (const issue of issues) {
    if (limit <= 0) {
      break;
    }
    limit--;
    await processIssue(api, issue, config);

    // Separator between the individual issues for better readability
    log('---------------------------');
  }
};

/**
 * Processes a particular issue from the repository. At the beginning of the invocation
 * the function makes sure the issue is in the target group of feature requests we want to process.
 * Depending on the current state of the issue, the function will either label it, close it,
 * add a comment, or perform a noop.
 *
 * @param githubAPI Object used for querying the GitHub API
 * @param githubIssue Object used for communication with the GitHub API for a particular issue
 * @param config Configuration of the GitHub bot
 */
const processIssue = async (githubAPI: GitHubAPI, githubIssue: GitHubIssueAPI, config: Config) => {
  const issue = await githubIssue.get();

  log(
    `Started processing issue #${issue.number}:\n` +
      `  Title:    ${issue.title}\n` +
      `  Author:   ${issue.author.name}\n` +
      `  Votes:    ${issue.reactions['+1']}\n` +
      `  Comments: ${issue.numComments}`,
  );

  // Issues opened by team members bypass the process.
  if (await githubAPI.isOrgMember(issue.author.name, config.organization)) {
    log(`The creator of issue #${issue.number} is a member of the organization.`);
    return;
  }

  // An extra assurance we will not get into a situation where we
  // have issues under consideration / backlog which require votes.
  if (
    issue.labels.includes(config.inBacklogLabel) ||
    issue.labels.includes(config.insufficientVotesLabel) ||
    issue.labels.includes(config.underConsiderationLabel) ||
    !issue.labels.includes(config.featureRequestLabel) ||
    !issue.open
  ) {
    log(`Invalid query result for issue #${issue.number}.`);
    return;
  }

  if (await shouldConsiderIssue(issue, githubIssue, config)) {
    log(`Adding #${issue.number} for consideration.`);
    return Promise.all([
      githubIssue.addLabel(config.underConsiderationLabel),
      githubIssue.removeLabel(config.requiresVotesLabel),
    ]);
  }

  if (!issue.labels.includes(config.requiresVotesLabel)) {
    log(`Adding votes required to #${issue.number}`);
    await githubIssue.addLabel(config.requiresVotesLabel);
  }

  const timestamps = await getTimestamps(githubIssue);

  if (timestamps.start === null && timestamps.warn === null) {
    // In case an issue has been open for longer than a specified period of time and
    // it still does not have enough votes to be under consideration we want to add a warning.
    if (daysSince(issue.createdAt) >= config.oldIssueWarnDaysDuration) {
      log(`Adding a warning for old feature request with #${issue.number}`);
      return await githubIssue.postComment(comment(CommentMarkers.Warn, config.warnComment));
    }

    // If this is not an old issue, we want to announce the voting process has started.
    log(`Starting voting for #${issue.number}`);
    return await githubIssue.postComment(
      comment(CommentMarkers.StartVoting, config.startVotingComment),
    );
  }

  if (
    timestamps.start !== null &&
    daysSince(timestamps.start) >= config.warnDaysDuration &&
    timestamps.warn === null
  ) {
    log(`Posting a warning for #${issue.number}`);
    return await githubIssue.postComment(comment(CommentMarkers.Warn, config.warnComment));
  }

  if (timestamps.warn !== null && daysSince(timestamps.warn) >= config.closeAfterWarnDaysDuration) {
    // In the future consider closing associated PRs if we have high
    // level of confidence they are scoped to the feature request.
    log(`Insufficient votes for feature request #${issue.number}`);
    const actions = [
      githubIssue.postComment(comment(CommentMarkers.Close, config.closeComment)),
      githubIssue.addLabel(config.insufficientVotesLabel),
      githubIssue.removeLabel(config.requiresVotesLabel),
    ];
    if (config.closeWhenNoSufficientVotes) {
      actions.push(githubIssue.close());
    }
    return await Promise.all(actions);
  }
};

/**
 * Returns if the following issue has met the criteria for consideration.
 *
 * @param issue Object containing the issue information.
 * @param githubIssue Object which allows us to communicate directly with the GitHub API for the specified issue
 * @param config Configuration of the GitHub bot.
 */
const shouldConsiderIssue = async (
  issue: Issue,
  githubIssue: GitHubIssueAPI,
  config: Config,
): Promise<boolean> => {
  let shouldBeConsidered = issue.reactions['+1'] >= config.minimumVotesForConsideration;

  // Only get the comments when the issue is not already for consideration
  // and the number of comments is higher than the minimum required to avoid requests.
  if (
    !shouldBeConsidered &&
    issue.numComments >= config.minimumUniqueCommentAuthorsForConsideration
  ) {
    const authors = new Set<string>();
    const comments = githubIssue.getComments();
    for await (const c of comments) {
      authors.add(c.author.name);
    }
    shouldBeConsidered = authors.size >= config.minimumUniqueCommentAuthorsForConsideration;
  }
  return shouldBeConsidered;
};

/**
 * Returns the number of days between now and the passed timestamp.
 *
 * @param date Timestamp
 */
const daysSince = (date: number) => Math.ceil((Date.now() - date) / (1000 * 60 * 60 * 24));

/**
 * Returns the timestamps when we've started voting and warned that voting has almost finished.
 * The start timestamp corresponds to the time we published the initial comment that voting is open.
 * The warn timestamp corresponds to the time we published the warn comment that there are only
 * X days left before voting closes.
 *
 * @param githubIssue an object we can use to get the comments for a particular issue.
 */
const getTimestamps = async (githubIssue: GitHubIssueAPI) => {
  const timestamps: {warn: number | null; start: number | null} = {
    start: null,
    warn: null,
  };

  const comments = githubIssue.getComments();
  for await (const c of comments) {
    // If there are multiple comments we should get the last timestamp.
    if (c.body.includes(CommentMarkers.StartVoting)) {
      timestamps.start = Math.max(c.timestamp, timestamps.start ?? -Infinity);
    }
    if (c.body.includes(CommentMarkers.Warn)) {
      timestamps.warn = Math.max(c.timestamp, timestamps.warn ?? -Infinity);
    }
  }

  return timestamps;
};

/**
 *
 * Returns a comment with a specific UUID that will allow us to identify it in the future.
 *
 * @param marker A UUID wrapped in an HTML comment we can use to identify this message later on.
 * @param text Text of the comment.
 */
export const comment = (marker: CommentMarkers, text: string): MarkedComment =>
  `${marker}\n${text}` as MarkedComment;
