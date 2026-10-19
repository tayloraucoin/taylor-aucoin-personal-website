import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ABOUT_STATES, pendingFixture } from "@/app/about/_fixtures";
import { stack, toolGroups } from "@/content/stack";
import { testimonials } from "@/content/testimonials";
import { readPageState } from "@/lib/page-state";

const saved = process.env.VERCEL_ENV;
afterEach(() => {
  if (saved === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = saved;
});

test("C1 every tool shown names an item flagged core, in five groups", () => {
  const core = new Set(
    stack
      .flatMap((c) => c.items)
      .filter((i) => typeof i !== "string")
      .map((i) => (i as { name: string }).name),
  );
  assert.equal(toolGroups.length, 5);
  for (const g of toolGroups)
    for (const it of g.items) assert.ok(core.has(it.name), it.name);
});

test("C3 the pending fixture is synthetic and no real entry's words are in it", () => {
  assert.equal(pendingFixture.approved, false);
  assert.match(pendingFixture.name, /Example/);
  const real = testimonials.flatMap((t) => t.full).join(" ");
  for (const p of pendingFixture.full) assert.ok(!real.includes(p));
});

test("C3 pending-testimonial is a listed state outside production and default in production", async () => {
  delete process.env.VERCEL_ENV;
  assert.equal(
    await readPageState(
      Promise.resolve({ state: "pending-testimonial" }),
      ABOUT_STATES,
    ),
    "pending-testimonial",
  );
  process.env.VERCEL_ENV = "production";
  assert.equal(
    await readPageState(
      Promise.resolve({ state: "pending-testimonial" }),
      ABOUT_STATES,
    ),
    "default",
  );
});
