import type { TaskRequest, TaskResult, TriageResult } from "./types.js";

const labelRules: Array<[label: string, patterns: RegExp[]]> = [
  ["security", [/\b(cve|xss|csrf|rce|injection|vulnerability|secret|token|auth bypass)\b/i]],
  ["bug", [/\b(bug|crash\w*|error|exception|regression|fails?|broken|stack trace)\b/i]],
  ["docs", [/\b(doc|docs|readme|typo|example|guide)\b/i]],
  ["enhancement", [/\b(feature|enhancement|support|request|proposal)\b/i]],
  ["question", [/\b(question|how do i|help|usage)\b/i]]
];

export function runOffline(request: TaskRequest): TaskResult {
  if (request.kind === "triage") {
    return {
      output: JSON.stringify(triageIssue(request.input), null, 2),
      provider: "offline",
      warnings: ["OPENAI_API_KEY was not used; returned offline heuristic triage."]
    };
  }

  if (request.kind === "review") {
    return {
      output: reviewDiff(request.input),
      provider: "offline",
      warnings: ["OPENAI_API_KEY was not used; returned offline heuristic review."]
    };
  }

  return {
    output: releaseNotes(request.input),
    provider: "offline",
    warnings: ["OPENAI_API_KEY was not used; returned offline heuristic release notes."]
  };
}

export function triageIssue(input: string): TriageResult {
  const labels = new Set<string>();

  for (const [label, patterns] of labelRules) {
    if (patterns.some((pattern) => pattern.test(input))) {
      labels.add(label);
    }
  }

  if (labels.size === 0) {
    labels.add("maintenance");
  }

  const lower = input.toLowerCase();
  const isSecurity = labels.has("security");
  const hasRepro =
    /\b(repro|reproduction|steps|minimal|example|stack trace)\b/i.test(input) ||
    /```[\s\S]+```/.test(input);

  let priority: TriageResult["priority"] = "normal";
  if (isSecurity && /\b(rce|credential|secret|token|auth bypass|critical)\b/i.test(input)) {
    priority = "critical";
  } else if (isSecurity || /\b(data loss|production|regression|crash\w*)\b/i.test(input)) {
    priority = "high";
  } else if (labels.has("docs") || labels.has("question")) {
    priority = "low";
  }

  const category = pickCategory(labels);
  const actions = [
    hasRepro ? "Verify the reproduction locally." : "Ask for a minimal reproduction and expected behavior.",
    isSecurity ? "Move sensitive details to a private security channel before public discussion." : "Check whether this duplicates an existing issue.",
    "Confirm the affected version and environment."
  ];

  return {
    category,
    priority,
    labels: [...labels],
    needs_reproduction: !hasRepro,
    maintainer_actions: actions,
    contributor_reply: hasRepro
      ? "Thanks for the report. I will verify the reproduction and check the affected version before assigning this."
      : "Thanks for opening this. Could you share a minimal reproduction, the affected version, and the expected versus actual behavior?"
  };
}

function pickCategory(labels: Set<string>): TriageResult["category"] {
  for (const candidate of ["security", "bug", "docs", "enhancement", "question"] as const) {
    if (labels.has(candidate)) {
      return candidate;
    }
  }
  return "maintenance";
}

export function reviewDiff(diff: string): string {
  const files = [...diff.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map((match) => match[2]);
  const added = countLines(diff, "+");
  const removed = countLines(diff, "-");
  const risks = detectRisks(diff);

  const lines = [
    "# Maintainer Review",
    "",
    "## Summary",
    `- Files touched: ${files.length || "unknown"}`,
    `- Added lines: ${added}`,
    `- Removed lines: ${removed}`,
    "",
    "## Findings"
  ];

  if (risks.length === 0) {
    lines.push("- No obvious high-risk patterns were detected by the offline reviewer.");
  } else {
    lines.push(...risks.map((risk) => `- ${risk}`));
  }

  lines.push(
    "",
    "## Test Focus",
    "- Run the existing test suite for touched packages.",
    "- Add or update tests around changed public behavior.",
    "- Manually verify edge cases for changed parsing, auth, network, or persistence paths."
  );

  return lines.join("\n");
}

function countLines(diff: string, prefix: "+" | "-"): number {
  return diff
    .split("\n")
    .filter((line) => line.startsWith(prefix) && !line.startsWith(`${prefix}${prefix}${prefix}`)).length;
}

function detectRisks(diff: string): string[] {
  const checks: Array<[RegExp, string]> = [
    [/\b(eval|new Function)\s*\(/, "Dynamic code execution appears in the diff; review input control and sandboxing."],
    [/\bchild_process\b|\bexec(File)?\s*\(/, "Shell execution appears in the diff; verify argument escaping and permissions."],
    [/\bprocess\.env\b/, "Environment variable access changed; check secret handling and test coverage."],
    [/\b(password|secret|token|api[_-]?key)\b/i, "Credential-related code changed; review redaction, storage, and logs."],
    [/\bSELECT\b[\s\S]+\+|\bquery\s*\([^`'"]*\+/, "SQL or query construction may be string-concatenated; review injection risk."],
    [/\b(localStorage|sessionStorage|cookie)\b/, "Browser storage or cookies changed; review privacy and session behavior."],
    [/\bmigration\b|\bALTER TABLE\b|\bCREATE TABLE\b/i, "Database migration-related content changed; verify rollback and compatibility."],
    [/\bpublic\s+class\b|\bexport\s+(class|function|const|interface|type)\b/, "Public API surface changed; confirm compatibility and documentation updates."]
  ];

  return checks.filter(([pattern]) => pattern.test(diff)).map(([, message]) => message);
}

export function releaseNotes(input: string): string {
  const items = input
    .split("\n")
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);

  const buckets = {
    Added: [] as string[],
    Changed: [] as string[],
    Fixed: [] as string[],
    Security: [] as string[],
    Maintenance: [] as string[]
  };

  for (const item of items) {
    const lower = item.toLowerCase();
    if (/\b(cve|security|vulnerability|xss|csrf|secret)\b/.test(lower)) {
      buckets.Security.push(item);
    } else if (/\b(fix|bug|regression|crash|broken)\b/.test(lower)) {
      buckets.Fixed.push(item);
    } else if (/\b(add|new|introduce|support)\b/.test(lower)) {
      buckets.Added.push(item);
    } else if (/\b(change|update|improve|refactor)\b/.test(lower)) {
      buckets.Changed.push(item);
    } else {
      buckets.Maintenance.push(item);
    }
  }

  const lines = ["# Release Notes"];
  for (const [bucket, values] of Object.entries(buckets)) {
    if (values.length === 0) {
      continue;
    }
    lines.push("", `## ${bucket}`, ...values.map((value) => `- ${value}`));
  }

  return lines.join("\n");
}
