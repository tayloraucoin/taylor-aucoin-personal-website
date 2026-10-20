import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { showcaseIntakeRoutes, websiteRoutes } from "@/lib/routes";

/** SITE-24: the page moves to /websites, the intake stays put (D-SITE-160). */

const TOKEN = "tok_synthetic123";
const ENGAGEMENT = "eng_synthetic123";

test("C3 websiteRoutes.coded is /websites", () => {
  assert.equal(websiteRoutes.coded, "/websites");
  assert.equal(websiteRoutes.platform, "/websites/platform");
});

test("C3 showcaseIntakeRoutes build the strings they build on main", () => {
  assert.deepEqual(
    {
      start: showcaseIntakeRoutes.start,
      cookiePath: showcaseIntakeRoutes.cookiePath,
      entry: showcaseIntakeRoutes.entry(TOKEN),
      step: showcaseIntakeRoutes.step(TOKEN, "about"),
      done: showcaseIntakeRoutes.done(TOKEN),
      review: showcaseIntakeRoutes.review(TOKEN),
      addOns: showcaseIntakeRoutes.addOns(ENGAGEMENT),
    },
    {
      start: "/websites/coded/intake",
      cookiePath: "/websites/coded/intake",
      entry: "/websites/coded/intake/tok_synthetic123",
      step: "/websites/coded/intake/tok_synthetic123/about",
      done: "/websites/coded/intake/tok_synthetic123/done",
      review: "/websites/coded/intake/tok_synthetic123/review",
      addOns: "/websites/coded/intake/add-ons?engagement=eng_synthetic123",
    },
  );
});

test("C4 the chooser and the old coded page are gone", () => {
  for (const file of [
    "components/websites/TrackDoors.tsx",
    "components/websites/TrackPicker.tsx",
    "content/websites-chooser.ts",
    "app/websites/coded/page.tsx",
  ]) {
    assert.equal(existsSync(file), false, file);
  }
});

const INTAKE_TREES = ["app/websites/coded/intake", "app/websites/intake"];

function sourceFiles(dir: string): string[] {
  if (INTAKE_TREES.includes(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

/** Block comments, JSX comments and line comments (not `://` inside a URL). */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

test("C4 no string outside the intake trees holds /websites/coded but as its intake", () => {
  const offenders = ["app", "components", "content"]
    .flatMap(sourceFiles)
    .filter((file) =>
      /["'`]\/websites\/coded(?!\/intake)/.test(
        stripComments(readFileSync(file, "utf8")),
      ),
    );
  assert.deepEqual(offenders, []);
});
