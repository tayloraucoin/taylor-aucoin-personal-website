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
  copyPackFor,
  fieldKeysFor,
  findStep,
  flavourFor,
  flavourForKind,
  showcaseCopySlots,
  showcaseFlavours,
  groupsFor,
  kindAsks,
  personVoiceOptionsFor,
  showcaseDisciplines,
  showcaseKinds,
  workShapeFor,
  labelFor,
  nextStep,
  previousStep,
  schemaFor,
  stepByNumber,
  stepCountFor,
  stepsFor,
} from "@/lib/intake/tracks";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import { EMPTY_EXAMPLE_SET } from "@/content/intake-examples";
import {
  captureNotes,
  publishBlockers,
} from "@/lib/intake/example-site-rules";
import {
  EXAMPLE_GROUPS,
  GROUP_ORDER,
  tagsFor,
} from "@/content/intake-examples/taxonomy";
import { hostOf, picksOf } from "@/lib/intake/taste-picks";
import { RETIRED_TASTE_KEYS } from "@/lib/intake/showcase-answer-labels";
import { stepTasteSchema } from "@/lib/validators/showcase-intake";
import type { IntakeAnswers } from "@/lib/types/intake";
import type { Engagement } from "@/server/services/engagement";
import { renderIntakeMarkdown } from "@/server/services/output";
import { readStepAnswers } from "@/server/services/submission";

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
  // Ten since PORT-18 (2026-09-03); the durable track stays at nine.
  check("showcase step count", stepCountFor("showcase"), 10);

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
      "ingest",
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
  check("showcase slug resolves", findStep("showcase", "work")?.number, 5);
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

  const fourth = stepByNumber("showcase", 4);
  check("stepByNumber", fourth.key, "experience");
  check("nextStep", nextStep("showcase", fourth)?.key, "work");
  check("previousStep", previousStep("showcase", fourth)?.key, "audience");
  check("nextStep at the end", nextStep("showcase", stepByNumber("showcase", 10)), null);
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

  // The discipline list, widened 2026-09-03. Keys are storage: the v2 five
  // must survive, no key may repeat, and every key must be a stable identifier
  // the answers document can hold. Only `film` earns a pack — a new key that
  // silently mapped to film's pack is how the film-shaped-strings bug shipped
  // the first time.
  const disciplines = showcaseDisciplines();
  check(
    "the v2 disciplines are still stored under their original keys",
    ["film", "photography", "design", "illustration", "music"].every((key) =>
      disciplines.some((d) => d.key === key),
    ),
    true,
  );
  check(
    "no discipline key repeats",
    disciplines
      .map((d) => d.key)
      .filter((key, index, all) => all.indexOf(key) !== index),
    [],
  );
  check(
    "every discipline key is a stable identifier and every label is written",
    disciplines.filter((d) => !/^[a-z]+$/.test(d.key) || !d.label.trim()),
    [],
  );
  check(
    "film is the only discipline with a pack of its own",
    disciplines
      .filter((d) => flavourFor("showcase", withDisciplines([d.key])) !== "generic")
      .map((d) => d.key),
    ["film"],
  );

  // The one intro that flexes, and the one that does not.
  const film = stepsFor("showcase", "film")[4]!;
  const generic = stepsFor("showcase", "generic")[4]!;

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
    stepsFor("showcase", "film")[2]!.intro === stepsFor("showcase", "generic")[2]!.intro,
    true,
  );
}

/* ── PORT-11 — the kind cartridge ────────────────────────────────────────── */

/** An engagement as the answers document actually holds one. */
function withAnswers(about: Record<string, unknown>): IntakeAnswers {
  return { about };
}

/**
 * Whether a copy slot actually says something.
 *
 * A slot is a string, a list of options, or a label/help pair — and an empty
 * one of any of those is a hole a client would read as a blank line, not a
 * fall-through. Recursing into the object shapes is what stops a half-filled
 * `{ label, help }` from passing because the object exists.
 */
function isResolved(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return Object.values(value).every(isResolved);
  }
  return false;
}

