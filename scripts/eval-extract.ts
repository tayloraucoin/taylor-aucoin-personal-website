/**
 * The extraction eval (PORT-17).
 *
 *   yarn eval:extract --shapes      # output shapes track the entry schemas. Pure.
 *   yarn eval:extract --self-test   # proves the graders catch what they claim to. Pure.
 *   yarn eval:extract               # the live run against the golden set.
 *
 * Same three-mode shape as `eval:primer`, for the same reason: two of these
 * belong in a pre-commit habit and the third costs money and needs a key.
 *
 * The live run reports every case with its n and prints ungrounded values in
 * full, because an ungrounded value is the failure this feature exists to
 * prevent and a count of them is not actionable.
 */

import {
  EXTRACTION_MODES,
  sortDocument,
  ExtractionUnavailableError,
  type ExtractionMode,
} from "@/server/services/extract";
import {
  experienceEntrySchema,
  offeringEntrySchema,
  personEntrySchema,
  pieceEntrySchema,
  projectEntrySchema,
  serviceEntrySchema,
} from "@/lib/validators/showcase-intake";
import { GOLDEN_SET } from "./evals/extraction/cases";
import { grade, selfTest } from "./evals/extraction/grade";

const mode = process.argv.includes("--shapes")
  ? "shapes"
  : process.argv.includes("--self-test")
    ? "self-test"
    : "live";

let failures = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`FAIL  ${m}`);
};
const ok = (m: string) => console.log(`ok    ${m}`);

/** The forms whose fields the extractor is allowed to fill. */
const FORM_SHAPES: Record<ExtractionMode, { shape: Record<string, unknown> }> = {
  experience: experienceEntrySchema,
  projects: projectEntrySchema,
  people: personEntrySchema,
  offerings: offeringEntrySchema,
  pieces: pieceEntrySchema,
  services: serviceEntrySchema,
};

function checkShapes(): void {
  // One mode per array key, and no mode for asks (M-PORT-24).
  const expected = [
    "experience",
    "projects",
    "people",
    "offerings",
    "pieces",
    "services",
  ];
  if (JSON.stringify([...EXTRACTION_MODES]) !== JSON.stringify(expected)) {
    fail(`mode list drifted: ${EXTRACTION_MODES.join(", ")}`);
  } else {
    ok("six modes, one per array key");
  }

  if ((EXTRACTION_MODES as readonly string[]).includes("asks")) {
    fail("an asks mode exists — mechanism and destination are decisions, not facts");
  } else {
    ok("no asks mode");
  }

  // Every mode's form shape is reachable, and the golden set covers each of
  // the four new ones. An uncovered mode is a prompt nobody has ever graded.
  for (const m of EXTRACTION_MODES) {
    if (!FORM_SHAPES[m]) fail(`${m} has no form shape`);
  }
  const covered = new Set(GOLDEN_SET.map((c) => c.mode));
  const uncovered = (["people", "offerings", "pieces", "services"] as const).filter(
    (m) => !covered.has(m),
  );
  if (uncovered.length > 0) fail(`no eval case for: ${uncovered.join(", ")}`);
  else ok("every new mode has at least one eval case");

  ok(`${GOLDEN_SET.length} cases across ${covered.size} modes`);
}

async function live(): Promise<void> {
  console.log(`Running ${GOLDEN_SET.length} cases. Each spends one run.\n`);

  for (const testCase of GOLDEN_SET) {
    let entries: Array<Record<string, string>> = [];
    let refused: string | null = null;

    try {
      entries = (await sortDocument(
        testCase.mode,
        testCase.blob,
      )) as Array<Record<string, string>>;
    } catch (error) {
      refused =
        error instanceof ExtractionUnavailableError ? error.reason : "error";
    }

    const result = grade(testCase, entries);
    const bad = result.ungrounded.length > 0 || result.wrongBlanks.length > 0;
    if (bad || !result.countOk) failures += 1;

    console.log(
      `${bad || !result.countOk ? "FAIL" : "ok  "}  ${testCase.id.padEnd(22)} ` +
        `n=${result.entries}${refused ? ` refused=${refused}` : ""}`,
    );
    console.log(`      ${testCase.what}`);
    for (const u of result.ungrounded) {
      console.log(`      UNGROUNDED ${u.field}: ${JSON.stringify(u.value)}`);
    }
    for (const f of result.wrongBlanks) {
      console.log(`      FILLED WHAT SHOULD BE BLANK: ${f}`);
    }
  }
}

async function main(): Promise<void> {
  if (mode === "shapes") {
    checkShapes();
  } else if (mode === "self-test") {
    const problems = selfTest();
    for (const p of problems) fail(p);
    if (problems.length === 0) ok("the graders catch what they claim to");
  } else {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(
        "ANTHROPIC_API_KEY is not set. The live run needs it; --shapes and --self-test do not.",
      );
      process.exitCode = 1;
      return;
    }
    // No engagement needed: the eval grades the prompts through
    // `sortDocument`, which does not touch the per-engagement run counter.
    await live();
  }

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} failed.`);
  if (failures > 0) process.exitCode = 1;
}

void main();
