import type { TaskKind } from "./types.js";

const sharedInstructions = [
  "You help open-source maintainers work through repository maintenance tasks.",
  "Be specific, evidence-based, and conservative.",
  "Do not invent files, metrics, or repository history that are not present in the input.",
  "Call out uncertainty when the input is incomplete."
].join("\n");

export function buildInstructions(kind: TaskKind): string {
  if (kind === "triage") {
    return [
      sharedInstructions,
      "Classify an issue for maintainer triage.",
      "Return only valid JSON with keys: category, priority, labels, needs_reproduction, maintainer_actions, contributor_reply."
    ].join("\n");
  }

  if (kind === "review") {
    return [
      sharedInstructions,
      "Review a pull request diff.",
      "Lead with bugs, regressions, security risks, and missing tests.",
      "Use Markdown. Include concrete file or pattern references when visible."
    ].join("\n");
  }

  return [
    sharedInstructions,
    "Draft release notes from commits, pull request titles, or a changelog excerpt.",
    "Group changes by Added, Changed, Fixed, Security, and Maintenance when applicable.",
    "Use concise Markdown."
  ].join("\n");
}

export function buildInput(kind: TaskKind, input: string): string {
  return [
    `Task: ${kind}`,
    "Repository input:",
    "```",
    input,
    "```"
  ].join("\n");
}