function checkKinds(): void {
  const kinds = showcaseKinds();

  check("six kinds", kinds.length, 6);

  // Every kind resolves to a pack. A kind with no pack would render a step 4
  // titled `undefined` and nobody would find out until a client did.
  check(
    "every kind resolves to a pack",
    kinds.map((k) => flavourForKind(k.key, undefined)),
    // "other" reads the entity pack, not generic: it carries a roster and a
    // documents drop, and the portfolio pack would ask an organisation for
    // "Your projects". See DEVIATIONS 2026-09-01.
    ["generic", "practice", "entity", "venture", "service", "entity"],
  );

  // Every pack resolves every slot, fall-through included. This is what makes
  // a blank cell in the copy scope a fall-through rather than a hole
  // (M-PORT-22): PORT-12 filled four packs against this assertion, and a slot
  // added to the type without a floor is already a compile error.
  const unresolved = showcaseFlavours.flatMap((flavour) => {
    const pack = copyPackFor(flavour) as Record<string, unknown>;
    return showcaseCopySlots
      .filter((slot) => !isResolved(pack[String(slot)]))
      .map((slot) => `${flavour}.${String(slot)}`);
  });
  check("every pack resolves every slot", unresolved, []);

  // The disciplines answer reaches exactly one branch: a portfolio's.
  check(
    "only a portfolio's pack moves with its disciplines",
    [
      flavourForKind("portfolio", ["film"]),
      flavourForKind("studio", ["film"]),
      flavourForKind("venture", ["film"]),
    ],
    ["film", "entity", "venture"],
  );

  // The derivation (M-PORT-21). Every engagement that predates the kind
  // question must resolve to exactly the pack it resolved to yesterday.
  check(
    "a pre-PORT-11 portfolio still earns its film pack",
    flavourFor(
      "showcase",
      withAnswers({ siteKinds: ["portfolio"], disciplines: ["film"] }),
    ),
    "film",
  );
  check(
    "a pre-PORT-11 consultant derives the practice pack",
    flavourFor("showcase", withAnswers({ siteKinds: ["consultant"] })),
    "practice",
  );
  check(
    "a pre-PORT-11 engagement with no site kind is a portfolio",
    flavourFor("showcase", withAnswers({ disciplines: ["film"] })),
    "film",
  );
  check(
    "the derivation is deterministic when two were checked",
    flavourFor(
      "showcase",
      withAnswers({ siteKinds: ["consultant", "studio"] }),
    ),
    "practice",
  );

  // A stored kind wins over the derivation, and a bogus one is not fatal.
  check(
    "a stored kind wins over the retired answer",
    flavourFor(
      "showcase",
      withAnswers({ siteKind: "venture", siteKinds: ["portfolio"] }),
    ),
    "venture",
  );
  check(
    "an unrecognised kind falls back rather than throwing",
    flavourFor("showcase", withAnswers({ siteKind: "nonsense" })),
    "generic",
  );

  // Step 4's title and step 2's intro come from the pack. These are the two
  // registry strings that flex, and the titles are the visible proof that a
  // venture and a filmmaker meet different questionnaires.
  check(
    "step 4's title per pack",
    (["generic", "film", "practice", "entity", "venture", "service"] as const).map(
      (flavour) => stepsFor("showcase", flavour)[4]!.title,
    ),
    [
      "The work",
      "The work",
      "What you offer",
      "The work",
      "What you're building",
      "What you offer",
    ],
  );
  check(
    "step 2's intro flexes for the entity and service packs",
    [
      stepsFor("showcase", "generic")[2]!.intro,
      stepsFor("showcase", "venture")[2]!.intro,
      stepsFor("showcase", "service")[2]!.intro,
    ],
    [
      "This site isn't for you — it's for the person deciding whether to work with you. This step is about who that is.",
      "This site isn't for you — it's for the person deciding whether to work with you, join you, or back you. This step is about who that is.",
      "This site isn't for you — it's for the person deciding whether to call you. This step is about who that is.",
    ],
  );

  // Every option value a client can store must have a label in the document,
  // or their answer prints as a raw key (the failure the label map exists to
  // prevent). Values are shared across packs where the meaning is shared.
  const optionKeys = showcaseFlavours.flatMap((flavour) => {
    const pack = copyPackFor(flavour);
    return [
      ...pack.audiences,
      ...pack.organizationOptions,
      ...pack.pages,
      ...pack.reachExtraOptions,
      ...pack.tools.options,
      ...(pack.stage?.options ?? []),
    ].map((option) => option.value);
  });
  check(
    "every option value is a non-empty stable key",
    optionKeys.filter((value) => !/^[a-zA-Z]+$/.test(value)),
    [],
  );

  // The person-voice example, which used to name one real client on every
  // engagement (D-PORT-14). Entity packs speak as "we".
  check(
    "person-voice examples per pack",
    (["generic", "film", "practice", "entity", "venture", "service"] as const).map(
      (flavour) => personVoiceOptionsFor(flavour, "Holistica")[0]!.label,
    ),
    [
      'First — "I make…"',
      'First — "I direct…"',
      'First — "I work with…"',
      'First — "We build…"',
      'First — "We build…"',
      'First — "We do…"',
    ],
  );

  // The per-kind presence facts (M-ADM-7). These were three inline comparisons
  // in three step components and a `Record` in a fourth until ADM-4; the table
  // below is the behaviour they had on the commit before the move, so a change
  // to any of them is a deliberate edit here rather than a silent one there.
  //
  // Two of the old comparisons were spelled identically and meant different
  // things — `portfolio || practice` for the roles question, `portfolio ||
  // practice` for the portrait question — which is why they are asserted
  // separately rather than as one flag.
  check(
    "which kinds are asked for roles",
    kinds.filter((k) => kindAsks(k.key, "roles")).map((k) => k.key),
    ["portfolio", "practice"],
  );
  check(
    "which kinds are asked for a portrait rather than a place",
    kinds.filter((k) => kindAsks(k.key, "portrait")).map((k) => k.key),
    ["portfolio", "practice"],
  );
  check(
    "which kinds are asked where the video lives",
    kinds.filter((k) => kindAsks(k.key, "video")).map((k) => k.key),
    ["portfolio", "studio"],
  );
  check(
    "which kinds the start form asks for a name",
    kinds.filter((k) => kindAsks(k.key, "name")).map((k) => k.key),
    ["practice", "studio", "venture", "business", "other"],
  );
  check(
    "which kinds the start form asks for disciplines",
    kinds.filter((k) => kindAsks(k.key, "disciplines")).map((k) => k.key),
    ["portfolio", "studio"],
  );
  check(
    "which array each kind's step 4 fills",
    kinds.map((k) => workShapeFor(k.key)),
    ["projects", "offerings", "projects", "pieces", "services", "services"],
  );
  // The reel question is derived from the work shape, never stored beside it:
  // two fields can disagree and a derivation cannot.
  check(
    "only a back-catalogue kind is asked which piece leads",
    kinds
      .filter((k) => workShapeFor(k.key) === "projects")
      .map((k) => k.key),
    ["portfolio", "studio"],
  );

  // Groups are a property of the kind, not of the pack.
  const groups = (kind: ShowcaseKind) => [...groupsFor(kind)].sort();
  check("a portfolio carries no extra groups", groups("portfolio"), []);
  check(
    "a venture carries every group",
    groups("venture"),
    ["ask", "claims", "documents", "roster", "stage"],
  );
  check("a practice carries the ask and the claims", groups("practice"), [
    "ask",
    "claims",
  ]);
}

