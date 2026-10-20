import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { isProtectedIntakePath } from "./intake-idioms";

/**
 * C-SITE-intake-coded-12: an intake restyle changes no money, session or save
 * path. Every commit whose subject starts with a listed ticket's id is read
 * from git, and none may touch a protected path. Each intake ticket adds its id.
 */
const TICKETS = ["SITE-28", "SITE-29"] as const;

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" });
}

function changedPathsFor(ticket: string): string[] {
  const commits = git("log", "--all", "--format=%H%x09%s")
    .split("\n")
    .filter((line) => line.split("\t")[1]?.startsWith(`${ticket}:`))
    .map((line) => line.split("\t")[0]!);
  return commits.flatMap((sha) =>
    git("show", "--name-only", "--format=", sha).split("\n").filter(Boolean),
  );
}

for (const ticket of TICKETS) {
  test(`${ticket} C2 no ${ticket} commit touches server/, _actions/, lib/intake/ or lib/extras/`, () => {
    assert.deepEqual(changedPathsFor(ticket).filter(isProtectedIntakePath), []);
  });
}

test("SITE-28 C2 the matcher flags each protected path and passes a component", () => {
  for (const path of [
    "server/services/deposit.ts",
    "app/websites/intake/[token]/_actions/pay.ts",
    "lib/intake/tracks.ts",
    "lib/extras/cart.ts",
  ]) {
    assert.equal(isProtectedIntakePath(path), true, path);
  }
  assert.equal(
    isProtectedIntakePath("app/websites/intake/_components/field.tsx"),
    false,
  );
});
