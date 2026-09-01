/**
 * Mechanical proof for the track cartridge (PORT-1).
 *
 * Runs without a database or a network: everything it checks is pure. The
 * registries, the flavour resolver, and the markdown generator are all
 * functions of their inputs, which is exactly what makes them verifiable here
 * rather than by clicking through a form.
 *
 *   yarn verify:tracks            # assertions only
 *   yarn verify:tracks --document # print the durable document, for diffing
 *
 * The `--document` mode is the regression oracle for the durable track. Render
 * it on the commit before a refactor, render it after, diff the two: the whole
 * byte-for-byte guarantee in one command. The fixture is deliberately fake —
 * no real client, no real business, no real name (house law: no fabricated or
 * real client data in fixtures, and a plausible-looking fake is the worse of
 * the two failures).
 */

import {
  fieldKeysFor,
  findStep,
  flavourFor,
  labelFor,
  nextStep,
  previousStep,
  schemaFor,
  stepByNumber,
  stepCountFor,
  stepsFor,
} from "@/lib/intake/tracks";
import type { IntakeAnswers } from "@/lib/types/intake";
import type { Engagement } from "@/server/services/engagement";
import { renderIntakeMarkdown } from "@/server/services/output";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.error(`FAIL  ${label}`);
    console.error(`      expected: ${JSON.stringify(expected)}`);
    console.error(`      actual:   ${JSON.stringify(actual)}`);
    return;
  }
  console.log(`ok    ${label}`);
}

/* ── Criterion 2 — the seam resolves both tracks ─────────────────────────── */

function checkResolution(): void {
  check("durable step count", stepCountFor("durable"), 9);
  check("showcase step count", stepCountFor("showcase"), 9);

  check(
    "durable step keys",
    stepsFor("durable").map((s) => s.key),
    [
      "business",
      "pricing",
      "operations",
      "positioning",
      "voice",
      "photos",
      "reviews",
      "team",
      "access",
    ],
  );

  check(
    "showcase step keys",
    stepsFor("showcase").map((s) => s.key),
    [
      "about",
      "audience",
      "experience",
      "work",
      "taste",
      "words",
      "media",
      "site",
      "access",
    ],
  );

  check("durable slug resolves", findStep("durable", "operations")?.number, 3);
  check("showcase slug resolves", findStep("showcase", "work")?.number, 4);
  check(
    "foreign slug does not resolve on durable",
    findStep("durable", "work"),
    undefined,
  );
  check(
    "foreign slug does not resolve on showcase",
    findStep("showcase", "operations"),
    undefined,
  );

  check(
    "shared key resolves per track",
    [findStep("durable", "access")?.title, findStep("showcase", "access")?.title],
    ["Accounts and access", "Accounts and access"],
  );

  check(
    "schema lookup is track-scoped",
    [
      schemaFor("durable", "business") !== undefined,
      schemaFor("durable", "about"),
      schemaFor("showcase", "about") !== undefined,
      schemaFor("showcase", "business"),
    ],
    [true, undefined, true, undefined],
  );

  const third = stepByNumber("showcase", 3);
  check("stepByNumber", third.key, "experience");
  check("nextStep", nextStep("showcase", third)?.key, "work");
  check("previousStep", previousStep("showcase", third)?.key, "audience");
  check("nextStep at the end", nextStep("showcase", stepByNumber("showcase", 9)), null);
  check("previousStep at the start", previousStep("showcase", stepByNumber("showcase", 1)), null);

  check(
    "durable labels still resolve",
    labelFor("durable", "customerProvides"),
    "What the customer must provide",
  );
  check("unknown label falls back to the key", labelFor("showcase", "nope"), "nope");

  check(
    "durable field keys come from the schema",
    fieldKeysFor("durable", "positioning").includes("whatYouAreNot"),
    true,
  );
}

/* ── Criterion 2 — flavour resolution (D-PORT-5) ─────────────────────────── */

function withDisciplines(disciplines?: string[]): IntakeAnswers {
  return disciplines ? { about: { disciplines } } : {};
}

function checkFlavour(): void {
  check(
    "one shipped discipline earns its pack",
    flavourFor("showcase", withDisciplines(["film"])),
    "film",
  );
  check(
    "two disciplines fall back to generic",
    flavourFor("showcase", withDisciplines(["film", "photography"])),
    "generic",
  );
  check(
    "an unshipped discipline falls back to generic",
    flavourFor("showcase", withDisciplines(["photography"])),
    "generic",
  );
  check(
    "no discipline falls back to generic",
    flavourFor("showcase", withDisciplines([])),
    "generic",
  );
  check(
    "an unanswered start form falls back to generic",
    flavourFor("showcase", withDisciplines()),
    "generic",
  );
  check(
    "durable is always generic",
    flavourFor("durable", withDisciplines(["film"])),
    "generic",
  );

  // The one intro that flexes, and the one that does not.
  const film = stepsFor("showcase", "film")[3]!;
  const generic = stepsFor("showcase", "generic")[3]!;

  check(
    "film work intro",
    film.intro,
    "Now the work itself — the films, videos, and projects the last step's career produced. Add as many as you want; there's no cap. Don't aim for polished — aim for honest, and lead with what you'd show first.",
  );
  check(
    "generic work intro",
    generic.intro,
    "Now the work itself — the pieces the last step's career produced. Add as many as you want; there's no cap. Don't aim for polished — aim for honest, and lead with what you'd show first.",
  );
  check(
    "unflexed intros are identical across packs",
    stepsFor("showcase", "film")[1]!.intro === stepsFor("showcase", "generic")[1]!.intro,
    true,
  );
}

/* ── Criterion 3 — registry copy matches the v2 doc, verbatim ────────────── */

