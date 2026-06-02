# GitHub CI Workflow

The repository is ready for this CI workflow, but pushing files under `.github/workflows/` requires the GitHub token to include the `workflow` scope.

After refreshing GitHub CLI credentials with `workflow` scope, add this file at `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: npm
      - run: npm ci
      - run: npm run check
```
