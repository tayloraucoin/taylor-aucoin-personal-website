import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { FIXTURE_SENTINEL } from "@/lib/page-state";

/**
 * Fails a build whose prerendered HTML would ship a fixture or a placeholder.
 *
 *   yarn check:build-output                      # .next-build/server/app
 *   yarn check:build-output --dir <path>
 *
 * Meaningful only after `VERCEL_ENV=production yarn build:agent`: in any other
 * build a page that awaits `searchParams` is dynamic and writes no HTML, so the
 * check would scan nothing. It treats that as a failure rather than a pass.
 */
const DEFAULT_DIR = ".next-build/server/app";

const RULES: { name: string; pattern: RegExp }[] = [
  {
    name: "fixture sentinel",
    pattern: new RegExp(FIXTURE_SENTINEL.replace(/\./g, "\\.")),
  },
  { name: "draft mark", pattern: /\[draft\]/i },
  {
    name: "bracketed placeholder",
    pattern: /\[(?:ASSUMPTION|PROPOSED|FILL)\b[^\]]*\]/,
  },
];

export type BuildOutputProblem = {
  file: string;
  rule: string;
  excerpt: string;
};
export type BuildOutputResult = {
  scanned: number;
  problems: BuildOutputProblem[];
};

async function listHtmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
}

export async function checkBuildOutput(
  dir: string,
): Promise<BuildOutputResult> {
  const files = await listHtmlFiles(dir);
  const problems: BuildOutputProblem[] = [];

  for (const file of files) {
    const html = await readFile(file, "utf8");
    for (const rule of RULES) {
      const match = rule.pattern.exec(html);
      if (match) {
        problems.push({
          file: path.relative(dir, file),
          rule: rule.name,
          excerpt: match[0],
        });
      }
    }
  }

  return { scanned: files.length, problems };
}

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: { dir: { type: "string", default: DEFAULT_DIR } },
  });
  const dir = path.resolve(values.dir);

  let result: BuildOutputResult;
  try {
    result = await checkBuildOutput(dir);
  } catch (error) {
    console.error(`check:build-output: cannot read ${dir}: ${String(error)}`);
    return 1;
  }

  if (result.scanned === 0) {
    console.error(
      `check:build-output: no prerendered HTML under ${dir}. ` +
        "Run it after VERCEL_ENV=production yarn build:agent.",
    );
    return 1;
  }

  for (const problem of result.problems) {
    console.error(`${problem.file}: ${problem.rule}: ${problem.excerpt}`);
  }
  if (result.problems.length > 0) {
    console.error(
      `check:build-output: ${result.problems.length} problem(s) in ${result.scanned} HTML file(s).`,
    );
    return 1;
  }

  console.log(`check:build-output: ${result.scanned} HTML file(s), clean.`);
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().then((code) => process.exit(code));
}
