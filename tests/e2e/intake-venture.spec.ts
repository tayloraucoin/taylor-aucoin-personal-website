import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/**
 * VEN-1: the venture sub-type on the start form and on About, drawn on the
 * SITE-28 harness from `components/intake/venture-fixtures.ts`.
 */
const at = (key: string) => `/test-harness/intake?state=${key}`;
const KIND_KEYS = [
  "kind-other",
  "venture-chosen",
  "place-chosen",
  "subtype-changed",
] as const;
const SUBTYPES = ["place", "company", "fund", "cause", "launch", "other"];
const SUBTYPE_LEGEND = "What kind of venture is it?";

/** The `name` of every radio group in `main`, in document order. */
async function radioGroups(page: Page): Promise<string[]> {
  return page
    .locator("main fieldset")
    .evaluateAll((sets) =>
      sets
        .map((set) =>
          set.querySelector("input[type=radio]")?.getAttribute("name"),
        )
        .filter((name): name is string => Boolean(name)),
    );
}

test.describe("C1 the sub-type group on the start form", () => {
  test("kind-other: no sub-type group", async ({ page }) => {
    await page.goto(at("kind-other"));
    await expect(page.getByRole("group", { name: SUBTYPE_LEGEND })).toHaveCount(
      0,
    );
    await expect(page.locator("input[name=ventureTypeChoice]")).toHaveCount(0);
  });

  test("venture-chosen: directly after the kind group, six options in order, none checked", async ({
    page,
  }) => {
    await page.goto(at("venture-chosen"));
    const groups = await radioGroups(page);
    const kindAt = groups.indexOf("siteKindChoice");
    expect(kindAt).toBeGreaterThanOrEqual(0);
    expect(groups[kindAt + 1]).toBe("ventureTypeChoice");

    const radios = page.locator("input[name=ventureTypeChoice]");
    await expect(radios).toHaveCount(SUBTYPES.length);
    expect(
      await radios.evaluateAll((els) =>
        els.map((el) => (el as HTMLInputElement).value),
      ),
    ).toEqual(SUBTYPES);
    expect(
      await radios.evaluateAll(
        (els) => els.filter((el) => (el as HTMLInputElement).checked).length,
      ),
    ).toBe(0);
  });

  test("place-chosen: place is checked", async ({ page }) => {
    await page.goto(at("place-chosen"));
    await expect(
      page.locator("input[name=ventureTypeChoice][value=place]"),
    ).toBeChecked();
    await expect(
      page.locator("input[name=ventureTypeChoice]:checked"),
    ).toHaveCount(1);
  });
});

test.describe("C10 the sub-type changed on About", () => {
  test("subtype-changed: the picker open, company checked, the reassurance line under it", async ({
    page,
  }) => {
    await page.goto(at("subtype-changed"));
    const picker = page.locator("main").locator("input[name=ventureType]");
    await expect(picker).toHaveCount(SUBTYPES.length);
    await expect(
      page.locator("input[name=ventureType][value=company]"),
    ).toBeChecked();
    await expect(
      page.locator("input[name=siteKind][value=venture]"),
    ).toBeChecked();

    // Below the sub-type group, in reading order: the line that says the
    // answers are kept.
    const order = await page.locator("main").evaluate((main) => {
      const group = main
        .querySelector("input[name=ventureType]")!
        .closest("fieldset")!;
      const lines = [...main.querySelectorAll("p")];
      const line = lines.find((p) =>
        /changes the questions/i.test(p.textContent ?? ""),
      );
      return line
        ? group.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING
        : -1;
    });
    expect(order).toBeGreaterThan(0);
  });

  for (const key of KIND_KEYS) {
    test(`axe: no serious or critical violation on ${key}`, async ({
      page,
    }) => {
      await page.goto(at(key));
      await expectNoSeriousA11y(page);
    });
  }
});

/* ── VEN-2: the place questions on About and Work (`venture-place.md`) ───── */

const PLACE_KEYS = ["place-empty", "place-filled", "place-searching"] as const;