/* ── PORT-13 — changing the kind changes questions, never answers ────────── */

/**
 * The D-PORT-11 proof, at the layer where it is actually true.
 *
 * The reassurance line under step 1's kind picker promises that changing the
 * kind keeps everything already written. That promise is kept by the shape of
 * the answers document rather than by the component: every group's answers live
 * under their own keys, and the step's shape guard keeps a key whether or not
 * the current kind renders an input for it.
 *
 * So the test is a round trip through the guard: a venture's roster and stage
 * survive being re-read as a portfolio, and survive coming back.
 */
function checkKindChangeIsNonDestructive(): void {
  const guard = schemaFor("showcase", "about")!;

  /**
   * Key order is Zod's, not the input's, and it carries no meaning in a JSONB
   * document. Sorting before comparison keeps this test about what survived
   * rather than about the order a schema happens to declare its fields in.
   */
  const canon = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canon);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, canon(v)]),
      );
    }
    return value;
  };

  const venture = {
    siteKind: "venture",
    displayName: "A project",
    stage: "raising",
    justYou: "no",
    showTeam: "yes",
    leadPerson: "abc123abc123",
    people: [
      { entryKey: "abc123abc123", name: "A", role: "Founder", line: "Leads it" },
      { entryKey: "def456def456", name: "B", role: "Adviser", line: "" },
    ],
    roles: [{ role: "Director" }],
    leadRole: "Director",
    howLong: "Since 2019",
  };

  const asPortfolio = guard.parse({ ...venture, siteKind: "portfolio" });
  const backAgain = guard.parse({ ...(asPortfolio as object), siteKind: "venture" });

  check(
    "a venture's roster and stage survive being read as a portfolio",
    canon(asPortfolio),
    canon({ ...venture, siteKind: "portfolio" }),
  );
  check("and survive the trip back", canon(backAgain), canon(venture));

  // The portfolio-only answers survive the other direction too, which is the
  // same promise read from the other end.
  check(
    "a portfolio's roles survive being read as a venture",
    canon(
      guard.parse({
        roles: [{ role: "Director" }],
        leadRole: "Director",
        siteKind: "venture",
      }),
    ),
    canon({ roles: [{ role: "Director" }], leadRole: "Director", siteKind: "venture" }),
  );

  // The lead is stored by entry key, so renaming the person keeps them leading.
  const renamed = guard.parse({
    ...venture,
    people: [
      { entryKey: "abc123abc123", name: "A. Renamed", role: "Founder", line: "Leads it" },
      { entryKey: "def456def456", name: "B", role: "Adviser", line: "" },
    ],
  }) as { leadPerson?: string; people?: { entryKey: string }[] };
  check(
    "the lead person is a key, not a name",
    renamed.leadPerson === renamed.people?.[0]?.entryKey,
    true,
  );
}

