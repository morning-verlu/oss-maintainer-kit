import { describe, expect, it } from "vitest";
import { releaseNotes, reviewDiff, triageIssue } from "../src/core/offline.js";

describe("offline triage", () => {
  it("flags critical security reports", () => {
    const result = triageIssue("Critical auth bypass leaks API token. Repro steps included.");

    expect(result.category).toBe("security");
    expect(result.priority).toBe("critical");
    expect(result.labels).toContain("security");
    expect(result.needs_reproduction).toBe(false);
  });

  it("asks for reproduction when missing", () => {
    const result = triageIssue("The app crashes on startup.");

    expect(result.category).toBe("bug");
    expect(result.priority).toBe("high");
    expect(result.needs_reproduction).toBe(true);
  });
});

describe("offline review", () => {
  it("detects risky diff patterns", () => {
    const diff = [
      "diff --git a/src/run.ts b/src/run.ts",
      "+import child_process from 'node:child_process';",
      "+child_process.exec(userInput);",
      "+export function run() {}"
    ].join("\n");

    const output = reviewDiff(diff);

    expect(output).toContain("Shell execution");
    expect(output).toContain("Public API surface");
  });
});

describe("offline release notes", () => {
  it("buckets common change types", () => {
    const output = releaseNotes(
      [
        "add issue triage command",
        "fix crash in diff parser",
        "update readme examples",
        "security: redact tokens"
      ].join("\n")
    );

    expect(output).toContain("## Added");
    expect(output).toContain("## Fixed");
    expect(output).toContain("## Changed");
    expect(output).toContain("## Security");
  });
});
