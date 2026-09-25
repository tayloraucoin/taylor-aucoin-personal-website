/**
 * Mechanical proof for the pipeline's variable renderer (PIPE-3, M-PIPE-2).
 *
 * Runs without a database or a network: `lib/pipeline/template.ts` is pure.
 * The fixture is deliberately fake — no real client, business, or domain
 * (house law: no fabricated or real client data in fixtures).
 *
 *   yarn verify:pipeline
 */

import assert from "node:assert/strict";
import {
  findTemplateNames,
  renderPipelineTemplate,
  resolveTemplateValues,
} from "../lib/pipeline/template";

const record = {
  contactName: "  Fixture   Person ",
  businessName: "Fixture Studio",
  contactEmail: "fixture@example.invalid",
  answers: { access: { domainName: "fixture.example", registrar: "  " } },
};

let checks = 0;
function check(name: string, run: () => void) {
  run();
  checks += 1;
  console.log(`ok  ${name}`);
}

check("record names resolve; first name is the first word", () => {
  const values = resolveTemplateValues(record, {});
  assert.equal(values.firstName, "Fixture");
  assert.equal(values.contactName, "Fixture   Person");
  assert.equal(values.businessName, "Fixture Studio");
  assert.equal(values.domain, "fixture.example");
});

check("a blank intake answer is unresolved, not empty", () => {
  const values = resolveTemplateValues(record, {});
  assert.equal(values.registrar, undefined);
  const { text, unresolved } = renderPipelineTemplate("At {{registrar}}.", values);
  assert.equal(text, "At {{registrar}}.");
  assert.deepEqual(unresolved, ["registrar"]);
});

check("a saved value overrides the record's value of the same name", () => {
  const values = resolveTemplateValues(record, { domain: "corrected.example" });
  assert.equal(renderPipelineTemplate("{{domain}}", values).text, "corrected.example");
});

check("a blank saved value does not erase the record's value", () => {
  const values = resolveTemplateValues(record, { domain: "   " });
  assert.equal(values.domain, "fixture.example");
});

check("unknown names stay literal and are reported once, in order", () => {
  const values = resolveTemplateValues(record, {});
  const { text, unresolved } = renderPipelineTemplate(
    "Hi {{firstName}}: {{reviewUrl}} / {{reviewCode}} / {{reviewUrl}}",
    values,
  );
  assert.equal(text, "Hi Fixture: {{reviewUrl}} / {{reviewCode}} / {{reviewUrl}}");
  assert.deepEqual(unresolved, ["reviewUrl", "reviewCode"]);
});

check("padding inside the braces is still a name", () => {
  const values = resolveTemplateValues(record, { reviewCode: "fixture-code" });
  assert.equal(renderPipelineTemplate("{{ reviewCode }}", values).text, "fixture-code");
});

check("malformed braces are literal and not reported", () => {
  const values = resolveTemplateValues(record, {});
  const source = "{{ not a name }} {{2x}} {single} {{}} {{a-b}}";
  const { text, unresolved } = renderPipelineTemplate(source, values);
  assert.equal(text, source);
  assert.deepEqual(unresolved, []);
});

check("names are found across templates in order of first appearance", () => {
  assert.deepEqual(
    findTemplateNames("{{b}} {{a}}", null, "{{ a }} {{c}}", undefined),
    ["b", "a", "c"],
  );
});

check("the pattern is reusable — no lastIndex carried between calls", () => {
  const values = resolveTemplateValues(record, {});
  for (let i = 0; i < 3; i++) {
    assert.equal(renderPipelineTemplate("{{firstName}}", values).text, "Fixture");
    assert.deepEqual(findTemplateNames("{{firstName}}"), ["firstName"]);
  }
});

console.log(`\n${checks} checks passed.`);
