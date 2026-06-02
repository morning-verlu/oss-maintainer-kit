Title: App crashes on startup after 0.1.0

The CLI crashes on startup with Node 24.

Steps to reproduce:

```bash
oss-maintainer review --diff pr.patch
```

Expected: a review summary.
Actual: process exits with an exception.
