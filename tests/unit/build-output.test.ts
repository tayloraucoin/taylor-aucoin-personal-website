import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { FIXTURE_SENTINEL } from "@/lib/page-state";
import { checkBuildOutput } from "@/scripts/check-build-output";

const dirs: string[] = [];
after(() => Promise.all(dirs.map((dir) => rm(dir, { recursive: true }))));

const CLEAN =
  '<!DOCTYPE html><html lang="en"><body><main><h1>Plain page</h1>' +
  "<p>Arrays like a[0] and a link [1] are fine.</p></main></body></html>";

/** A temp build directory holding `files`, nested the way Next writes them. */
async function buildDir(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "build-output-"));
  dirs.push(dir);
  for (const [name, html] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, name)), { recursive: true });
    await writeFile(path.join(dir, name), html);
  }
  return dir;
}

function runCli(dir: string) {
  return spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/check-build-output.ts", "--dir", dir],
    { encoding: "utf8" },
  );
}

const BAD: [string, string][] = [
  ["fixture sentinel", `<p>sam@${FIXTURE_SENTINEL}</p>`],
  ["draft mark", "<p>A study [draft]</p>"],
  ["draft mark", "<p>A study [Draft]</p>"],
  ["bracketed placeholder", "<p>[ASSUMPTION: the price]</p>"],
  ["bracketed placeholder", "<p>[PROPOSED]</p>"],
  ["bracketed placeholder", "<p>[FILL client quote]</p>"],
];

for (const [rule, body] of BAD) {
  test(`C5 the check fails a prerendered page holding a ${rule}: ${body}`, async () => {
    const dir = await buildDir({
      "index.html": CLEAN,
      "work/agora.html": CLEAN.replace("</main>", `${body}</main>`),
    });
    const result = await checkBuildOutput(dir);
    assert.equal(result.scanned, 2);
    assert.deepEqual(
      result.problems.map((p) => [p.file, p.rule]),
      [[path.join("work", "agora.html"), rule]],
    );
    assert.equal(runCli(dir).status, 1);
  });
}

test("C5 the check fails a directory with no HTML file at all", async () => {
  const dir = await buildDir({ "page.js": "export {}", "index.rsc": "0:[]" });
  assert.equal((await checkBuildOutput(dir)).scanned, 0);
  const cli = runCli(dir);
  assert.equal(cli.status, 1);
  assert.match(cli.stderr, /no prerendered HTML/);
});

test("C5 the check fails a directory that does not exist", () => {
  assert.equal(runCli(path.join(tmpdir(), "no-such-build-dir")).status, 1);
});

test("C5 the check passes a clean directory", async () => {
  const dir = await buildDir({ "index.html": CLEAN, "about.html": CLEAN });
  const result = await checkBuildOutput(dir);
  assert.deepEqual(result, { scanned: 2, problems: [] });
  const cli = runCli(dir);
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(cli.stdout, /2 HTML file\(s\), clean/);
});
