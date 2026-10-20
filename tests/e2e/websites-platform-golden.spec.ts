import { expect, test } from "./fixtures";
import {
  mainInnerHtml,
  normaliseGolden,
  PLATFORM_GOLDEN,
  readGolden,
} from "./golden";

/** SITE-24 C5: /websites/platform's body is pinned (D-SITE-112, 209, 230). */

const golden = normaliseGolden(readGolden(PLATFORM_GOLDEN));

test("C5 /websites/platform answers 200 and its main equals the golden file", async ({
  request,
}) => {
  const response = await request.get("/websites/platform", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(200);
  const live = normaliseGolden(mainInnerHtml(await response.text()));
  expect(live).toBe(golden);
});

test("C5 one changed word of the hero copy fails the comparison", () => {
  const hero = "Websites for local businesses";
  expect(golden).toContain(hero);
  const edited = normaliseGolden(
    readGolden(PLATFORM_GOLDEN).replace(hero, "Websites for local shops"),
  );
  expect(edited).not.toBe(golden);
});