function checkShowcaseCopy(): void {
  const steps = stepsFor("showcase");

  check(
    "showcase titles",
    steps.map((s) => s.title),
    [
      "About you",
      "Who this site is for",
      "Experience and proof",
      "The work",
      "Taste",
      "Your words",
      "Media",
      "The site itself",
      "Accounts and access",
    ],
  );

  check(
    "step 2 intro",
    steps[1]!.intro,
    "This site isn't for you — it's for the person deciding whether to work with you. This step is about who that is.",
  );
  check(
    "step 3 intro",
    steps[2]!.intro,
    "Think of this as the LinkedIn layer: positions, memberships, ongoing roles — the timeline your career sits on. The individual films and projects that timeline produced come in the next step. This one is where you've worked, taught, founded, and belonged.",
  );
  check(
    "step 5 intro",
    steps[4]!.intro,
    "This is how we skip the part where a designer shows you three drafts you don't like. Below are real sites from across the whole spectrum. Go with your gut — the pattern in your reactions is what we're after.",
  );
  check(
    "step 6 intro",
    steps[5]!.intro,
    "Most bios read like a stranger wrote them in a hurry. This step is how we make the site sound like you.",
  );
  check(
    "step 7 intro",
    steps[6]!.intro,
    "Project images live with their projects back in step 4. This step is everything else — and original files beat compressed copies every time.",
  );
  check(
    "step 8 intro",
    steps[7]!.intro,
    "The shape of the thing — what pages exist and what each one is for. Five pages are included in the build; extra pages are $150 each, and we'll always confirm with you before anything is charged. Project detail pages don't count — they come with the work section.",
  );
  check("steps 1 and 9 carry no intro", [steps[0]!.intro, steps[8]!.intro], [undefined, undefined]);
  check(
    "no showcase step claims ink emphasis",
    steps.filter((s) => s.emphasis).length,
    0,
  );
}

/* ── Criterion 5 — the durable regression oracle ─────────────────────────── */

const FIXTURE_ANSWERS: IntakeAnswers = {
  business: {
    businessName: "Example Detailing",
    legalName: "Example Detailing Ltd.",
    whatYouDo: "Mobile car detailing",
    howLong: "Since 2019",
    insured: "no",
    gstRegistered: "yes",
  },
  pricing: {
    services: [
      { name: "Interior clean", price: "from $180", duration: "3 hours" },
      { name: "Full detail", price: "$400" },
    ],
    minimumJob: "$150",
    whenTheyPay: "On completion",
  },
  operations: {
    customerProvides: ["nothing"],
    whatYouBring: "Water, power, everything",
    areasCovered: "North Shore",
    daysWorked: ["mon", "tue", "wed"],
  },
  positioning: {
    idealCustomer: "Someone who keeps a car ten years",
    valueOne: "On time",
    valueTwo: "No upselling",
  },
  voice: { neverSay: "Passionate", recordingConsent: true },
  photos: { logoStatus: "have_one", coloursYouUse: "Dark green" },
  reviews: { reviewSources: ["google"], bestReviews: "Four short ones", publishPermission: false },
  team: { justYou: "yes" },
  access: { ownsDomain: "yes", domainName: "example.test", emailAtDomain: "unsure" },
};

function fixtureEngagement(): Engagement {
  const at = new Date("2026-08-20T17:00:00.000Z");

  return {
    id: "00000000-0000-4000-8000-000000000000",
    createdAt: at,
    updatedAt: at,
    answers: FIXTURE_ANSWERS,
    businessName: "Example Detailing",
    completedAt: at,
    contactEmail: "someone@example.test",
    contactName: "Sample Person",
    contactPhone: "000-000-0000",
    currency: "cad",
    currentStep: 9,
    depositAmountCents: 60000,
    depositRequired: true,
    lastActivityAt: at,
    paidAt: at,
    projectSummary: "A five-page site.",
    sentAt: at,
    startedAt: at,
    termsAcceptedAt: at,
    termsVersion: "2026-08-21",
    tokenExpiresAt: at,
    track: "durable",
    status: "complete",
  };
}

function durableDocument(): string {
  return renderIntakeMarkdown({
    engagement: fixtureEngagement(),
    files: [
      {
        fieldKey: "voice_note",
        originalName: "memo.m4a",
        sizeBytes: 2_400_000,
        uploadedAt: new Date("2026-08-20T17:00:00.000Z"),
        url: "https://example.test/signed",
      },
      {
        fieldKey: "photos",
        originalName: "van.heic",
        sizeBytes: 3_100_000,
        uploadedAt: new Date("2026-08-20T17:00:00.000Z"),
        url: null,
      },
    ],
    generatedAt: new Date("2026-08-20T17:00:00.000Z"),
  });
}

function main(): void {
  if (process.argv.includes("--document")) {
    process.stdout.write(durableDocument());
    return;
  }

  checkResolution();
  checkFlavour();
  checkShowcaseCopy();

  // The document renders at all, and still reports the durable flags. Byte
  // equality against the previous commit is the `--document` mode's job.
  const document = durableDocument();
  check(
    "durable document still flags the known risks",
    [
      document.includes("Names differ"),
      document.includes('Customer provides "nothing"'),
      document.includes("Insurance not confirmed"),
      document.includes("Unsure whether email runs on that domain"),
    ],
    [true, true, true, true],
  );
  check(
    "durable document names its unanswered fields by label",
    document.includes("**Not answered**") ||
      document.includes("## Not answered"),
    true,
  );
  check(
    "durable document renders no raw keys for answered fields",
    document.includes("**whatYouDo:**"),
    false,
  );

  console.log(
    failures === 0
      ? "\nAll cartridge checks passed."
      : `\n${failures} check(s) failed.`,
  );
  if (failures > 0) process.exitCode = 1;
}

main();
