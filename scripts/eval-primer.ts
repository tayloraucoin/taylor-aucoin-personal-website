/**
 * The business primer's eval (PORT-10).
 *
 *   yarn eval:primer --inventory   # field-inventory drift check. No API calls.
 *   yarn eval:primer --self-test   # proves the graders catch what they claim to.
 *   yarn eval:primer               # the live run against the golden set.
 *
 * Three modes because two of them are worth running constantly and the third
 * costs money. `--inventory` and `--self-test` are pure: no network, no
 * database, no model. They are the ones that belong in a pre-commit habit.
 *
 * The live run reports every number with its n, and prints case 1's hand-made
 * recall key beside what came back so a human can grade recall. It does not
 * score recall itself. See `evals/business-primer/README.md`.
 */

import {
  PRIMER_FIELDS,
  staleInventoryKeys,
} from "@/lib/intake/showcase-primer-fields";
import type { PrimerProposal } from "@/lib/intake/primer-proposal";
import {
  GOLDEN_SET,
  readCaseDocument,
  type GoldenCase,
} from "./evals/business-primer/cases";
import {
  grade,
  quoteIsGrounded,
  type CaseResult,
} from "./evals/business-primer/grade";

const mode = process.argv.includes("--inventory")
  ? "inventory"
  : process.argv.includes("--self-test")
    ? "self-test"
    : "live";

let failures = 0;

function fail(message: string): void {
  failures += 1;
  console.error(`FAIL  ${message}`);
}

function pass(message: string): void {
  console.log(`ok    ${message}`);
}

/* ── Inventory drift ─────────────────────────────────────────────────────── */

function checkInventory(): void {
  console.log("\nField inventory\n");

  const stale = staleInventoryKeys();
  if (stale.length > 0) {
    fail(
      `hand-written keys no longer in any showcase schema: ${stale.join(", ")}`,
    );
  } else {
    pass("every exclusion, allowlist, and description key exists in a schema");
  }

  const duplicates = PRIMER_FIELDS.map((field) => field.key).filter(
    (key, index, all) => all.indexOf(key) !== index,
  );
  if (duplicates.length > 0) {
    fail(`a field key appears on two steps: ${duplicates.join(", ")}`);
  } else {
    pass("no field key appears twice");
  }

  const missingDescription = PRIMER_FIELDS.filter(
    (field) => !field.description.trim(),
  );
  if (missingDescription.length > 0) {
    fail(
      `fields the model would be shown with no description: ${missingDescription
        .map((field) => field.key)
        .join(", ")}`,
    );
  } else {
    pass("every field carries a description");
  }

  const nonCritical = PRIMER_FIELDS.filter((field) => !field.critical);
  console.log(
    `\n      ${PRIMER_FIELDS.length} fields across ${
      new Set(PRIMER_FIELDS.map((f) => f.stepKey)).size
    } steps; ${nonCritical.length} non-critical (${nonCritical
      .map((f) => f.key)
      .join(", ")}), ${PRIMER_FIELDS.length - nonCritical.length} quote-or-nothing.`,
  );
}

/* ── Grader self-test ────────────────────────────────────────────────────── */

/**
 * The graders are the safety mechanism, so they get their own tests.
 *
 * Each fixture is a proposal set a real failure would produce, paired with the
 * rule that must catch it. A grader that silently stops catching fabricated
 * quotes would otherwise turn every future eval run green.
 */
type SelfTest = {
  name: string;
  caseId: string;
  proposals: PrimerProposal[];
  /** The rule that must fire, or null when the set must grade clean. */
  expect: string | null;
};

/**
 * The one rule a self-test fixture is exempt from.
 *
 * Every fixture below carries one or two proposals to isolate a single rule,
 * which trips the volume floor on cases that expect a fuller read. That floor
 * is about a live run's recall, not about whether a grader works, so it is
 * excluded here — and only here. Every hard rule still applies.
 */
const SELF_TEST_EXEMPT = new Set(["under-reach"]);

function proposal(over: Partial<PrimerProposal>): PrimerProposal {
  return {
    fieldKey: "whatYouDo",
    stepKey: "about",
    value: "A two-person brand studio",
    quote: "Marrow & Vane is a two-person brand studio in Halifax, Nova Scotia.",
    assumed: false,
    ...over,
  };
}

