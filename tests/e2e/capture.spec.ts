import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./fixtures";

const SET = [
  "default-390.png",
  "default-390-dark.png",
  "default-834.png",
  "default-834-dark.png",
  "default-1440.png",
  "default-1440-dark.png",
  "default-390-reduced.png",
].sort();

test.describe.configure({ timeout: 180_000 });

function capture(args: string[]) {
  const out = mkdtempSync(path.join(tmpdir(), "capture-"));
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/capture-states.ts", "--out", out, ...args],
    { encoding: "utf8" },
  );
  return { out, run };
}

function written(out: string): string[] {
  try {
    return readdirSync(out).sort();
  } catch {
    return [];
  }
}

test("C4 / with key default writes the full set, every file non-empty", () => {
  const { out, run } = capture(["--route", "/", "--keys", "default"]);
  try {
    expect(run.status, run.stderr).toBe(0);
    expect(written(out)).toEqual(SET);
    for (const name of SET) {
      expect(statSync(path.join(out, name)).size).toBeGreaterThan(1000);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("C4 --expect 404 on /no-such-page writes the same set", () => {
  const { out, run } = capture([
    "--route",
    "/no-such-page",
    "--keys",
    "default",
    "--expect",
    "404",
  ]);
  try {
    expect(run.status, run.stderr).toBe(0);
    expect(written(out)).toEqual(SET);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("C4 a status other than --expect exits non-zero and writes nothing", () => {
  for (const args of [
    ["--route", "/no-such-page", "--keys", "default"],
    ["--route", "/", "--keys", "default", "--expect", "404"],
  ]) {
    const { out, run } = capture(args);
    try {
      expect(run.status).not.toBe(0);
      expect(run.stderr).toMatch(/Nothing written/);
      expect(written(out)).toEqual([]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }
});