/* ── PORT-30 — the taste gallery's content rules ─────────────────────────── */

/**
 * The rules a site must hold before a client may meet it.
 *
 * These used to walk six TypeScript files. The sites are rows now, and this
 * script runs with **no database and no network** — which is the property that
 * makes it cheap enough to actually get run, and the property that decided the
 * whole architecture (M-PORT-41).
 *
 * So it exercises the rules against fixtures instead of against content. That
 * is a stronger assertion than the one it replaces: the old checks passed
 * vacuously over six empty sets and would have kept passing if the rule itself
 * had been deleted. These fail if the rule stops working.
 *
 * The same `publishBlockers` runs in front of Taylor at the publish control, so
 * a row cannot be published broken and cannot be published around (M-PORT-47).
 */
function checkGallery(): void {
  const capture = { width: 3024, height: 1964, alt: "The opening view" };

  const whole = {
    name: "Matias Boucard",
    role: "Cinematographer · commercials",
    url: "https://matiasboucard.com",
    group: "dark-cinematic",
    ground: "dark",
    motion: "alive",
    density: "balanced",
    build: "custom",
    styles: ["hover-preview", "grid"],
    checkedOn: "2026-08-22",
    packs: ["film"],
    captures: [capture],
  };

  check("a complete site publishes", publishBlockers(whole), []);

  check(
    "a fourth style tag blocks publication",
    publishBlockers({
      ...whole,
      styles: ["hover-preview", "grid", "serif", "mono"],
    }),
    ["there are 4 style tags and the most is three"],
  );

  // The aspect is a note, not a blocker: a GIF of a hover state and a screen
  // recording of a scroll are the media a `motion: alive` tag is about, and
  // neither is 1512 × 982.
  check(
    "a capture that is not the MacBook aspect still publishes",
    publishBlockers({
      ...whole,
      captures: [{ ...capture, width: 1600, height: 1000 }],
    }),
    [],
  );
  check(
    "…and says so",
    captureNotes([{ width: 1600, height: 1000 }]).length,
    1,
  );
  check(
    "a retina capture is the right shape and draws no note",
    captureNotes([{ width: 3024, height: 1964 }]),
    [],
  );

  check(
    "no media at all blocks publication",
    publishBlockers({ ...whole, captures: [] }),
    ["there's no media"],
  );

  check(
    "a video first blocks publication — the row renders a still",
    publishBlockers({
      ...whole,
      captures: [{ ...capture, mimeType: "video/mp4" }],
    }),
    ["the first item is a video — the row needs an image first"],
  );

  check(
    "media with no alt text blocks publication",
    publishBlockers({ ...whole, captures: [{ ...capture, alt: "" }] }),
    ["the first item has no alt text"],
  );

  check(
    "an unparseable link check blocks publication",
    publishBlockers({ ...whole, checkedOn: "sometime last year" }),
    ["the checked-on date doesn't parse"],
  );

  check(
    "a tag with no words blocks publication",
    publishBlockers({ ...whole, styles: ["chrome-bevel"] }),
    ['"chrome-bevel" isn\'t a style tag we have words for'],
  );

  check(
    "an untagged draft names everything it is missing",
    publishBlockers({ url: "https://x.test", captures: [] }),
    [
      "the name is blank",
      "the role is blank",
      "the group isn't set",
      "an axis isn't set",
      "the build level isn't set",
      "there's no checked-on date",
      "it isn't in any pack",
      "there's no media",
    ],
  );

  // A site belonging to no pack can never be met, which is the one blocker a
  // reader might assume the join handles. It does not: the join can be empty.
  check(
    "a site in no pack blocks publication",
    publishBlockers({ ...whole, packs: [] }),
    ["it isn't in any pack"],
  );
}

