import { readFile } from "node:fs/promises";

export async function readInput(path: string | undefined, maxBytes: number): Promise<string> {
  const content = path && path !== "-" ? await readFile(path, "utf8") : await readStdin();
  const normalized = content.trim();

  if (!normalized) {
    throw new Error("No input was provided. Pass --file <path> or pipe content through stdin.");
  }

  if (Buffer.byteLength(normalized, "utf8") > maxBytes) {
    throw new Error(`Input is larger than --max-bytes (${maxBytes}). Provide a smaller diff or file.`);
  }

  return normalized;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}
