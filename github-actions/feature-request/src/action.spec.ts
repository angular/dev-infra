import * as action from './action';
import {APIMock, IssueAPIMock} from './testing';

describe('feature request action', () => {
  let basic: APIMock;
  let basicConfig: action.Config;
  beforeEach(() => {
    basic = new APIMock([new IssueAPIMock([]), new IssueAPIMock([])], {});

    basicConfig = {
      closeComment: 'below min votes',
      warnComment: 'warn comment',
      startVotingComment: 'voting started',
      featureRequestLabel: 'feature',
      inBacklogLabel: 'backlog',
      requiresVotesLabel: 'requires-votes',
      underConsiderationLabel: 'under-consideration',
      minimumVotesForConsideration: 20,
      warnDaysDuration: 40,
      closeAfterWarnDaysDuration: 10,
      oldIssueWarnDaysDuration: 50,
      minimumUniqueCommentAuthorsForConsideration: 10,
      organization: 'angular',
      insufficientVotesLabel: 'voting-finished',
      closeWhenNoSufficientVotes: true,
      limit: -1,
    };
  });

  it('should query the issues', async () => {
    const spy = spyOn(APIMock.prototype, 'query').and.callThrough();
    await action.run(basic, basicConfig);
    expect(spy).toHaveBeenCalled();
  });

  it('should label & comment on incoming feature requests', async () => {
    const [first, second] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    second.labels = [basicConfig.featureRequestLabel];

    // Setting createdAt to yesterday.
    first.createdAt = second.createdAt = Date.now() - 24 * 60 * 60 * 1000;

    await action.run(basic, basicConfig);

    expect(first.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(1);
    expect(second.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(1);

    expect(first.comments.length).toBe(1);
    expect(second.comments.length).toBe(1);

    for await (const comment of first.comments) {
      expect(comment.body).toEqual(
        action.comment(action.CommentMarkers.StartVoting, basicConfig.startVotingComment),
      );
    }
    for await (const comment of second.comments) {
      expect(comment.body).toEqual(
        action.comment(action.CommentMarkers.StartVoting, basicConfig.startVotingComment),
      );
    }
  });

  it('should label and warn comment on old issues', async () => {
    const [first, second] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    second.labels = [basicConfig.featureRequestLabel];

    // Two months ago
    first.createdAt = Date.now() - 60 * 24 * 60 * 60 * 1000;
    // 300 days ago
    second.createdAt = Date.now() - 300 * 24 * 60 * 60 * 1000;

    await action.run(basic, basicConfig);

    expect(first.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(1);
    expect(second.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(1);

    expect(first.comments.length).toBe(1);
    expect(second.comments.length).toBe(1);

    for await (const comment of first.comments) {
      expect(comment.body).toEqual(
        action.comment(action.CommentMarkers.Warn, basicConfig.warnComment),
      );
    }
    for await (const comment of second.comments) {
      expect(comment.body).toEqual(
        action.comment(action.CommentMarkers.Warn, basicConfig.warnComment),
      );
    }
  });

  it('should warn after commented to start voting', async () => {
    const [first] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    first.comments.push({
      author: {
        name: '',
      },
      body: action.comment(action.CommentMarkers.StartVoting, basicConfig.startVotingComment),
      id: 1,
      timestamp: Date.now() - basicConfig.warnDaysDuration * 24 * 60 * 60 * 1000,
    });

    await action.run(basic, basicConfig);

    expect(first.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(1);
    expect(first.comments.length).toBe(2);
    expect(first.comments.pop()!.body).toEqual(
      action.comment(action.CommentMarkers.Warn, basicConfig.warnComment),
    );
  });

  it('should mark for consideration issues with specific number of votes', async () => {
    const [first] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    first.reactions = {
      '+1': basicConfig.minimumVotesForConsideration,
      '-1': 0,
      confused: 0,
      eyes: 0,
      heart: 10,
      hooray: 10,
      laugh: 10,
      rocket: 10,
    };

    await action.run(basic, basicConfig);

    expect(first.labels.length).toBe(2);
    expect(first.labels.includes(basicConfig.requiresVotesLabel)).toBeFalse();
    expect(first.labels.includes(basicConfig.underConsiderationLabel)).toBeTrue();
    expect(first.labels.includes(basicConfig.featureRequestLabel)).toBeTrue();
  });

  it('should mark for consideration issues with specific number of comment authors', async () => {
    const [first] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    first.numComments = basicConfig.minimumUniqueCommentAuthorsForConsideration;

    [...new Array(basicConfig.minimumUniqueCommentAuthorsForConsideration)].forEach((_, i) => {
      first.comments.push({
        author: {
          name: i.toString(),
        },
        body: '',
        id: 1,
        timestamp: Date.now() - basicConfig.warnDaysDuration * 24 * 60 * 60 * 1000,
      });
    });

    await action.run(basic, basicConfig);

    expect(first.labels.length).toBe(2);
    expect(first.labels.includes(basicConfig.requiresVotesLabel)).toBeFalse();
    expect(first.labels.includes(basicConfig.featureRequestLabel)).toBeTrue();
    expect(first.labels.includes(basicConfig.underConsiderationLabel)).toBeTrue();
  });

  it('should close issues with old enough warn comment', async () => {
    const [first] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    first.comments.push({
      author: {
        name: '',
      },
      body: action.comment(action.CommentMarkers.Warn, basicConfig.warnComment),
      id: 1,
      timestamp: Date.now() - basicConfig.closeAfterWarnDaysDuration * 24 * 60 * 60 * 1000,
    });

    await action.run(basic, basicConfig);

    expect(first.labels.includes(basicConfig.requiresVotesLabel)).toBeFalse();
    expect(first.labels.includes(basicConfig.insufficientVotesLabel)).toBeTrue();
    expect(first.labels.includes(basicConfig.featureRequestLabel)).toBeTrue();
    expect(first.comments.length).toBe(2);
    expect(first.comments.pop()!.body).toEqual(
      action.comment(action.CommentMarkers.Close, basicConfig.closeComment),
    );
    expect(first.open).toBeFalse();
  });

  it('should label issues with old enough warn comment', async () => {
    const [first] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    first.comments.push({
      author: {
        name: '',
      },
      body: action.comment(action.CommentMarkers.Warn, basicConfig.warnComment),
      id: 1,
      timestamp: Date.now() - basicConfig.closeAfterWarnDaysDuration * 24 * 60 * 60 * 1000,
    });

    basicConfig.closeWhenNoSufficientVotes = false;
    await action.run(basic, basicConfig);

    expect(first.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(-1);
    expect(first.labels.indexOf(basicConfig.insufficientVotesLabel)).toBe(1);
    expect(first.comments.length).toBe(2);
    expect(first.comments.pop()!.body).toEqual(
      action.comment(action.CommentMarkers.Close, basicConfig.closeComment),
    );
    expect(first.open).toBeTrue();
  });

  it('should not process issues from team members', async () => {
    const [first] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    first.author.name = 'foo';
    basic.orgMembers = {
      angular: ['foo'],
    };

    await action.run(basic, basicConfig);

    expect(first.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(-1);
    expect(first.comments.length).toBe(0);
  });

  it('should not process (comment, close, or label) issues which are already marked as having insufficient number of votes', async () => {
    const [first] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel, basicConfig.insufficientVotesLabel];
    first.comments.push({
      author: {
        name: '',
      },
      body: action.comment(action.CommentMarkers.Warn, basicConfig.warnComment),
      id: 1,
      timestamp: Date.now() - basicConfig.closeAfterWarnDaysDuration * 24 * 60 * 60 * 1000,
    });

    await action.run(basic, basicConfig);

    expect(first.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(-1);
    expect(first.comments.length).toBe(1);
    expect(first.open).toBeTrue();
  });

  it('should respect the limit configuration parameter', async () => {
    const [first, second] = basic.issues;
    first.labels = [basicConfig.featureRequestLabel];
    second.labels = [basicConfig.featureRequestLabel];

    basicConfig.limit = 1;

    // Two months ago
    first.createdAt = Date.now() - 60 * 24 * 60 * 60 * 1000;
    // 300 days ago
    second.createdAt = Date.now() - 300 * 24 * 60 * 60 * 1000;

    await action.run(basic, basicConfig);

    expect(first.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(1);
    expect(second.labels.indexOf(basicConfig.requiresVotesLabel)).toBe(-1);

    expect(first.comments.length).toBe(1);
    expect(second.comments.length).toBe(0);

    for await (const comment of first.comments) {
      expect(comment.body).toEqual(
        action.comment(action.CommentMarkers.Warn, basicConfig.warnComment),
      );
    }
  });
});
