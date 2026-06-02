import { MissingApiKeyError, runWithOpenAI } from "../core/openai.js";
import { runOffline } from "../core/offline.js";
import type { TaskRequest, TaskResult } from "../core/types.js";

export async function runTask(request: TaskRequest): Promise<TaskResult> {
  if (request.options.offline) {
    return runOffline(request);
  }

  try {
    return await runWithOpenAI(request);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return runOffline(request);
    }
    throw error;
  }
}
