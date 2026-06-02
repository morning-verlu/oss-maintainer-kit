# Security Policy

## Reporting Vulnerabilities

Do not publish sensitive exploit details in a public issue.

Send a private report to the repository maintainer, or use GitHub private vulnerability reporting once it is enabled for the public repository.

Please include:

- affected version or commit
- reproduction steps
- impact
- whether the issue is already public

## Supported Versions

The current development branch and latest tagged release receive security fixes.

## Use of AI Review

`oss-maintainer-kit` can help identify risky patterns, but it does not replace security review. Maintainers should manually inspect authentication, authorization, secret handling, shell execution, SQL construction, and persistence changes.
