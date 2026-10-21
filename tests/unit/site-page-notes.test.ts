import assert from "node:assert/strict";
import { test } from "node:test";
import { EMPTY_EXAMPLE_SET } from "@/content/intake-examples";
import { resolvePack, SHOWCASE_FLAVOURS } from "@/lib/intake/showcase-copy";
import {
  SHOWCASE_KIND_KEYS,
  VENTURE_TYPES,
  type VentureType,
} from "@/lib/intake/showcase-kinds";
import {
  askedOf,
  ingestionFieldsFor,
  primerField,
} from "@/lib/intake/showcase-primer-fields";
import {
  addTypedPage,
  boxedPages,
  HOME_BRAIN_DUMP,
  PAGE_BRAIN_DUMP_VALUES,
  pageBrainDumpKey,
  removeTypedPage,
  renameTypedPage,
  sitemapPages,
  type SitemapPage,
} from "@/lib/intake/site-page-notes";
import { labelFor } from "@/lib/intake/tracks";
import {
  INCLUDED_PAGES,
  stepSiteSchema,
} from "@/lib/validators/showcase-intake";
import type { Engagement } from "@/server/services/engagement";
import {
  answerTally,
  collectUnanswered,
  renderIntakeMarkdown,
} from "@/server/services/output";

/** WEB-22: a brain dump per page on step 8, stored, counted, imported, printed. */

const SUBTYPES: (VentureType | null)[] = [
  null,
  ...VENTURE_TYPES.map((entry) => entry.key),
];

/** Every pack a client can meet, overlays included. */
const PACKS = SHOWCASE_FLAVOURS.flatMap((flavour) =>
  SUBTYPES.map((subtype) => resolvePack(flavour, subtype)),
);

const VENTURE = resolvePack("venture");

function labels(pages: readonly SitemapPage[]): string[] {
  return pages.map((page) => page.label);
}

/* ── C1: the stored names ──────────────────────────────────────────────── */

test("WEB-22 C1 every non-home page value in every pack has its own BrainDump key in the site schema", () => {
  const values = new Set(
    PACKS.flatMap((pack) => pack.pages.map((option) => option.value)),
  );
  values.delete("home");
  assert.deepEqual(
    [...values].sort(),
    [...PAGE_BRAIN_DUMP_VALUES].sort(),
    "the value list is exactly the union of every pack's pages",
  );

  const shape = stepSiteSchema.shape as Record<string, unknown>;
  for (const value of values) {
    const key = `${value}BrainDump`;
    assert.equal(pageBrainDumpKey(value), key);
    assert.ok(key in shape, key);
    assert.deepEqual(
      stepSiteSchema.parse({ [key]: " notes " })[key as never],
      "notes",
    );
    assert.notEqual(labelFor("showcase", key), key, `${key} has a label`);
  }
});

test("WEB-22 C1 Home keeps homeBrainDump, typed pages are a list, and no site key is gone", () => {
  const shape = stepSiteSchema.shape as Record<string, unknown>;
  assert.equal(HOME_BRAIN_DUMP, "homeBrainDump");
  assert.ok(!("homeBrainDumpBrainDump" in shape));
  assert.ok(!(PAGE_BRAIN_DUMP_VALUES as readonly string[]).includes("home"));
  assert.deepEqual(
    stepSiteSchema.parse({ pagesCustomBrainDump: ["a", ""] })
      .pagesCustomBrainDump,
    ["a", ""],
  );
  for (const key of [
    "pages",
    "pagesCustom",
    "extraPagesPlan",
    "homeBrainDump",
    "homeMedia",
    "homeVideos",
    "howSeparate",
    "howToReach",
  ]) {
    assert.ok(key in shape, key);
  }
});

/* ── C2: sitemap order ─────────────────────────────────────────────────── */

test("WEB-22 C2 boxes follow the checklist's order, Home first, then named typed pages in row order", () => {
  const sitemap = sitemapPages({
    ticked: ["contact", "home", "team", "about"],
    checklist: VENTURE.pages,
    typed: ["Residency", "  ", "Volunteer days"],
  });
  assert.deepEqual(labels(sitemap), [
    "Home",
    "About",
    "Team",
    "Contact",
    "Residency",
    "Volunteer days",
  ]);
  const home = sitemap[0]!;
  assert.equal(home.source === "listed" && home.key, "homeBrainDump");
  const about = sitemap[1]!;
  assert.equal(about.source === "listed" && about.key, "aboutBrainDump");
  // The blank row is no page; the next keeps its own position.
  const volunteer = sitemap[5]!;
  assert.equal(volunteer.source === "typed" && volunteer.index, 2);
});

