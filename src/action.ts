#!/usr/bin/env node
import { readInput } from "./core/input.js";
import type { CliOptions, TaskKind } from "./core/types.js";
import { runTask } from "./commands/runTask.js";

const command = readInputEnv("INPUT_COMMAND", "review");

if (!isTaskKind(command)) {
  throw new Error(`Invalid action command: ${command}`);
}

const options: CliOptions = {
  file: process.env.INPUT_FILE || undefined,
  model: process.env.INPUT_MODEL || "gpt-5.4-mini",
  offline: process.env.INPUT_OFFLINE === "true",
  format: "markdown",
  maxBytes: Number.parseInt(process.env.INPUT_MAX_BYTES || "180000", 10)
};

const input = await readInput(options.file, options.maxBytes);
const result = await runTask({ kind: command, input, options });

for (const warning of result.warnings) {
  console.error(`warning: ${warning}`);
}

process.stdout.write(`${result.output}\n`);

function readInputEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

function isTaskKind(value: string): value is TaskKind {
  return value === "triage" || value === "review" || value === "release-notes";
}