/** Each selector's first match follows the one before it in the document. */
async function inOrder(page: Page, selectors: readonly string[]) {
  const follows = await page.evaluate((list) => {
    const nodes = list.map((s) => document.querySelector(s));
    const missing = list.filter((_, i) => !nodes[i]);
    if (missing.length > 0) return `missing: ${missing.join(", ")}`;
    for (let i = 1; i < nodes.length; i++) {
      const order = nodes[i - 1]!.compareDocumentPosition(nodes[i]!);
      if (!(order & Node.DOCUMENT_POSITION_FOLLOWING)) {
        return `${list[i]} is not after ${list[i - 1]}`;
      }
    }
    return "ok";
  }, selectors);
  expect(follows).toBe("ok");
}

/** A radio group's values in order, and how many are checked. */
async function radios(page: Page, name: string) {
  const inputs = page.locator(`input[type=radio][name="${name}"]`);
  return {
    values: await inputs.evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement).value),
    ),
    checked: await inputs.evaluateAll(
      (els) => els.filter((el) => (el as HTMLInputElement).checked).length,
    ),
  };
}

const PROPERTY_STATUS = [
  "owned",
  "underContract",
  "option",
  "leased",
  "searching",
  "unsure",
];
const LOCATION_PRECISION = [
  "region",
  "province",
  "town",
  "address",
  "pin",
  "unsure",
];
const FUNDED = ["funded", "partly", "notYet", "unsure"];
const PLACE_FIELDS = [
  "propertyTitle",
  "locationWhy",
  "visitsNow",
  "placeSize",
  "permits",
  "applyWho",
  "applyAfter",
  "applyFee",
  "applyQuestions",
];

test.describe("VEN-2 C1 the place rows, in place", () => {
  test("place-filled: About and Work rows at their stated positions", async ({
    page,
  }) => {
    await page.goto(at("place-filled"));
    // The titled piece is collapsed to its summary; open it to read the card.
    await page.getByRole("button", { name: /the main house/i }).click();

    await inOrder(page, [
      "#f-stageDetail",
      "input[name=propertyStatus]",
      "#f-propertyTitle",
      "#f-basedIn",
      "input[name=locationPrecision]",
      "#f-locationWhy",
      "#f-visitsNow",
      "#f-piece-when-0",
      "input[name=piece-funded-0]",
      "#f-placeSize",
      "#f-permits",
      "label[for=f-asks]",
      "#applying-heading",
      "#f-applyWho",
      "#f-applyAfter",
      "#f-applyFee",
      "#f-applyQuestions",
    ]);

    await expect(
      page.locator("input[name=propertyStatus][value=underContract]"),
    ).toBeChecked();
    await expect(
      page.locator("input[name=piece-funded-0][value=partly]"),
    ).toBeChecked();

    const applying = page.getByRole("group", { name: "Applying" });
    await expect(applying).toHaveAccessibleDescription(
      "Skip this if nobody applies.",
    );
    for (const key of [
      "applyWho",
      "applyAfter",
      "applyFee",
      "applyQuestions",
    ]) {
      await expect(applying.locator(`#f-${key}`)).toHaveCount(1);
    }
  });

  test("place-empty: each radio in its order, ending Not sure yet, none checked; Applying's skip line", async ({
    page,
  }) => {
    await page.goto(at("place-empty"));
    for (const [name, values] of [
      ["propertyStatus", PROPERTY_STATUS],
      ["locationPrecision", LOCATION_PRECISION],
      ["piece-funded-0", FUNDED],
    ] as const) {
      expect(await radios(page, name)).toEqual({ values, checked: 0 });
      await expect(
        page.locator(`input[name="${name}"][value=unsure]`),
      ).toHaveAccessibleName("Not sure yet");
    }
    await expect(page.getByText("Skip this if nobody applies.")).toBeVisible();
  });

  test("place-searching: Still searching, and the title question keeps its label", async ({
    page,
  }) => {
    await page.goto(at("place-searching"));
    await expect(
      page.locator("input[name=propertyStatus][value=searching]"),
    ).toBeChecked();
    await expect(
      page.getByLabel("Who holds title, and since when?"),
    ).toHaveValue("[Fixture: nobody yet]");
  });
});

