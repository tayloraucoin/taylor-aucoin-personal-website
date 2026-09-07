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
  ingestionFieldsFor,
  PRIMER_FIELDS,
  staleIngestionKeys,
  staleInventoryKeys,
} from "@/lib/intake/showcase-primer-fields";
import {
  canonicalEntry,
  mergeIngestion,
  statusFor,
  type IngestionOutcome,
} from "@/lib/intake/ingestion-record";
import type { PrimerProposal } from "@/lib/intake/primer-proposal";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import { showcaseKinds } from "@/lib/intake/tracks";
import {
  byteCeilingFor,
  leavesInfrastructure,
  MAX_LINKS,
  parseLinks,
  sourceKindOf,
} from "@/lib/intake/source-kinds";
import { readOffice } from "@/server/services/document-reading";
import {
  GOLDEN_SET,
  INGESTION_SET,
  readCaseDocument,
  type GoldenCase,
} from "./evals/business-primer/cases";
import {
  grade,
  quoteIsGrounded,
  type CaseResult,
} from "./evals/business-primer/grade";
import { grade as gradeEntries } from "./evals/extraction/grade";
import { buildDeckPdf } from "./evals/sources/deck-pdf";
import {
  buildDocx,
  buildOpaque,
  buildPptx,
  DECK_LINES,
  DECK_PAGES,
  DOCX_EXPECTED,
  PPTX_EXPECTED,
} from "./evals/sources/fixtures";
import {
  composedLines,
  missingLines,
  selfTest as sourceGraderSelfTest,
} from "./evals/sources/grade";

const mode = process.argv.includes("--inventory")
  ? "inventory"
  : process.argv.includes("--self-test")
    ? "self-test"
    : process.argv.includes("--sources")
      ? "sources"
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

  checkIngestionInventory();
}

/* ── PORT-18 — the kind-scoped ingestion inventory ───────────────────────── */

/**
 * The hand-written parts of `ingestionFieldsFor` are the gating sets, and the
 * two things that can go wrong with them are drift (a key that left the
 * schema) and leakage (a key one kind is never asked reaching that kind's
 * run). Both are mechanical. The leakage check reads the same registry the
 * step components do, so it proves the inventory against the screen rather
 * than against a second list.
 */
