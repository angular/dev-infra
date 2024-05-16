# Feature Request Process

This directory contains a GitHub bot for enforcing the Angular GitHub feature request management process. It's inspired by a [similar process](https://www.youtube.com/watch?v=-Olo7N9xwV8) implemented by Microsoft in VS Code.

## How to use?

Make sure you review the values in `action.yml`. By default, the process relies that:

- All feature requests have a `feature` label
- The repository is in an organization. Although the process may work for personal repositories as well, it's not tested for such scenario
- The repository has the labels: `feature`, `votes required`, `in backlog`, `under consideration`, `insufficient votes`.

To use in your repository:

1. Create a GitHub [workflow](https://docs.github.com/en/actions/quickstart#creating-your-first-workflow)
2. As action under `uses` specify: `angular/dev-infra/github-actions/feature-request@[hash]`
3. Configure the action with your specific values

## License

MIT
