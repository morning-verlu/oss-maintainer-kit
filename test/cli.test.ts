import { describe, expect, it } from "vitest";
import { main } from "../src/cli.js";

describe("cli", () => {
  it("rejects unknown commands", async () => {
    const code = await withCapturedOutput(() => main(["unknown"]));
    expect(code).toBe(1);
  });

  it("prints help", async () => {
    const code = await withCapturedOutput(() => main(["--help"]));
    expect(code).toBe(0);
  });
});

async function withCapturedOutput(callback: () => Promise<number>): Promise<number> {
  const stdout = process.stdout.write;
  const stderr = process.stderr.write;

  process.stdout.write = (() => true) as typeof process.stdout.write;
  process.stderr.write = (() => true) as typeof process.stderr.write;

  try {
    return await callback();
  } finally {
    process.stdout.write = stdout;
    process.stderr.write = stderr;
  }
}
