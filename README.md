# oss-maintainer-kit

`oss-maintainer-kit` is a CLI and GitHub Action for open-source maintainers who need fast, repeatable help with:

- issue triage
- pull request diff review
- release note drafting

The tool uses the OpenAI Responses API when `OPENAI_API_KEY` is available. Without a key, it falls back to deterministic local heuristics so CI can still run and maintainers can preview the workflow.

## Install

```bash
npm install
npm run build
```

For local development:

```bash
npm run check
```

## CLI

Triage an issue:

```bash
oss-maintainer triage --issue issue.md
```

Review a pull request diff:

```bash
gh pr diff 123 > pr.patch
oss-maintainer review --diff pr.patch
```

Draft release notes:

```bash
git log --oneline v0.1.0..HEAD > commits.txt
oss-maintainer release-notes --commits commits.txt
```

Use a stronger or cheaper model:

```bash
OPENAI_API_KEY=sk-... oss-maintainer review --diff pr.patch --model gpt-5.5
OPENAI_API_KEY=sk-... oss-maintainer triage --issue issue.md --model gpt-5.4-nano
```

Run fully offline:

```bash
oss-maintainer review --diff pr.patch --offline
```

Try the included examples:

```bash
node dist/cli.js triage --issue examples/issue.md --offline
node dist/cli.js review --diff examples/pr.patch --offline
node dist/cli.js release-notes --commits examples/commits.txt --offline
```

## GitHub Action

After publishing this repository, other projects can call the action:

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
      - uses: actions/checkout@v4
      - run: gh pr diff "$PR_NUMBER" > pr.patch
        env:
          GH_TOKEN: ${{ github.token }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
      - uses: OWNER/oss-maintainer-kit@v0.1.0
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
