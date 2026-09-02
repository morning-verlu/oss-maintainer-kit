# oss-maintainer-kit

`oss-maintainer-kit` is a CLI and GitHub Action for open-source maintainers who need fast, repeatable help with:

- issue triage
- pull request diff review
- release note drafting

The tool uses the OpenAI Responses API when `OPENAI_API_KEY` is available. Without a key, it falls back to deterministic local heuristics so CI can still run and maintainers can preview the workflow.

## Install

This project is not published to npm. Build it from source:

```bash
npm install
npm run build
```

For local development:

```bash
npm run check
```

All examples below use the built entry point directly.

## CLI

Triage an issue:

```bash
node dist/cli.js triage --issue issue.md
```

Review a pull request diff:

```bash
gh pr diff 123 > pr.patch
node dist/cli.js review --diff pr.patch
```

Draft release notes:

```bash
git log --oneline v0.1.0..HEAD > commits.txt
node dist/cli.js release-notes --commits commits.txt
```

Use a stronger or cheaper model:

```bash
OPENAI_API_KEY=... node dist/cli.js review --diff pr.patch --model gpt-5.5
OPENAI_API_KEY=... node dist/cli.js triage --issue issue.md --model gpt-5.4-nano
```

Run fully offline:

```bash
node dist/cli.js review --diff pr.patch --offline
```

Try the included examples:

```bash
node dist/cli.js triage --issue examples/issue.md --offline
node dist/cli.js review --diff examples/pr.patch --offline
node dist/cli.js release-notes --commits examples/commits.txt --offline
```

## GitHub Action

Projects can call the versioned GitHub Action directly from this repository:

```yaml
name: Maintainer AI Review

on:
  pull_request:

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    steps:
      - uses: actions/checkout@v7
      - run: gh pr diff "$PR_NUMBER" > pr.patch
        env:
          GH_TOKEN: ${{ github.token }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
      - uses: morning-verlu/oss-maintainer-kit@v0.1.1
        with:
          command: review
          file: pr.patch
          model: gpt-5.4-mini
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## Maintainer Boundaries

This project is designed to assist maintainers, not replace maintainer judgment. It should not be used to scan repositories you do not own or have permission to review. Sensitive security reports should stay in private disclosure channels.

## Roadmap

- Post review summaries back to pull requests.
- Add issue label suggestions for GitHub and GitLab.
- Add SARIF output for security-sensitive review findings.
- Add repository policy files so maintainers can tune labels, priorities, and review rules.

For Codex for Open Source application preparation, see [docs/APPLICATION.md](docs/APPLICATION.md).

## License

Apache-2.0
