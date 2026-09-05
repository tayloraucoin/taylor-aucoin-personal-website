/**
 * The business primer's live eval (PORT-10).
 *
 *   yarn eval:primer:live
 *
 * Wires the golden set to the real service. This is the run that costs money
 * and the only one that grades the thing that actually matters: whether the
 * prompt produces grounded proposals on eleven documents chosen to make it
 * reach.
 *
 * **It calls `proposeFromDocument`, not `readBusinessPrimer`.** The run counter
 * is a property of an engagement, and eleven fixtures should not spend eleven
 * of a real client's twenty-five runs. The part under test — the prompt, the
 * structured output, and the quote validator — is identical either way.
 *
 * The graders are in `evals/business-primer/grade.ts` and were written before
 * the prompt. `yarn eval:primer` runs them against fixtures with no model
 * involved and proves they catch what they claim to; run that first, and this
 * only when it is clean.
 */

import { fetchLink, transcribeBytes } from "@/server/services/document-reading";
import { ingestFromText } from "@/server/services/ingestion";
import { proposeFromDocument } from "@/server/services/primer";
import { runGoldenSet, runIngestionSet, runSourceSet } from "./eval-primer";

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      [
        "",
        "ANTHROPIC_API_KEY is not set, so there is nothing to grade.",
        "",
        "Set it in .env.local and run again. `yarn eval:primer` runs every",
        "check that does not need a model and costs nothing.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  // `--ingestion` runs PORT-18's cases through the whole fan-out — the field
  // stage and every entry stage — via `ingestFromText`, which spends no
  // engagement's counter. Without the flag this is the primer's run as before.
  const failures = process.argv.includes("--sources")
    ? // PORT-21: a PDF generated from known text, transcribed and graded for
      // invention. `yarn eval:sources` runs the local half and costs nothing.
      await runSourceSet(transcribeBytes, fetchLink)
    : process.argv.includes("--ingestion")
      ? await runIngestionSet(ingestFromText)
      : await runGoldenSet(proposeFromDocument);

  console.log(
    failures === 0
      ? "\nLive run clean.\n"
      : `\n${failures} case(s) failed. Read the hard findings above before changing the prompt.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main();
