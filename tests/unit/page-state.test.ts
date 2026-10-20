import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { isProductionDeployment } from "@/lib/env";
import { readPageState, type PageSearchParams } from "@/lib/page-state";

const KEYS = ["empty", "error"] as const;
const savedVercelEnv = process.env.VERCEL_ENV;

afterEach(() => {
  if (savedVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = savedVercelEnv;
});

function params(query: Record<string, string | string[]>): PageSearchParams {
  return Promise.resolve(query);
}

test("C1 readPageState returns a key the page lists", async () => {
  delete process.env.VERCEL_ENV;
  assert.equal(await readPageState(params({ state: "error" }), KEYS), "error");
  assert.equal(
    await readPageState(params({ state: ["empty", "error"] }), KEYS),
    "empty",
  );
});

test("C1 readPageState returns default for a key the page does not list", async () => {
  delete process.env.VERCEL_ENV;
  assert.equal(
    await readPageState(params({ state: "loading" }), KEYS),
    "default",
  );
  assert.equal(await readPageState(params({}), KEYS), "default");
  assert.equal(await readPageState(undefined, KEYS), "default");
});

test("C1 on a production deployment readPageState returns default without reading searchParams", async () => {
  process.env.VERCEL_ENV = "production";
  assert.equal(isProductionDeployment(), true);

  let awaited = false;
  const trap = {
    then() {
      awaited = true;
      throw new Error("searchParams was awaited on production");
    },
  } as unknown as PageSearchParams;

  assert.equal(await readPageState(trap, KEYS), "default");
  assert.equal(awaited, false);
});

test("C1 a preview deployment still honours ?state=", async () => {
  process.env.VERCEL_ENV = "preview";
  assert.equal(isProductionDeployment(), false);
  assert.equal(await readPageState(params({ state: "empty" }), KEYS), "empty");
});