/* ── PORT-22 — the taste contract ────────────────────────────────────────── */

function checkTasteContract(): void {
  // The hand-written order against the type-enforced map. Same drift-guard
  // pattern the primer's inventories use: the Record cannot lose a group, but
  // the order list can, and a group missing from it renders nowhere.
  check(
    "every group is ordered exactly once",
    [...GROUP_ORDER].sort(),
    Object.keys(EXAMPLE_GROUPS).sort(),
  );
  check("no group is ordered twice", GROUP_ORDER.length, GROUP_ORDER.length);

  // Every tag on a whole site resolves to words. `tagsFor` is what the row, the
  // overlay, and the document all read, and a value with no words renders as a
  // blank rather than as an error — which is the one failure `taxonomy.ts`
  // exists to prevent.
  check(
    "a whole site's tags all resolve to words",
    tagsFor({
      key: "x",
      name: "X",
      url: "https://x.test",
      role: "Cinematographer",
      group: "dark-cinematic",
      axes: { ground: "dark", motion: "alive", density: "balanced" },
      styles: ["hover-preview", "grid"],
      build: "custom",
      embed: false,
      checkedOn: "2026-08-22",
      captures: [],
    }).filter((tag) => !tag),
    [],
  );

  // The legacy read (M-PORT-35). A favourite is an unscored pick, and the
  // derivation never fires once `picks` exists — including when `picks` is the
  // empty array a client leaves behind by removing the only one they made.
  check(
    "a legacy favourite reads as an unscored pick, note carried",
    picksOf({ favourites: [{ siteKey: "a", note: "the type" }] }),
    [{ siteKey: "a", note: "the type" }],
  );
  check(
    "picks win over favourites when both exist",
    picksOf({
      picks: [{ siteKey: "b", score: 5 }],
      favourites: [{ siteKey: "a", note: "the type" }],
    }),
    [{ siteKey: "b", score: 5 }],
  );
  check(
    "an empty picks array is an answer, not a reason to resurrect favourites",
    picksOf({ picks: [], favourites: [{ siteKey: "a" }] }),
    [],
  );
  check("no taste answers at all reads as no picks", picksOf({}), []);

  // The link as a person reads it. The path is kept on purpose: a Format
  // subdomain's project page is not the same reference as its home page.
  check("hostOf strips the scheme and www", hostOf("https://www.a.com"), "a.com");
  check("hostOf keeps a path", hostOf("https://a.com/hello/x"), "a.com/hello/x");
  check("hostOf drops a trailing slash", hostOf("http://a.com/"), "a.com");
  check("hostOf hands back what it cannot parse", hostOf("not a url"), "not a url");
  check("hostOf on nothing is nothing", hostOf(undefined), "");

  /**
   * The retired keys survive the shape guard.
   *
   * This is the whole risk of the slice in one assertion. `stepTasteSchema` is
   * what every save is filtered through, so a key removed from it is a stored
   * answer erased on the client's next keystroke — silently, on the surface
   * whose supreme law is that answers are never lost.
   */
  const guarded = stepTasteSchema.parse({
    darkOrLight: "deep",
    stillness: "quiet",
    density: "rich",
    linksWorthALook: "a list",
    closeTab: "autoplay music",
    favourites: [{ siteKey: "gone", note: "kept" }],
    notes: { other: "a note" },
    picks: [{ siteKey: "x", score: 7, note: "this one" }],
    references: [{ entryKey: "e1", url: "a.com", score: 3, source: "search" }],
    styleBrief: "dark but warm",
  });
  check(
    "every retired and legacy taste key survives the shape guard",
    Object.keys(guarded).sort(),
    [
      "closeTab", "darkOrLight", "density", "favourites", "linksWorthALook",
      "notes", "picks", "references", "stillness", "styleBrief",
    ].sort(),
  );
  check(
    "the guard keeps a score and refuses to invent one",
    [guarded.picks?.[0]?.score, guarded.references?.[0]?.score],
    [7, 3],
  );
  check(
    "a pick with no score stores no score",
    stepTasteSchema.parse({ picks: [{ siteKey: "x" }] }).picks?.[0]?.score,
    undefined,
  );

  /**
   * The full round trip, without a database.
   *
   * `readStepAnswers` filters the stored object through this same schema on the
   * way *in*, and `saveStepAnswers` replaces the step's object wholesale with
   * what `guardShape` parses on the way *out*. So a step's answers survive a
   * save exactly when the schema keeps them, in both directions — which makes
   * composing the two the honest test, and a stricter one than exercising
   * Drizzle's JSONB merge would be.
   */
  const stored = {
    darkOrLight: "deep",
    stillness: "quiet",
    favourites: [{ siteKey: "gone", note: "kept" }],
    notes: { other: "a note" },
  };
  const readBack = readStepAnswers("showcase", { taste: stored }, "taste");
  const savedAgain = stepTasteSchema.parse({
    ...readBack,
    wordOne: "quiet",
  });
  check(
    "a legacy taste answer survives being read and saved again, unchanged",
    {
      darkOrLight: savedAgain.darkOrLight,
      stillness: savedAgain.stillness,
      favourites: savedAgain.favourites,
      notes: savedAgain.notes,
    },
    stored,
  );

  // The document (criterion 4), and the done screen's agenda (criterion 3).
  const document = showcaseTasteDocument();

  check(
    "the document prints a legacy favourite as an unscored pick",
    document.includes("**Example sites they picked:**") &&
      document.includes("gone-site — no score — \"the hover previews\""),
    true,
  );
  check(
    "the document does not print the same reaction twice",
    document.includes("**Favourite example sites, best first:**"),
    false,
  );

  // The other half, which PORT-22 could only reach by hand-editing a content
  // file: a pick whose site *is* in the set prints the whole line — name, host,
  // score, note, archetype, the three axes, and the build level Taylor curates
  // against and no client ever sees (D-PORT-15).
  const picked = showcasePickDocument();
  check(
    "a resolved pick prints its name, host, score, note, tags, and build level",
    picked.includes(
      'Sample Person (sample.test/work) — 6/7 — "the type" · Dark and cinematic · dark · alive · balanced · Custom build',
    ),
    true,
  );
  check(
    "the private build level never reaches a client-facing string",
    picked.includes("Custom build") && !document.includes("Custom build"),
    true,
  );
  check(
    "the document prints the old note map as words, not [object Object]",
    document.includes("[object Object]"),
    false,
  );
  check(
    "the document still prints a retired answer under its own label",
    document.includes("**What the site sits on:** deep"),
    true,
  );
  check(
    "no retired question is listed as something to cover on the call",
    [...RETIRED_TASTE_KEYS].filter((key) =>
      document
        .slice(document.indexOf("## Not answered"))
        .includes(labelFor("showcase", key)),
    ),
    [],
  );
  check(
    "the shortfall flag stays silent while no set is curated",
    document.includes("were asked for"),
    false,
  );
}

