import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { isProtectedIntakePath } from "./intake-idioms";

/**
 * C-SITE-intake-coded-12: an intake restyle changes no money, session or save
 * path. Every commit whose subject starts with a listed ticket's id is read
 * from git, and none may touch a protected path. Each intake ticket adds its id.
 */
const TICKETS = ["SITE-28", "SITE-29", "SITE-30"] as const;

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

/**
 * A subject match can only be blind, never wrong: requiring one SITE-30 commit
 * since the branch left main turns a stray prefix into a failure (SITE-30 C2).
 */
for (const ticket of ["SITE-30", "SITE-31"]) {
  test(`${ticket} C2 at least one commit since main has a subject starting ${ticket}:`, () => {
    const base = git("merge-base", "HEAD", "main").trim();
    const subjects = git("log", "--format=%s", `${base}..HEAD`).split("\n");
    assert.ok(subjects.some((subject) => subject.startsWith(`${ticket}:`)));
  });
}

/**
 * SITE-31 C2: the legal restyle changes classes only, never the documents'
 * text and version or the consent control behind /privacy.
 */
function isProtectedLegalPath(path: string): boolean {
  return (
    path === "content/legal.ts" ||
    path.startsWith("lib/legal/") ||
    path.startsWith("components/analytics/") ||
    path.startsWith("lib/analytics/")
  );
}

test("SITE-31 C2 no SITE-31 commit touches the legal text or the consent control", () => {
  assert.deepEqual(changedPathsFor("SITE-31").filter(isProtectedLegalPath), []);
});

test("SITE-31 C2 the legal matcher flags each protected path and passes a page", () => {
  for (const path of [
    "content/legal.ts",
    "lib/legal/version.ts",
    "components/analytics/ConsentBanner.tsx",
    "lib/analytics/events.ts",
  ]) {
    assert.equal(isProtectedLegalPath(path), true, path);
  }
  assert.equal(isProtectedLegalPath("app/privacy/page.tsx"), false);
});
