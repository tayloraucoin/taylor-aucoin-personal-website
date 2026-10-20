import assert from "node:assert/strict";
import { test } from "node:test";
import { isIntakePath } from "@/lib/routes";

/** SITE-28 C5: the intake harness never ships, and renders as an intake. */
const NOT_FOUND = /NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/;

test("SITE-28 C5 the intake harness 404s on a production deployment", async () => {
  const saved = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";
  try {
    const { default: IntakeHarness } =
      await import("../../app/test-harness/intake/page");
    await assert.rejects(
      IntakeHarness({ searchParams: Promise.resolve({ state: "resume" }) }),
      NOT_FOUND,
    );
  } finally {
    if (saved === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = saved;
  }
});

test("SITE-28 C5 an unknown state key 404s off production too", async () => {
  const { default: IntakeHarness } =
    await import("../../app/test-harness/intake/page");
  await assert.rejects(
    IntakeHarness({ searchParams: Promise.resolve({ state: "nope" }) }),
    NOT_FOUND,
  );
});

test("SITE-28 isIntakePath covers the harness and nothing beside it", () => {
  assert.equal(isIntakePath("/test-harness/intake"), true);
  assert.equal(isIntakePath("/test-harness/example-row"), false);
  assert.equal(isIntakePath("/test-harness/intakes"), false);
});