/**
 * A coded engagement whose taste answers are entirely PORT-7's shape.
 *
 * The case the legacy read exists for: someone who answered the old gallery
 * before 2026-09-03 and has never opened the new one. Nothing about their
 * stored answers is migrated, so the document has to make sense of them as
 * they are.
 */
function showcaseTasteDocument(): string {
  const at = new Date("2026-09-04T17:00:00.000Z");

  return renderIntakeMarkdown({
    engagement: {
      ...fixtureEngagement(),
      track: "showcase",
      answers: {
        about: { displayName: "Sample Person", whatYouDo: "Makes things" },
        taste: {
          favourites: [{ siteKey: "gone-site", note: "the hover previews" }],
          notes: { another: "too busy" },
          darkOrLight: "deep",
          wordOne: "quiet",
        },
      },
    },
    files: [],
    generatedAt: at,
    // No gallery, which is what this fixture has always rendered against: all
    // six sets were empty when it was written, so the pick prints by its stored
    // key with a marker. Passed explicitly now, so the assertion below is about
    // the legacy read rather than about a set that happened to be empty.
    gallery: EMPTY_EXAMPLE_SET,
  });
}

/**
 * The same document, against a set that *does* hold the picked site.
 *
 * PORT-22 could only reach this by hand-editing a content file to
 * `curated: true` on a developer machine. With the gallery a parameter, the
 * whole pick line — name, host, score, note, group, axes, and the private
 * build level — is assertable here, with no database and no network
 * (M-PORT-41, M-PORT-47).
 */
