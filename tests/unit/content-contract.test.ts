import assert from "node:assert/strict";
import { test } from "node:test";
import { work, workRows } from "@/content/work";

const bySlugAll = (slug: string) => {
  const study = work.find((w) => w.slug === slug);
  assert.ok(study, `no study ${slug}`);
  return study;
};

const TYPES = ["full-time", "contract", "business", "passion"];
const EXPECTED_TYPE: Record<string, string> = {
  everbook: "full-time",
  roomvy: "full-time",
  "calculate-qxmd": "full-time",
  "family-office-platform": "contract",
  agora: "business",
  "conscious-connections": "passion",
};

test("C1 every study carries type, listRole, sortDate, builtFormat and four facts", () => {
  assert.equal(work.length, 6);
  for (const study of work) {
    assert.ok(TYPES.includes(study.type), `${study.slug} type`);
    assert.equal(
      study.type,
      EXPECTED_TYPE[study.slug],
      `${study.slug} type value`,
    );
    assert.ok(study.listRole.length > 0, `${study.slug} listRole`);
    assert.match(
      study.sortDate,
      /^\d{4}-(0[1-9]|1[0-2])$/,
      `${study.slug} sortDate`,
    );
    assert.ok(study.builtFormat, `${study.slug} builtFormat`);
    assert.equal(study.facts.length, 4, `${study.slug} facts`);
    study.facts.forEach((fact, i) => {
      assert.ok(
        fact.value && fact.meta,
        `${study.slug} fact ${i} value and meta`,
      );
      if (i < 3)
        assert.equal(fact.href, undefined, `${study.slug} fact ${i} href`);
      else if (fact.href)
        assert.match(fact.href, /^https:\/\//, `${study.slug} href`);
    });
  }
});

test("C2 builtFormat per study, and only the Unified data layer card carries a screen", () => {
  const formats = Object.fromEntries(work.map((w) => [w.slug, w.builtFormat]));
  assert.deepEqual(formats, {
    "family-office-platform": "rows-paired",
    "conscious-connections": "band",
    everbook: "gallery",
    roomvy: "rows-after",
    agora: "gallery",
    "calculate-qxmd": "rows-after",
  });
  for (const study of work) {
    const cards = Array.isArray(study.built) ? [] : study.built.cards;
    const withScreen = cards.filter((c) => c.screen).map((c) => c.label);
    if (study.slug === "family-office-platform") {
      assert.deepEqual(withScreen, ["UNIFIED DATA LAYER"]);
    } else {
      assert.deepEqual(withScreen, [], `${study.slug} has a screen`);
    }
  }
});

test("C3 aiSat is on Conscious Connections only, copied from atAGlance", () => {
  assert.deepEqual(
    work.filter((w) => w.aiSat).map((w) => w.slug),
    ["conscious-connections"],
  );
  const cc = bySlugAll("conscious-connections");
  const glance = (label: string) =>
    cc.atAGlance?.find((r) => r.label === label)?.value;
  assert.deepEqual(cc.aiSat?.product, [glance("AI system")]);
  assert.deepEqual(cc.aiSat?.build, [glance("Method")]);
  assert.ok(cc.aiSat?.product[0]);
  assert.ok(cc.aiSat?.build[0]);
});

test("C4 Conscious Connections' facts", () => {
  assert.deepEqual(bySlugAll("conscious-connections").facts, [
    { value: "Solo build", meta: "founder · engineer · designer" },
    { value: "2026 to present", meta: "first commit May 2026" },
    { value: "Beta", meta: "marketing site live · toolkit ahead of launch" },
    {
      value: "consciousconnections.app",
      meta: "live site",
      href: "https://consciousconnections.app/",
    },
  ]);
});

test("C5 rows.ts holds six rows and every caseStudySlug names a study", () => {
  assert.equal(workRows.length, 6);
  const row = (id: string) => {
    const r = workRows.find((x) => x.id === id);
    assert.ok(r, `no row ${id}`);
    return r;
  };
  const branding = workRows.filter((r) => r.discipline === "branding");
  const websites = workRows.filter((r) => r.discipline === "websites");
  assert.equal(branding.length, 3);
  assert.equal(websites.length, 3);
  for (const r of branding) assert.equal(r.published, true, r.title);

  assert.equal(row("agora-kit").type, "business");
  assert.equal(row("conscious-connections-kit").type, "passion");
  assert.equal(row("taylor-aucoin-kit").type, "own-brand");
  assert.equal(row("taylor-aucoin-kit").caseStudySlug, undefined);

  assert.equal(row("kryshan-randel").published, true);
  assert.equal(row("kryshan-randel").liveUrl, "https://kryshanrandel.com/");
  assert.ok(row("kryshan-randel").gallery.length >= 5, "Kryshan has captures");
  assert.ok(row("kryshan-randel").example?.desktop, "/websites shows them");
  assert.equal(row("holistica").published, false);
  assert.equal(row("clean-coast-detailing").published, false);
  assert.equal(row("clean-coast-detailing").title, "Clean Coast Detailing");
  for (const r of websites) assert.equal(r.type, "client", r.title);
  assert.equal(
    websites.filter((r) => r.published).length,
    1,
    "the Websites tab shows one row",
  );

  for (const r of workRows) {
    if (r.caseStudySlug) bySlugAll(r.caseStudySlug);
  }
  assert.equal(row("agora-kit").caseStudySlug, "agora");
  assert.equal(
    row("conscious-connections-kit").caseStudySlug,
    "conscious-connections",
  );
});

test("C6 within each type, newest first gives work-index.md's order", () => {
  const order = (type: string) =>
    work
      .filter((w) => w.type === type)
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
      .map((w) => w.slug);
  assert.deepEqual(order("full-time"), [
    "everbook",
    "roomvy",
    "calculate-qxmd",
  ]);
});