test.describe("VEN-2 C2 plain venture meets none of it", () => {
  test("plain-venture: no place key, and today's venture labels", async ({
    page,
  }) => {
    await page.goto(at("plain-venture"));
    for (const name of [
      "propertyStatus",
      "locationPrecision",
      "piece-funded-0",
    ]) {
      await expect(page.locator(`input[name="${name}"]`)).toHaveCount(0);
    }
    for (const key of PLACE_FIELDS) {
      await expect(page.locator(`#f-${key}`)).toHaveCount(0);
    }
    await expect(page.getByRole("group", { name: "Applying" })).toHaveCount(0);

    // Today's labels: the overlay's words and values are nowhere.
    await expect(page.getByLabel("Residents or guests")).toHaveCount(1);
    await expect(page.getByLabel("Members or applicants")).toHaveCount(1);
    await expect(page.getByLabel("The offering")).toHaveCount(1);
    for (const value of [
      "guests",
      "coOwners",
      "facilitators",
      "stays",
      "events",
    ]) {
      await expect(page.locator(`input[value=${value}]`)).toHaveCount(0);
    }
    // The ask reads under today's label, and none of the place asks exists.
    await expect(page.getByText("Apply or join").first()).toBeVisible();
    for (const value of ["reserve", "hire", "register"]) {
      await expect(page.locator(`input[value=${value}]`)).toHaveCount(0);
    }
  });

  for (const key of ["plain-venture", ...PLACE_KEYS]) {
    test(`axe: no serious or critical violation on ${key}`, async ({
      page,
    }) => {
      await page.goto(at(key));
      await expectNoSeriousA11y(page);
    });
  }
});

/* ── VEN-3: the investor ask (`investor-ask.md`) ─────────────────────────── */

const ASK_KEYS = [
  "ask-plain",
  "ask-place-empty",
  "ask-coowner",
  "ask-returns",
  "ask-invest-card",
  "ask-raise-progress",
] as const;

const PLACE_INTRO =
  'Your counsel decides what the site may say about the raise. We only collect what they have said, so "not sure" or "counsel pending" is a fine answer to anything here.';
const VENTURE_INTRO =
  'These questions stop us putting something on your site that isn\'t true. "Not sure" is a fine answer to any of them.';

/** The keys of the labelled rows inside a container, in document order. */
async function rowKeys(page: Page, container: string, prefix = "f-") {
  return page
    .locator(`${container} label[for^="${prefix}"]`)
    .evaluateAll(
      (labels, p) =>
        labels.map((label) => label.getAttribute("for")!.slice(p.length)),
      prefix,
    );
}

const CLUSTER = 'section[aria-labelledby="ink-cluster-label"]';

test.describe("VEN-3 C1, C2 the claims cluster's rows", () => {
  test("ask-place-empty: the place intro and all eleven rows in order, no reveal open", async ({
    page,
  }) => {
    await page.goto(at("ask-place-empty"));
    const cluster = page.locator(CLUSTER);
    await expect(cluster.getByText(PLACE_INTRO)).toBeVisible();
    expect(await rowKeys(page, CLUSTER)).toEqual([
      "signOff",
      "issuerEntity",
      "investorReceives",
      "coOwnerDiffers",
      "jurisdictions",
      "cantSay",
      "returnWording",
      "perks",
      "requiredWording",
    ]);
    for (const name of ["coOwnerDiffers", "returnWording"]) {
      expect(await radios(page, name)).toMatchObject({ checked: 0 });
    }
  });

  test("ask-plain: the all-venture intro and only the venture rows", async ({
    page,
  }) => {
    await page.goto(at("ask-plain"));
    await expect(page.locator(CLUSTER).getByText(VENTURE_INTRO)).toBeVisible();
    expect(await rowKeys(page, CLUSTER)).toEqual([
      "signOff",
      "issuerEntity",
      "jurisdictions",
      "cantSay",
      "returnWording",
      "requiredWording",
    ]);
  });

  for (const key of ASK_KEYS) {
    test(`axe: no serious or critical violation on ${key}`, async ({
      page,
    }) => {
      await page.goto(at(key));
      await expectNoSeriousA11y(page);
    });
  }
});