test("WEB-22 C2 a ticked value the pack does not list still counts, after the listed pages", () => {
  const sitemap = sitemapPages({
    ticked: ["home", "reel"],
    checklist: VENTURE.pages,
    typed: [],
  });
  assert.deepEqual(
    sitemap.map((page) => page.source === "listed" && page.key),
    ["homeBrainDump", "reelBrainDump"],
  );
});

/* ── C3: the count ─────────────────────────────────────────────────────── */

test("WEB-22 C3 boxes stop at the included pages plus pages bought, typed pages counting", () => {
  const sitemap = sitemapPages({
    ticked: ["home", "about", "vision", "team"],
    checklist: VENTURE.pages,
    typed: ["One", "Two", "Three"],
  });
  assert.equal(sitemap.length, 7);
  assert.equal(INCLUDED_PAGES, 5);

  const included = boxedPages(sitemap, INCLUDED_PAGES);
  assert.deepEqual(labels(included), [
    "Home",
    "About",
    "The vision",
    "Team",
    "One",
  ]);

  assert.equal(boxedPages(sitemap, INCLUDED_PAGES + 2).length, 7);
});

/* ── Typed pages carry their notes (the helpers C5's browser proof runs on) */

test("WEB-22 typed page helpers keep each note with its page", () => {
  const pages = ["Residency", "Volunteer days", "Reading list"];
  const notes = ["r", "v"];

  const renamed = renameTypedPage(pages, notes, 0, "The residency");
  assert.deepEqual(renamed.pages[0], "The residency");
  assert.deepEqual(renamed.notes, ["r", "v", ""]);

  const removed = removeTypedPage(pages, notes, 0);
  assert.deepEqual(removed.pages, ["Volunteer days", "Reading list"]);
  assert.deepEqual(removed.notes, ["v", ""]);

  const added = addTypedPage(["A"], []);
  assert.deepEqual(added, { pages: ["A", ""], notes: ["", ""] });
});

/* ── C6: About on venture ──────────────────────────────────────────────── */

test("WEB-22 C6 venture and venture-place list About right after Home; other packs are unchanged", () => {
  for (const pack of [resolvePack("venture"), resolvePack("venture", "place")]) {
    assert.deepEqual(pack.pages[0], { value: "home", label: "Home" });
    assert.deepEqual(pack.pages[1], { value: "about", label: "About" });
  }
  const values = (flavour: (typeof SHOWCASE_FLAVOURS)[number]) =>
    resolvePack(flavour).pages.map((option) => option.value);
  assert.deepEqual(values("film"), ["home", "work", "reel", "about", "contact", "teaching", "press"]);
  assert.deepEqual(values("generic"), ["home", "work", "reel", "about", "contact", "teaching", "press"]);
  assert.deepEqual(values("practice"), ["home", "about", "services", "speaking", "writing", "testimonials", "contact", "booking"]);
  assert.deepEqual(values("entity"), ["home", "work", "about", "team", "services", "press", "contact"]);
  assert.deepEqual(values("service"), ["home", "services", "pricing", "about", "reviews", "serviceArea", "faq", "contact", "booking"]);
  assert.deepEqual(values("venture"), ["home", "about", "vision", "place", "team", "offering", "apply", "faq", "press", "contact", "legal"]);
  assert.deepEqual(
    resolvePack("venture", "place").pages.map((option) => option.value),
    ["home", "about", "vision", "place", "team", "offering", "apply", "stays", "events", "faq", "press", "contact", "legal"],
  );
});

/* ── C7: the import ────────────────────────────────────────────────────── */

test("WEB-22 C7 each page key is quote-or-nothing, explicit-plan only, and gated to kinds that list it", () => {
  for (const value of PAGE_BRAIN_DUMP_VALUES) {
    const key = pageBrainDumpKey(value);
    const field = primerField(key);
    assert.ok(field, key);
    assert.equal(field.critical, true, key);
    assert.match(field.description, /^Only if the text explicitly plans/, key);
    assert.match(field.description, /Leave empty unless/, key);
  }
  assert.equal(primerField("pagesCustomBrainDump"), undefined);

  // A venture is offered Apply; a portfolio never is.
  assert.equal(askedOf("applyBrainDump", "venture", null), true);
  assert.equal(askedOf("applyBrainDump", "portfolio", null), false);
  // Stays only on a place venture.
  assert.equal(askedOf("staysBrainDump", "venture", null), false);
  assert.equal(askedOf("staysBrainDump", "venture", "place"), true);

  for (const kind of SHOWCASE_KIND_KEYS) {
    for (const subtype of SUBTYPES) {
      const keys = ingestionFieldsFor(kind, subtype).map((f) => f.key);
      assert.ok(!keys.includes("pagesCustomBrainDump"), `${kind}/${subtype}`);
    }
  }
});

