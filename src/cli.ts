#!/usr/bin/env node
import { readInput } from "./core/input.js";
import type { CliOptions, TaskKind } from "./core/types.js";
import { runTask } from "./commands/runTask.js";

const defaultOptions: CliOptions = {
  model: "gpt-5.4-mini",
  offline: false,
  format: "markdown",
  maxBytes: 180_000
};

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const [command, ...args] = argv;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  if (!isTaskKind(command)) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    return 1;
  }

  try {
    const options = parseOptions(args);
    const input = await readInput(options.file, options.maxBytes);
    const result = await runTask({ kind: command, input, options });

    for (const warning of result.warnings) {
      console.error(`warning: ${warning}`);
    }

    process.stdout.write(`${result.output}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: ${message}`);
    return 1;
  }
}

function parseOptions(args: string[]): CliOptions {
  const options = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--file" || arg === "--issue" || arg === "--diff" || arg === "--commits") {
      options.file = readValue(args, ++index, arg);
    } else if (arg === "--model") {
      options.model = readValue(args, ++index, arg);
    } else if (arg === "--offline") {
      options.offline = true;
    } else if (arg === "--format") {
      const format = readValue(args, ++index, arg);
      if (format !== "markdown" && format !== "json") {
        throw new Error("--format must be markdown or json.");
      }
      options.format = format;
    } else if (arg === "--max-bytes") {
      const parsed = Number.parseInt(readValue(args, ++index, arg), 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--max-bytes must be a positive integer.");
      }
      options.maxBytes = parsed;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function readValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function isTaskKind(value: string): value is TaskKind {
  return value === "triage" || value === "review" || value === "release-notes";
}

function printHelp(): void {
  console.log(`oss-maintainer-kit

Usage:
  oss-maintainer triage --issue issue.md [--model gpt-5.4-mini]
  oss-maintainer review --diff pr.patch [--offline]
  oss-maintainer release-notes --commits commits.txt
  cat pr.patch | oss-maintainer review

Options:
  --file <path>       Read input from a file. Use "-" or omit to read stdin.
  --issue <path>      Alias for --file, intended for issue text.
  --diff <path>       Alias for --file, intended for pull request diffs.
  --commits <path>    Alias for --file, intended for commit lists.
  --model <name>      OpenAI model to use when OPENAI_API_KEY is set.
  --offline           Use deterministic local heuristics only.
  --max-bytes <n>     Reject inputs larger than n bytes. Default: 180000.
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const code = await main();
  process.exitCode = code;
}