test.describe("VEN-3 C4 each reveal opens on its one answer, right after it", () => {
  for (const [field, opens, revealed, other] of [
    ["coOwnerDiffers", "Different", "coOwnerLines", "The same"],
    [
      "returnWording",
      "Yes, counsel approved the wording",
      "returnWordingQuote",
      "No",
    ],
  ] as const) {
    test(`${field} opens ${revealed}, and closing keeps the text`, async ({
      page,
    }) => {
      await page.goto(at("ask-place-empty"));
      const group = page.locator(`fieldset:has(input[name="${field}"])`);
      const reveal = page.locator(`#f-${revealed}`);
      await expect(reveal).toHaveCount(0);

      await group.getByRole("radio", { name: other, exact: true }).check();
      await expect(reveal).toHaveCount(0);
      await group.getByRole("radio", { name: "Not sure yet" }).check();
      await expect(reveal).toHaveCount(0);

      await group.getByRole("radio", { name: opens, exact: true }).check();
      await expect(reveal).toBeVisible();
      const keys = await rowKeys(page, CLUSTER);
      expect(keys[keys.indexOf(field) + 1]).toBe(revealed);

      await reveal.fill("[Fixture: typed text]");
      await group.getByRole("radio", { name: other, exact: true }).check();
      await expect(reveal).toHaveCount(0);
      await group.getByRole("radio", { name: opens, exact: true }).check();
      await expect(reveal).toHaveValue("[Fixture: typed text]");
    });
  }

  test("ask-coowner and ask-returns draw their reveal open", async ({
    page,
  }) => {
    await page.goto(at("ask-coowner"));
    await expect(page.locator("#f-coOwnerLines")).toBeVisible();
    await page.goto(at("ask-returns"));
    await expect(page.locator("#f-returnWordingQuote")).toBeVisible();
    // A plain venture: no place row in the cluster.
    await expect(page.locator("#f-investorReceives")).toHaveCount(0);
  });
});

test.describe("VEN-3 C5 the Invest card's rows and Site's raise progress", () => {
  test("ask-invest-card: three rows at their places on Invest, none on Apply", async ({
    page,
  }) => {
    await page.goto(at("ask-invest-card"));
    expect(await rowKeys(page, "main", "f-ask-")).toEqual([
      "ask-0",
      "forWhom-0",
      "getWhat-0",
      "number-0",
      "currency-0",
      "sameMinimum-0",
      "mechanism-0",
      "visibility-0",
      "eligibility-0",
      "ask-1",
      "forWhom-1",
      "getWhat-1",
      "number-1",
      "mechanism-1",
      "visibility-1",
    ]);
    await expect(
      page.locator("input[name=ask-sameMinimum-0][value=no]"),
    ).toBeChecked();
    expect(await radios(page, "ask-sameMinimum-0")).toMatchObject({
      values: ["yes", "no", "unsure"],
    });
  });

  test("ask-raise-progress: inside the availability reveal, after the detail", async ({
    page,
  }) => {
    await page.goto(at("ask-raise-progress"));
    const keys = await rowKeys(page, "main");
    expect(keys[keys.indexOf("availabilityDetail") + 1]).toBe("raiseProgress");
    expect(await radios(page, "raiseProgress")).toEqual({
      values: ["approved", "no", "unsure"],
      checked: 0,
    });
    await page
      .locator('fieldset:has(input[name="showAvailability"])')
      .getByRole("radio", { name: "No" })
      .check();
    await expect(page.locator("input[name=raiseProgress]")).toHaveCount(0);
  });
});