const SELF_TESTS: SelfTest[] = [
  {
    name: "a grounded proposal grades clean",
    caseId: "01-rich-about-page",
    proposals: [proposal({})],
    expect: null,
  },
  {
    name: "a fabricated quote is caught",
    caseId: "01-rich-about-page",
    proposals: [
      proposal({
        quote: "Marrow & Vane has been in business for twelve years.",
      }),
    ],
    expect: "quote-not-found",
  },
  {
    name: "a paraphrase is caught — the check is not fuzzy",
    caseId: "01-rich-about-page",
    proposals: [
      proposal({
        quote: "Marrow and Vane is a small studio of two people in Halifax.",
      }),
    ],
    expect: "quote-not-found",
  },
  {
    name: "a critical field with no quote is caught",
    caseId: "01-rich-about-page",
    proposals: [proposal({ fieldKey: "howLong", quote: null })],
    expect: "unquoted-critical",
  },
  {
    name: "an assumption on a critical field is caught",
    caseId: "01-rich-about-page",
    proposals: [
      proposal({ fieldKey: "credentials", quote: null, assumed: true }),
    ],
    expect: "unquoted-critical",
  },
  {
    name: "an assumption on a non-critical field is allowed",
    caseId: "01-rich-about-page",
    proposals: [
      proposal({
        fieldKey: "howToReach",
        stepKey: "site",
        value: "By email",
        quote: null,
        assumed: true,
      }),
    ],
    expect: null,
  },
  {
    name: "a field outside the inventory is caught",
    caseId: "01-rich-about-page",
    proposals: [proposal({ fieldKey: "darkOrLight", stepKey: "taste" })],
    expect: "unknown-field",
  },
  {
    name: "a field tagged with the wrong step is caught",
    caseId: "01-rich-about-page",
    proposals: [proposal({ stepKey: "audience" })],
    expect: "wrong-step",
  },
  {
    name: "a quote broken by a PDF line-hyphen still verifies",
    caseId: "09-pdf-text-layer",
    proposals: [
      proposal({
        fieldKey: "whatYouDo",
        value: "Landscape design for heritage properties",
        quote:
          "We design gardens for heritage properties in and around Victoria, British Columbia.",
      }),
    ],
    expect: null,
  },
  {
    name: "a quote spanning a flattened DOCX table cell still verifies",
    caseId: "10-docx-flattened-tables",
    proposals: [
      proposal({
        fieldKey: "displayName",
        value: "Haversham & Daughter",
        quote: "Who we are A third-generation upholstery workshop in Winnipeg.",
      }),
    ],
    expect: null,
  },
  {
    name: "reaching past a case ceiling is caught",
    caseId: "04-cv-pasted-in-error",
    proposals: [
      proposal({
        fieldKey: "whatYouDo",
        value: "Senior Producer",
        quote: "Senior Producer, Hollowpine Media — Toronto, 2021 to present",
      }),
      proposal({
        fieldKey: "basedIn",
        value: "Toronto",
        quote: "Producer, Northlight Pictures — Toronto, 2017 to 2021",
      }),
    ],
    expect: "over-reach",
  },
  {
    name: "a forbidden field is caught",
    caseId: "06-unfalsifiable-marketing",
    proposals: [
      proposal({
        fieldKey: "awards",
        stepKey: "experience",
        value: "Recognised for excellence",
        quote: "Trusted by industry leaders. Recognised for excellence.",
      }),
    ],
    expect: "forbidden-field",
  },
  {
    name: "an empty value is caught",
    caseId: "01-rich-about-page",
    proposals: [proposal({ value: "   " })],
    expect: "empty-value",
  },
];

function runSelfTest(): void {
  console.log("\nGrader self-test\n");

  for (const test of SELF_TESTS) {
    const goldenCase = GOLDEN_SET.find((c) => c.id === test.caseId);
    if (!goldenCase) {
      fail(`${test.name} — no such case: ${test.caseId}`);
      continue;
    }

    const document = readCaseDocument(goldenCase);
    const result = grade(goldenCase, document, test.proposals);
    const rules = result.findings
      .map((finding) => finding.rule)
      .filter((rule) => !SELF_TEST_EXEMPT.has(rule));

    if (test.expect === null) {
      if (rules.length === 0) {
        pass(test.name);
      } else {
        fail(`${test.name} — expected no findings, got: ${rules.join(", ")}`);
      }
      continue;
    }

    if (rules.includes(test.expect)) {
      pass(test.name);
    } else {
      fail(
        `${test.name} — expected "${test.expect}", got: ${
          rules.length > 0 ? rules.join(", ") : "no findings"
        }`,
      );
    }
  }

  // The normaliser is load-bearing enough to check directly: it is the one
  // place a too-generous rule would let fabrications through wholesale.
  const doc = readCaseDocument(GOLDEN_SET.find((c) => c.id === "01-rich-about-page")!);

  if (quoteIsGrounded(doc, "we asked better questions than they expected")) {
    pass("a mid-sentence quote verifies");
  } else {
    fail("a mid-sentence quote should verify");
  }

  if (!quoteIsGrounded(doc, "")) {
    pass("an empty quote never verifies");
  } else {
    fail("an empty quote must not verify");
  }

  if (!quoteIsGrounded(doc, "questions better asked we than expected")) {
    pass("reordered words do not verify");
  } else {
    fail("reordered words must not verify");
  }
}