function showcasePickDocument(): string {
  const at = new Date("2026-09-04T17:00:00.000Z");

  return renderIntakeMarkdown({
    engagement: {
      ...fixtureEngagement(),
      track: "showcase",
      answers: {
        about: { displayName: "Sample Person", whatYouDo: "Makes things" },
        taste: {
          picks: [{ siteKey: "sample-site", score: 6, note: "the type" }],
        },
      },
    },
    files: [],
    generatedAt: at,
    gallery: {
      curated: true,
      sites: [
        {
          key: "sample-site",
          name: "Sample Person",
          url: "https://sample.test/work",
          role: "Cinematographer · commercials",
          group: "dark-cinematic",
          axes: { ground: "dark", motion: "alive", density: "balanced" },
          styles: ["hover-preview"],
          build: "custom",
          embed: false,
          checkedOn: "2026-08-22",
          captures: [],
        },
      ],
    },
  });
}

/* ── PORT-12 — every key the document will print has a label ─────────────── */

/**
 * The keys PORT-13, PORT-14, and PORT-15 introduce, from kinds scope §6.6.
 *
 * Listed here rather than derived because the schemas do not carry them yet:
 * PORT-12's job is to land their labels *before* the slices that store them, so
 * the intake document never prints a raw key on the first engagement that uses
 * one. When those slices land, the schema sweep below covers them too.
 */
const FORTHCOMING_KEYS = [
  "stage", "justYou", "showTeam", "people", "name", "line", "leadPerson",
  "offerings", "pieces", "services", "format", "scope", "pricePosture",
  "price", "included", "duration", "takesLonger", "status",
  "asks", "ask", "getWhat", "number", "mechanism", "destination", "visibility",
  "signOff", "cantSay", "requiredWording",
  "tools", "toolsDetail",
  "headshot", "place", "documents",
] as const;