/* ── C8: the document ──────────────────────────────────────────────────── */

function engagement(site: Record<string, unknown>, ventureType?: string): Engagement {
  const epoch = new Date(0);
  return {
    id: "eng_synthetic_web22",
    createdAt: epoch,
    updatedAt: epoch,
    answers: {
      about: {
        displayName: "Fixture Commons",
        siteKind: "venture",
        ...(ventureType ? { ventureType } : {}),
      },
      site,
    },
    businessName: "Fixture Commons",
    completedAt: null,
    contactEmail: "sam@fixture.invalid",
    contactName: "Sam Fixture",
    contactPhone: null,
    currency: "cad",
    currentStep: 0,
    depositAmountCents: 0,
    depositRequired: true,
    lastActivityAt: epoch,
    paidAt: epoch,
    projectSummary: null,
    sentAt: null,
    startedAt: epoch,
    termsAcceptedAt: epoch,
    termsVersion: null,
    tokenExpiresAt: epoch,
    track: "showcase",
    status: "created",
  } as Engagement;
}

function render(site: Record<string, unknown>, ventureType?: string): string {
  return renderIntakeMarkdown({
    engagement: engagement(site, ventureType),
    files: [],
    generatedAt: new Date(0),
    gallery: EMPTY_EXAMPLE_SET,
  });
}

test("WEB-22 C8 the document prints each brain dump under its page's name in sitemap order, then the dropped ones", () => {
  const doc = render(
    {
      pages: ["contact", "home", "offering"],
      pagesCustom: ["Residency", "Old page"],
      pagesCustomBrainDump: ["[Fixture: residency notes]", ""],
      contactBrainDump: "[Fixture: contact notes]",
      offeringBrainDump: "[Fixture: model notes]",
      homeBrainDump: "[Fixture: home notes]",
      teamBrainDump: "[Fixture: team notes, since unticked]",
    },
    "place",
  );

  const block = doc.slice(doc.indexOf("**What each page should hold:**"));
  const order = [
    "  - Home — [Fixture: home notes]",
    "  - The model — [Fixture: model notes]",
    "  - Contact — [Fixture: contact notes]",
    "  - Residency — [Fixture: residency notes]",
  ].map((line) => block.indexOf(line));
  assert.ok(order.every((at) => at >= 0), String(order));
  assert.deepEqual([...order].sort((a, b) => a - b), order);

  assert.match(
    doc,
    /\*\*Notes for pages no longer in their sitemap:\*\* Team — \[Fixture: team notes, since unticked\]/,
  );
  assert.ok(
    doc.indexOf("**Notes for pages no longer in their sitemap:**") >
      doc.indexOf("**What each page should hold:**"),
  );

  // No loose page key lines: Home's old label, a page's own label, the list.
  assert.doesNotMatch(doc, /\*\*What should be on the home page:\*\*/);
  assert.doesNotMatch(doc, /\*\*What should be on the Contact page:\*\*/);
  assert.doesNotMatch(doc, /\*\*What should be on the pages they added:\*\*/);
});

test("WEB-22 C8 page boxes past Home stay out of Not answered and the review tally", () => {
  const eng = engagement({ pages: ["home", "about"] });
  const unanswered = collectUnanswered(eng).flatMap((group) => group.labels);
  for (const value of PAGE_BRAIN_DUMP_VALUES) {
    assert.ok(
      !unanswered.includes(labelFor("showcase", pageBrainDumpKey(value))),
      value,
    );
  }
  assert.ok(!unanswered.includes(labelFor("showcase", "pagesCustomBrainDump")));
  // Home's box is counted, as it was before WEB-22.
  assert.ok(unanswered.includes(labelFor("showcase", "homeBrainDump")));

  const site = answerTally(eng).find((step) => step.key === "site")!;
  const withNote = answerTally(
    engagement({ pages: ["home", "about"], aboutBrainDump: "x" }),
  ).find((step) => step.key === "site")!;
  assert.equal(site.total, withNote.total);
});