/* ── Live run ────────────────────────────────────────────────────────────── */

/**
 * Runs the golden set against a primer implementation.
 *
 * Takes the implementation as a parameter rather than importing it. The eval
 * is not allowed to depend on the thing it grades: the graders and the golden
 * set have to be runnable, and demonstrably correct, before the service that
 * they judge exists — which is the whole ordering this slice was scoped on.
 * It also means a second implementation (a different model, a different prompt
 * version) is graded by the same harness without touching it.
 */
export async function runGoldenSet(
  runPrimer: (document: string) => Promise<PrimerProposal[]>,
): Promise<number> {
  console.log(`\nLive run — n = ${GOLDEN_SET.length} cases\n`);

  const results: CaseResult[] = [];

  for (const goldenCase of GOLDEN_SET) {
    const document = readCaseDocument(goldenCase);

    let proposals: PrimerProposal[] = [];
    let refused: string | null = null;

    try {
      proposals = await runPrimer(document);
    } catch (error) {
      refused = error instanceof Error ? error.message : "unknown";
    }

    if (goldenCase.expectRefusal) {
      if (refused) {
        pass(`${goldenCase.id} — refused as expected (${refused})`);
      } else {
        fail(`${goldenCase.id} — expected a refusal, got ${proposals.length} proposals`);
      }
      continue;
    }

    if (refused) {
      fail(`${goldenCase.id} — unexpected refusal: ${refused}`);
      continue;
    }

    const result = grade(goldenCase, document, proposals);
    results.push(result);
    report(goldenCase, result, proposals);
    if (!result.passed) failures += 1;
  }

  const hard = results.reduce(
    (total, result) =>
      total + result.findings.filter((f) => f.severity === "hard").length,
    0,
  );
  const soft = results.reduce(
    (total, result) =>
      total + result.findings.filter((f) => f.severity === "soft").length,
    0,
  );
  const proposalsTotal = results.reduce((t, r) => t + r.proposalCount, 0);

  console.log(
    [
      "",
      `n = ${results.length} graded cases, ${proposalsTotal} proposals total.`,
      `${results.filter((r) => r.passed).length} passed, ${
        results.filter((r) => !r.passed).length
      } failed. ${hard} hard findings, ${soft} soft.`,
      "",
      "Recall on case 1 is not scored here. Read the key printed above against",
      "what came back and grade it yourself.",
      "",
    ].join("\n"),
  );

  return failures;
}

function report(
  goldenCase: GoldenCase,
  result: CaseResult,
  proposals: readonly PrimerProposal[],
): void {
  const verdict = result.passed ? "ok  " : "FAIL";
  console.log(
    `${verdict}  ${goldenCase.id} — ${result.proposalCount} proposals`,
  );
  console.log(`      ${goldenCase.intent}`);

  for (const finding of result.findings) {
    console.log(
      `      ${finding.severity === "hard" ? "!" : "·"} ${finding.rule}: ${finding.detail}`,
    );
  }

  if (goldenCase.recallKey) {
    const found = new Set(proposals.map((p) => p.fieldKey));
    const hit = goldenCase.recallKey.filter((key) => found.has(key));
    const missed = goldenCase.recallKey.filter((key) => !found.has(key));
    const extra = [...found].filter((key) => !goldenCase.recallKey!.includes(key));

    console.log(
      `\n      Recall — human judgment required. Key has ${goldenCase.recallKey.length} fields.`,
    );
    console.log(`      found:  ${hit.join(", ") || "none"}`);
    console.log(`      missed: ${missed.join(", ") || "none"}`);
    console.log(`      beyond the key: ${extra.join(", ") || "none"}`);
    console.log(
      "      A field outside the key is not wrong — the key is one person's reading.\n",
    );
  }
}

/* ── Entry ───────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  if (mode === "inventory") {
    checkInventory();
  } else if (mode === "self-test") {
    runSelfTest();
  } else {
    checkInventory();
    runSelfTest();

    if (failures > 0) {
      console.error(
        "\nThe pure checks failed. Fix these before spending money on a live run.\n",
      );
      process.exit(1);
    }

    console.error(
      [
        "",
        "The pure checks pass. The live run needs the primer service.",
        "",
        "`runGoldenSet(runPrimer)` is exported from this file and takes the",
        "implementation as an argument, so it grades whatever is handed to it.",
        "`scripts/eval-primer-live.ts` wires it to server/services/primer.ts and",
        "lands with that service.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
