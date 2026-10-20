import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { findIdioms, intakeSourceFiles } from "./intake-idioms";

/**
 * C-SITE-intake-coded-2: no old idiom left in an intake tree. Each intake
 * ticket adds the trees it restyles (SITE-28 the shared tree).
 */
const TREES: Record<string, readonly string[]> = {
  "SITE-28": ["app/websites/intake"],
};

/** SITE-29's coded files: the entry, money and plain question screens. */
const SITE_29_FILES = [
  "app/websites/coded/intake/[token]/[step]/page.tsx",
  "app/websites/coded/intake/[token]/done/page.tsx",
  "app/websites/coded/intake/[token]/page.tsx",
  "app/websites/coded/intake/[token]/review/page.tsx",
  "app/websites/coded/intake/_components/ask-entry.tsx",
  "app/websites/coded/intake/_components/custom-pages.tsx",
  "app/websites/coded/intake/_components/document-drop.tsx",
  "app/websites/coded/intake/_components/entry-collapse.tsx",
  "app/websites/coded/intake/_components/extras-checkout.tsx",
  "app/websites/coded/intake/_components/feedback-block.tsx",
  "app/websites/coded/intake/_components/for-kinds.tsx",
  "app/websites/coded/intake/_components/home-shortlist.tsx",
  "app/websites/coded/intake/_components/offer-entry.tsx",
  "app/websites/coded/intake/_components/person-entry.tsx",
  "app/websites/coded/intake/_components/person-proof.tsx",
  "app/websites/coded/intake/_components/piece-entry.tsx",
  "app/websites/coded/intake/_components/project-entry.tsx",
  "app/websites/coded/intake/_components/service-entry.tsx",
  "app/websites/coded/intake/_components/showcase-checkout.tsx",
  "app/websites/coded/intake/_components/showcase-done.tsx",
  "app/websites/coded/intake/_components/showcase-pay-button.tsx",
  "app/websites/coded/intake/_components/showcase-pay-gate.tsx",
  "app/websites/coded/intake/_components/showcase-start-form.tsx",
  "app/websites/coded/intake/_components/showcase-start.tsx",
  "app/websites/coded/intake/_components/showcase-waive-button.tsx",
  "app/websites/coded/intake/_components/showcase-welcome.tsx",
  "app/websites/coded/intake/_components/steps/step-about.tsx",
  "app/websites/coded/intake/_components/steps/step-access.tsx",
  "app/websites/coded/intake/_components/steps/step-audience.tsx",
  "app/websites/coded/intake/_components/steps/step-experience.tsx",
  "app/websites/coded/intake/_components/steps/step-media.tsx",
  "app/websites/coded/intake/_components/steps/step-site.tsx",
  "app/websites/coded/intake/_components/steps/step-work.tsx",
  "app/websites/coded/intake/_components/top-five.tsx",
  "app/websites/coded/intake/_components/upsell-block.tsx",
  "app/websites/coded/intake/_components/video-list.tsx",
  "app/websites/coded/intake/add-ons/page.tsx",
  "app/websites/coded/intake/layout.tsx",
  "app/websites/coded/intake/page.tsx",
];

const FILES: Record<string, readonly string[]> = {
  ...Object.fromEntries(
    Object.entries(TREES).map(([ticket, roots]) => [
      ticket,
      roots.flatMap(intakeSourceFiles),
    ]),
  ),
  "SITE-29": SITE_29_FILES,
};

for (const [ticket, files] of Object.entries(FILES)) {
  test(`${ticket} C1 no mono caps, Eyebrow, GradientRing, font-light or gold text`, () => {
    const hits = files.flatMap((file) =>
      findIdioms(readFileSync(file, "utf8")).map(
        (idiom) => `${file}: ${idiom}`,
      ),
    );
    assert.deepEqual(hits, []);
  });
}

test("SITE-28 C1 the scanner finds each idiom in a fixture", () => {
  const fixture = [
    `import { Eyebrow } from "./eyebrow";`,
    `import GradientRing from "@/components/ui/GradientRing";`,
    `const a = "font-mono text-[10px] uppercase tracking-[.18em]";`,
    `const b = "font-body font-light";`,
    `const c = "hover:text-(--color-c3) text-(--color-c2)";`,
  ].join("\n");
  assert.deepEqual(findIdioms(fixture).sort(), [
    "eyebrow-import",
    "font-light",
    "gold-text",
    "gradient-ring-import",
    "mono-caps",
  ]);
});

test("SITE-28 C1 the scanner passes the new roles", () => {
  const clean = [
    `import { Eyebrow } from "./not-imported";`.replace("Eyebrow", "Meta"),
    `const a = "text-meta text-(--color-dim)";`,
    `const b = "bg-(--color-mark) decoration-(--color-mark)";`,
    `const c = "font-mono text-meta";`,
  ].join("\n");
  assert.deepEqual(findIdioms(clean), []);
});

test("SITE-29 C1 eyebrow.tsx is gone and nothing imports an Eyebrow", () => {
  assert.equal(
    existsSync("app/websites/intake/_components/eyebrow.tsx"),
    false,
  );
  const importers = ["app", "components"]
    .flatMap(intakeSourceFiles)
    .filter((file) =>
      /import[^;]*\bEyebrow\b[^;]*from/.test(readFileSync(file, "utf8")),
    );
  assert.deepEqual(importers, []);
});
