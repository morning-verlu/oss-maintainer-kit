import OpenAI from "openai";
import { buildInput, buildInstructions } from "./prompts.js";
import type { TaskRequest, TaskResult } from "./types.js";

export class MissingApiKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not set.");
    this.name = "MissingApiKeyError";
  }
}

export async function runWithOpenAI(request: TaskRequest): Promise<TaskResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: request.options.model,
    instructions: buildInstructions(request.kind),
    input: buildInput(request.kind, request.input)
  });

  const output = response.output_text?.trim();
  if (!output) {
    throw new Error("OpenAI returned an empty response.");
  }

  return {
    output,
    provider: "openai",
    model: request.options.model,
    warnings: []
  };
}
