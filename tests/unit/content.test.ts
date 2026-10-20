import assert from "node:assert/strict";
import { test } from "node:test";
import { publishedWork, work } from "@/content/work";
import { isWorkPublished } from "@/lib/config";

test("C6 content/work loads through @/ with its image imports stubbed", () => {
  assert.ok(work.length > 0, "content/work exported no studies");
  assert.deepEqual(
    publishedWork.map((study) => study.slug),
    work.filter((study) => isWorkPublished(study.slug)).map((s) => s.slug),
  );
  assert.ok(publishedWork.length > 0, "no study is published");
});

test("C6 a module that imports server-only loads", async () => {
  const captures = await import("@/server/services/example-captures");
  assert.ok(Object.keys(captures).length > 0);
});