function checkIngestionInventory(): void {
  console.log("\nIngestion inventory (PORT-18)\n");

  const stale = staleIngestionKeys();
  if (stale.length > 0) {
    fail(`ingestion gating keys no longer in any showcase schema: ${stale.join(", ")}`);
  } else {
    pass("every ingestion gating key exists in a schema");
  }

  const kinds = showcaseKinds().map((k) => k.key);
  const keysFor = (kind: ShowcaseKind) =>
    new Set(ingestionFieldsFor(kind).map((f) => f.key));

  // The venture-only questions never reach a portfolio's run, and the
  // portfolio's "how long" never reaches a venture's.
  const portfolio = keysFor("portfolio");
  const venture = keysFor("venture");
  const leaked = ["stage", "stageDetail", "signOff", "cantSay", "requiredWording", "toolsDetail"]
    .filter((key) => portfolio.has(key));
  if (leaked.length > 0) fail(`venture-only keys in the portfolio inventory: ${leaked.join(", ")}`);
  else pass("no venture-only key reaches a portfolio's run");
  if (venture.has("howLong")) fail("howLong reaches a venture's run, which asks stage instead");
  else pass("a venture's run is not asked how long");
  if (!venture.has("stage") && !venture.has("signOff")) {
    fail("a venture's run lost its own questions");
  }

  // Nothing radio-backed, reveal-gated, add-on-gated, or an input box, on any kind.
  const never = ["siteKind", "justYou", "ownsDomain", "howToReach", "registrar", "embedFormLink", "bookingWhat", "logoFeeling", "peoplePaste", "dump", "fastWay", "businessPrimer", "extraPagesPlan"];
  const reached = kinds.flatMap((kind) => never.filter((key) => keysFor(kind).has(key)).map((key) => `${kind}.${key}`));
  if (reached.length > 0) fail(`format-unsafe keys in an ingestion inventory: ${reached.join(", ")}`);
  else pass("no radio-backed, gated, or input field reaches any kind's run");

  for (const kind of kinds) {
    console.log(`      ${kind}: ${keysFor(kind).size} fields`);
  }
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

/* ── PORT-18 — the merge's laws, without a database ─────────────────────── */

/**
 * `mergeIngestion` is where "a client's own words are never overwritten" and
 * "arrays append" become mechanism. Each fixture below is one law; a merge
 * that quietly starts replacing an answer would turn every later run green
 * while doing the one thing the feature must never do.
 */
function runMergeSelfTest(): void {
  console.log("\nMerge self-test (PORT-18)\n");

  const outcome: IngestionOutcome = {
    fields: [
      { fieldKey: "whatYouDo", stepKey: "about", value: "A brand studio", quote: "q", assumed: false },
      { fieldKey: "basedIn", stepKey: "about", value: "Halifax", quote: "q", assumed: false },
      { fieldKey: "whoMattersMost", stepKey: "audience", value: "Producers", quote: "q", assumed: false },
    ],
    batches: [
      {
        stage: "experience",
        stepKey: "experience",
        entries: [
          { what: "Founder", where: "Marrow & Vane", when: "2019–now" },
          { what: "", where: "", when: "" },
        ],
      },
    ],
    failed: [],
    sourceChars: 10,
    sourceDigest: "x",
  };

  const current = {
    about: { whatYouDo: "Already mine", basedIn: "" },
    experience: {
      experience: [
        { entryKey: "keep00000001", what: "Kept", where: "", when: "" },
        { entryKey: "blank0000001", what: "", where: "", when: "" },
      ],
    },
  };

  const { patch, fields } = mergeIngestion(current, outcome);

  if (patch.about?.whatYouDo !== "Already mine") fail("merge overwrote a client's own answer");
  else pass("a client's own answer is never overwritten");

  if (patch.about?.basedIn !== "Halifax") fail("merge did not fill a blank field");
  else pass("a blank field is filled");

  if (fields.some((f) => f.fieldKey === "whatYouDo")) fail("the record claims a value it did not write");
  else pass("the record only names what was written");

  const experience = patch.experience?.experience as Array<Record<string, string>> | undefined;
  if (!experience || experience.length !== 2) {
    fail(`append kept ${experience?.length ?? 0} entries, expected 2 (kept + added; blanks dropped)`);
  } else if (experience[0]?.entryKey !== "keep00000001" || !experience[1]?.entryKey) {
    fail("append reordered or unkeyed an entry");
  } else {
    pass("arrays append after existing entries, blanks dropped, keys minted");
  }

  const entryMark = fields.find((f) => f.entryKey);
  if (!entryMark || entryMark.value !== canonicalEntry(experience![1]!)) {
    fail("an entry's provenance does not match its canonical form");
  } else {
    pass("an entry's provenance is its canonical form");
  }

  if (patch.audience?.whoMattersMost !== "Producers") fail("an untouched step object was not created");
  else pass("a step with no current answers receives its value");

  if (statusFor([], []) !== "refused") fail("statusFor: nothing written should be refused");
  if (statusFor(fields, ["projects"]) !== "partial") fail("statusFor: a failed stage should be partial");
  if (statusFor(fields, []) !== "ran") fail("statusFor: a clean run should be ran");
  pass("status follows what landed and what did not");
}

/* ── PORT-21 — reading a file, without a model ───────────────────────────── */

/**
 * The half of source reading that needs nothing but this machine.
 *
 * A DOCX and a PPTX are zip archives of XML, so reading them is parsing rather
 * than inference — which means it can be graded exactly rather than judged.
 * The fixtures are built here from the text they should read back as, and
 * every one of them carries a trap that a naive reader falls into: an escaped
 * ampersand, an angle bracket, a tab-separated row, a field code that is not
 * prose, and slide 10 sorting before slide 2.
 */
function checkSources(): void {
  console.log("\nSource reading — local (PORT-21)\n");

  for (const failure of sourceGraderSelfTest()) fail(`grader: ${failure}`);
  if (sourceGraderSelfTest().length === 0) {
    pass("the transcription graders catch invention, omission, and reordering");
  }

  // The routing table. Which kind a file takes decides whether its bytes ever
  // leave this machine, so it is asserted rather than assumed.
  const routes: ReadonlyArray<[string, string | null, string]> = [
    ["deck.pdf", "application/pdf", "pdf"],
    ["scan.PDF", null, "pdf"],
    ["flyer.png", "image/png", "image"],
    ["shot.jpeg", null, "image"],
    ["one-pager.docx", null, "office"],
    ["deck.pptx", null, "office"],
    ["notes.txt", null, "text"],
    ["prices.csv", null, "text"],
    ["deck.key", null, "unsupported"],
    ["pitch.pages", null, "unsupported"],
    ["reel.mp4", "video/mp4", "unsupported"],
    ["everything.zip", null, "unsupported"],
    ["photo.heic", null, "unsupported"],
    // No extension worth trusting, so the MIME type decides.
    ["deck", "application/pdf", "pdf"],
    ["untitled", null, "unsupported"],
  ];
  const misrouted = routes
    .filter(([name, mime, expected]) => sourceKindOf(name, mime) !== expected)
    .map(([name]) => name);
  if (misrouted.length > 0) fail(`misrouted: ${misrouted.join(", ")}`);
  else pass(`${routes.length} file kinds route as expected`);

  // Only two kinds may send bytes anywhere, and both carry a ceiling.
  const leaves = (["pdf", "image", "office", "text", "unsupported"] as const).filter(
    (kind) => leavesInfrastructure(kind),
  );
  check2("only PDFs and images leave this machine", leaves.join(","), "pdf,image");
  check2(
    "both of them carry a byte ceiling",
    leaves.every((kind) => (byteCeilingFor(kind) ?? 0) > 0),
    true,
  );

  // The readers themselves, against structurally real OOXML.
  let docx = "";
  try {
    docx = readOffice(buildDocx(), "docx");
  } catch (error) {
    fail(`docx reader threw: ${error instanceof Error ? error.message : "unknown"}`);
  }
  check2("a docx reads back exactly, entities and tabs included", docx, DOCX_EXPECTED);
  check2(
    "a docx field code is not read as prose",
    docx.includes("MERGEFORMAT"),
    false,
  );

  let pptx = "";
  try {
    pptx = readOffice(buildPptx(), "pptx");
  } catch (error) {
    fail(`pptx reader threw: ${error instanceof Error ? error.message : "unknown"}`);
  }
  check2("a pptx reads back in slide order, 10 after 2", pptx, PPTX_EXPECTED);

  // A file that is not a readable kind is never opened.
  check2(
    "an opaque file routes to unsupported rather than being parsed",
    sourceKindOf("deck.key", null),
    "unsupported",
  );
  check2("the opaque fixture is bytes, not text", buildOpaque().length > 0, true);

  // Links. The fetch happens on Anthropic's infrastructure rather than ours,
  // so this is not our SSRF boundary — but a client who typed an internal
  // address has made a mistake either way, and every one of these must come
  // back named rather than silently fetching nothing.
  const refusals: ReadonlyArray<[string, string]> = [
    ["file:///etc/passwd", "scheme"],
    ["ftp://example.com/x", "scheme"],
    ["http://localhost:3000/admin", "private"],
    ["http://127.0.0.1/", "private"],
    ["https://169.254.169.254/latest/meta-data/", "private"],
    ["http://[::1]/", "private"],
    ["https://intranet/", "private"],
    ["https://printer.local/", "private"],
    // Unparseable rather than private: it never resolves to a host at all.
    ["not a url at all", "malformed"],
  ];
  const wrong = refusals
    .filter(([line, reason]) => {
      const parsed = parseLinks(line);
      return parsed.urls.length > 0 || parsed.rejected[0]?.reason !== reason;
    })
    .map(([line]) => line);
  if (wrong.length > 0) fail(`links not refused as expected: ${wrong.join(", ")}`);
  else pass(`${refusals.length} private, malformed, and non-web links are refused`);

  const good = parseLinks(
    "https://example.com/a\nexample.org/b\n  \nhttps://example.com/a\nhttps://example.net/c",
  );
  check2("a bare host is accepted and normalised", good.urls[1], "https://example.org/b");
  check2("a duplicate is dropped silently", good.urls.length, 3);

  const many = parseLinks(
    Array.from({ length: MAX_LINKS + 3 }, (_, i) => `https://example.com/${i}`).join("\n"),
  );
  check2(`at most ${MAX_LINKS} links are fetched`, many.urls.length, MAX_LINKS);
  check2("the rest are reported, not dropped", many.rejected.length, 3);
  check2("and reported as over the limit", many.rejected[0]?.reason, "over_limit");
}

/** `check`, but counted into this file's own pass/fail vocabulary. */
function check2(label: string, actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    pass(label);
    return;
  }
  fail(`${label}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
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

/**
 * Runs the ingestion cases against an implementation of the run.
 *
 * Grades the field stage with the primer's grader and every entry stage with
 * the extractor's, per case; asserts the kind scope mechanically; and, where a
 * case names `alsoAs`, runs the same document under a second kind and fails
 * if any field outside that kind's inventory came back. Takes the
 * implementation as a parameter for the reason `runGoldenSet` does.
 */
export async function runIngestionSet(
  runIngest: (kind: ShowcaseKind, document: string) => Promise<IngestionOutcome>,
): Promise<number> {
  console.log(`\nIngestion live run — n = ${INGESTION_SET.length} cases\n`);

  let proposalsTotal = 0;
  let entriesTotal = 0;

  for (const goldenCase of INGESTION_SET) {
    const spec = goldenCase.ingestion!;
    const document = readCaseDocument(goldenCase);

    let outcome: IngestionOutcome;
    try {
      outcome = await runIngest(spec.kind, document);
    } catch (error) {
      fail(`${goldenCase.id} — the run threw: ${error instanceof Error ? error.message : "unknown"}`);
      continue;
    }

    const result = grade(goldenCase, document, outcome.fields);
    proposalsTotal += outcome.fields.length;
    report(goldenCase, result, outcome.fields);
    // Keys only — enough to judge a ceiling without printing a fixture's text.
    console.log(`      fields: ${outcome.fields.map((f) => f.fieldKey).join(", ") || "none"}`);
    if (!result.passed) failures += 1;

    const allowed = new Set(ingestionFieldsFor(spec.kind).map((f) => f.key));
    const outside = outcome.fields.filter((f) => !allowed.has(f.fieldKey)).map((f) => f.fieldKey);
    if (outside.length > 0) fail(`${goldenCase.id} — fields outside the ${spec.kind} inventory: ${outside.join(", ")}`);

    for (const batch of outcome.batches) {
      // `accounts` is not a model stage — it is the step-1 links box turned
      // into step-10 entries by `accountsFromLinks`, appended beside the run
      // rather than produced by it. There is no prompt here to grade, and
      // `runIngestion` never emits one, so this is belt to that brace.
      if (batch.stage === "accounts") continue;

      const expect = spec.entries?.[batch.stage] ?? {};
      const graded = gradeEntries(
        {
          id: `${goldenCase.id}/${batch.stage}`,
          mode: batch.stage,
          what: goldenCase.intent,
          blob: document,
          expect: { minEntries: expect.min, maxEntries: expect.max, blankFields: expect.blankFields, grounded: true },
        },
        batch.entries,
      );
      entriesTotal += batch.entries.length;
      const bad = graded.ungrounded.length > 0 || graded.wrongBlanks.length > 0 || !graded.countOk;
      if (bad) failures += 1;
      console.log(`      ${bad ? "!" : "·"} ${batch.stage}: ${batch.entries.length} entries${graded.countOk ? "" : " (count out of range)"}`);
      for (const u of graded.ungrounded) console.log(`        UNGROUNDED ${u.field}: ${JSON.stringify(u.value)}`);
      for (const b of graded.wrongBlanks) console.log(`        FILLED BLANK ${b}`);
      // A count out of range is a judgment call between a reaching model and a
      // wrong expectation, and it cannot be made from a number. The entries
      // print so a human can decide which it is. Safe to print: every fixture
      // in this set is synthetic and committed — it is a *client's* material
      // that never reaches a log, and none of that passes through here.
      if (!graded.countOk) {
        for (const entry of batch.entries) {
          const summary = Object.entries(entry)
            .filter(([key, value]) => key !== "entryKey" && value.trim())
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join(" · ");
          console.log(`        ${summary}`);
        }
      }
    }
    for (const [stage, expect] of Object.entries(spec.entries ?? {})) {
      if (expect?.min && !outcome.batches.some((b) => b.stage === stage)) {
        fail(`${goldenCase.id} — stage ${stage} produced nothing; expected at least ${expect.min}`);
      }
    }
    if (outcome.failed.length > 0) console.log(`      stages that threw: ${outcome.failed.join(", ")}`);

    if (spec.alsoAs) {
      try {
        const other = await runIngest(spec.alsoAs, document);
        const otherAllowed = new Set(ingestionFieldsFor(spec.alsoAs).map((f) => f.key));
        const leaked = other.fields.filter((f) => !otherAllowed.has(f.fieldKey)).map((f) => f.fieldKey);
        if (leaked.length > 0) fail(`${goldenCase.id} as ${spec.alsoAs} — leaked: ${leaked.join(", ")}`);
        else pass(`${goldenCase.id} as ${spec.alsoAs} — ${other.fields.length} fields, none outside that kind`);
      } catch (error) {
        fail(`${goldenCase.id} as ${spec.alsoAs} — threw: ${error instanceof Error ? error.message : "unknown"}`);
      }
    }
  }

  console.log(`\nn = ${INGESTION_SET.length} cases, ${proposalsTotal} fields and ${entriesTotal} entries total. ${failures} failures.\n`);
  return failures;
}

/**
 * Grades a transcription of a file whose true text is known.
 *
 * This is the only place in the system that can catch an invented sentence in
 * a rendering, and the reason is worth stating: the ingestion run verifies a
 * quote against the text it holds, and for a read file that text is this
 * stage's own output — so a fabrication here is verified against itself later.
 * Only a fixture built from known text can tell the difference.
 *
 * Composition is the hard rule and omission is the soft one. A transcription
 * that misses a line is a worse reading of the page; one that adds a line is a
 * claim about a business nobody made.
 */
export async function runSourceSet(
  transcribe: (
    bytes: Uint8Array,
    kind: "pdf" | "image",
    mimeType: string,
  ) => Promise<{ text: string; truncated: boolean }>,
  fetch: (url: string) => Promise<
    { url: string; ok: true; text: string } | { url: string; ok: false; error: string }
  >,
): Promise<number> {
  console.log(`\nSource reading — live, n = 1 file (${DECK_PAGES.length} pages)\n`);

  const pdf = await buildDeckPdf();
  console.log(`      built a ${DECK_PAGES.length}-page PDF, ${pdf.length} bytes`);

  let result;
  try {
    result = await transcribe(pdf, "pdf", "application/pdf");
  } catch (error) {
    fail(`the transcription threw: ${error instanceof Error ? error.message : "unknown"}`);
    return failures;
  }

  if (result.truncated) fail("the transcription hit its output ceiling on a 8-page deck");
  else pass("the transcription completed within its output ceiling");

  const composed = composedLines(DECK_LINES, result.text);
  if (composed.length > 0) {
    fail(`${composed.length} line(s) in the transcription are not on the page:`);
    for (const line of composed) console.log(`      INVENTED ${JSON.stringify(line)}`);
  } else {
    pass("every line of the transcription is on the page");
  }

  const missing = missingLines(DECK_LINES, result.text);
  console.log(
    `\n      Recall — ${DECK_LINES.length - missing.length} of ${DECK_LINES.length} lines.`,
  );
  for (const line of missing) console.log(`      missed  ${JSON.stringify(line)}`);
  if (missing.length > 0) {
    console.log("      A missed line is a worse reading, not an invention. Soft.");
  }

  const pages = [...result.text.matchAll(/---\s*page\s+\d+\s*---/gi)].length;
  console.log(`      Page markers: ${pages} for ${DECK_PAGES.length} pages.`);

  // The link path, on pages chosen because their behaviour is stable: one that
  // exists and one that does not. A fetch failure must be a returned value
  // rather than a throw, or one dead link in ten would cost the other nine.
  console.log("\n      Links —");
  const live = await fetch("https://example.com/");
  if (live.ok) pass("a real page fetches and returns its text");
  else fail(`a real page did not fetch (${live.error})`);

  const absent = await fetch("https://example.com/this-page-does-not-exist-9f3a");
  if (!absent.ok) {
    pass(`a missing page fails as a value, not a throw (${absent.error})`);
  } else {
    fail("a missing page reported success");
  }

  console.log(`\nn = 1 file, ${DECK_LINES.length} known lines. ${failures} failures.\n`);
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
    runMergeSelfTest();
  } else if (mode === "sources") {
    checkSources();
  } else {
    checkInventory();
    runSelfTest();
    runMergeSelfTest();
    checkSources();

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

/**
 * Only when this file is what was run.
 *
 * `runGoldenSet` is exported for `eval-primer-live.ts`, and importing a module
 * that exits the process on load is not an export anyone can use.
 */
if (process.argv[1]?.endsWith("eval-primer.ts")) void main();
