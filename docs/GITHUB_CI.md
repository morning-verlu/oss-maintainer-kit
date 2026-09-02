# GitHub CI Workflow

The workflow in `.github/workflows/ci.yml` runs for pull requests and pushes to
`main`. It validates the project on Node.js 22 and 24 by running:

- `npm ci`
- type checks and the six-unit-test suite through `npm run check`
- `npm run build`
- all three CLI commands against the offline examples

A separate job invokes the checked-out repository as a local composite action in
offline mode. This catches regressions in `action.yml` without an API key or a
published tag.
