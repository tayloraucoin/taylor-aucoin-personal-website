import { ventureTypeOf } from "@/lib/intake/tracks";
import type { StartShowcaseIntakeInput } from "@/lib/validators/showcase-intake";

/**
 * What the start form's answers become on step 1, before anyone has saved it.
 *
 * Pure, and apart from the action, because a `"use server"` module may export
 * only actions; the write itself is the unchanged `saveStepAnswers`. Contact
 * identity is not seeded: it lives on the engagement's own columns and step 1
 * renders it from there.
 *
 * The venture sub-type is seeded only on a venture, and only when one was
 * chosen (C-VEN-kind-2). It reads through `ventureTypeOf`, the same rule every
 * later read uses, so a value the questionnaire would ignore is never stored
 * in the first place.
 */
export function startAboutSeed(
  input: StartShowcaseIntakeInput,
): Record<string, unknown> {
  const entityName = input.entityName?.trim();
  const ventureType = ventureTypeOf({
    about: { siteKind: input.siteKind, ventureType: input.ventureType },
  });

  return {
    whatYouDo: input.whatYouDo,
    siteKind: input.siteKind,
    disciplines: input.disciplines,
    disciplinesOther: input.disciplinesOther,
    currentWebsite: input.currentWebsite,

    // Seeded only when the thing has a name of its own, so step 1 opens with
    // it filled rather than asking a second time. A portfolio's display name
    // stays blank here: step 1 asks it properly, and pre-filling it with the
    // contact's name would put a decision in their mouth.
    ...(entityName ? { displayName: entityName } : {}),
    ...(ventureType ? { ventureType } : {}),
  };
}
