export type TaskKind = "triage" | "review" | "release-notes";

export interface CliOptions {
  file?: string;
  model: string;
  offline: boolean;
  format: "markdown" | "json";
  maxBytes: number;
}

export interface TaskRequest {
  kind: TaskKind;
  input: string;
  options: CliOptions;
}

export interface TaskResult {
  output: string;
  provider: "openai" | "offline";
  model?: string;
  warnings: string[];
}

export interface TriageResult {
  category: "bug" | "security" | "docs" | "enhancement" | "question" | "maintenance";
  priority: "low" | "normal" | "high" | "critical";
  labels: string[];
  needs_reproduction: boolean;
  maintainer_actions: string[];
  contributor_reply: string;
}