function checkLabels(): void {
  check(
    "every forthcoming key already has a document label",
    FORTHCOMING_KEYS.filter((key) => labelFor("showcase", key) === key),
    [],
  );

  // The standing sweep: nothing already in a schema prints as its raw key.
  const unlabelled = stepsFor("showcase").flatMap((step) =>
    fieldKeysFor("showcase", step.key)
      .filter((key) => labelFor("showcase", key) === key)
      .map((key) => `${step.key}.${key}`),
  );
  check("every showcase schema field has a label", unlabelled, []);
}

/* ── Criterion 3 — registry copy matches the v2 doc, verbatim ────────────── */

function checkShowcaseCopy(): void {
  const steps = stepsFor("showcase");

  check(
    "showcase titles",
    steps.map((s) => s.title),
    [
      "Everything you already have",
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
    steps[2]!.intro,
    "This site isn't for you — it's for the person deciding whether to work with you. This step is about who that is.",
  );
  check(
    "step 3 intro",
    steps[3]!.intro,
    "Think of this as the LinkedIn layer: positions, memberships, ongoing roles — the timeline your career sits on. The individual films and projects that timeline produced come in the next step. This one is where you've worked, taught, founded, and belonged.",
  );
  check(
    "step 5 intro",
    steps[5]!.intro,
    "This is how we skip the part where a designer shows you three drafts you don't like. Below are real sites from across the whole spectrum. Go with your gut — the pattern in your reactions is what we're after.",
  );
  check(
    "step 6 intro",
    steps[6]!.intro,
    "Most bios read like a stranger wrote them in a hurry. This step is how we make the site sound like you.",
  );
  check(
    "step 7 intro",
    steps[7]!.intro,
    "Project images live with their projects back in step 4. This step is everything else — and original files beat compressed copies every time.",
  );
  check(
    "step 8 intro",
    steps[8]!.intro,
    "The shape of the thing — what pages exist and what each one is for. Five pages are included in the build; extra pages are $150 each, and we'll always confirm with you before anything is charged. Project detail pages don't count — they come with the work section.",
  );
  // The v2 numbering: "About you" and "Accounts and access" carry no intro.
  // The ingestion step in front of them does, and it is the pack's.
  check("about and access carry no intro", [steps[1]!.intro, steps[9]!.intro], [undefined, undefined]);
  check(
    "the ingestion step's title and intro are the pack's, on every pack",
    showcaseFlavours.every((flavour) => {
      const first = stepsFor("showcase", flavour)[0]!;
      const pack = copyPackFor(flavour).ingestion;
      return first.key === "ingest" && first.title === pack.title && first.intro === pack.intro;
    }),
    true,
  );
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
    // The durable track has no taste step and no gallery; this is the fact, not
    // a placeholder. The byte-for-byte guarantee below is what it protects.
    gallery: EMPTY_EXAMPLE_SET,
    files: [
      {
        id: "file-voice-note",
        fieldKey: "voice_note",
        originalName: "memo.m4a",
        sizeBytes: 2_400_000,
        uploadedAt: new Date("2026-08-20T17:00:00.000Z"),
        url: "https://example.test/signed",
      },
      {
        id: "file-photos",
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

  // Prints every pack as a client would meet it, so Taylor's copy pass can be
  // read top to bottom rather than diffed out of a nested object literal.
  if (process.argv.includes("--packs")) {
    for (const flavour of showcaseFlavours) {
      process.stdout.write(`\n## ${flavour}\n\n`);
      const pack = copyPackFor(flavour) as Record<string, unknown>;
      for (const slot of showcaseCopySlots) {
        process.stdout.write(
          `${String(slot)}: ${JSON.stringify(pack[String(slot)])}\n`,
        );
      }
    }
    return;
  }

  checkResolution();
  checkFlavour();
  checkKinds();
  checkLabels();
  checkGallery();
  checkTasteContract();
  checkKindChangeIsNonDestructive();
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
