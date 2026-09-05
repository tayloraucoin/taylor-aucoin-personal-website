import type { z } from "zod";
import type {
  AnyIntakeStepKey,
  IntakeAnswers,
  IntakeStep,
  IntakeTrackKey,
} from "@/lib/types/intake";
import { STEP_SCHEMAS } from "@/lib/validators/intake";
import { SHOWCASE_STEP_SCHEMAS } from "@/lib/validators/showcase-intake";
import { ANSWER_LABELS } from "./answer-labels";
import { SHOWCASE_ANSWER_LABELS } from "./showcase-answer-labels";
import {
  resolvePack,
  SHOWCASE_COPY_SLOTS,
  SHOWCASE_FLAVOURS,
  type ShowcaseCopyPack,
  type ShowcaseFlavour,
} from "./showcase-copy";
import {
  groupsFor as groupsForKind,
  kindAsks as kindAsksQuestion,
  kindEntry,
  kindFor,
  packForKind,
  SHOWCASE_KINDS,
  workShapeFor as workShapeForKind,
  type ShowcaseGroup,
  type ShowcaseKind,
  type ShowcaseKindQuestion,
  type ShowcaseWorkShape,
} from "./showcase-kinds";
import {
  flavourFromDisciplines,
  personVoiceOptions,
  SHOWCASE_DISCIPLINES,
  showcaseSteps,
  type PersonVoiceOption,
} from "./showcase-steps";
import { INTAKE_STEPS } from "./steps";

/**
 * The one resolver for step identity across tracks.
 *
 * Each track keeps its own registry in its own file — `steps.ts` for durable,
 * `showcase-steps.ts` for showcase — and every consumer comes through here:
 * routing, the progress indicator, the resume list, autosave's shape guard, the
 * reminder sweep, the admin read model, and the markdown generator. One home
 * per track, one resolver across tracks (M-PORT-1).
 *
 * Nothing outside this module imports a registry or a schema map directly. That
 * rule is what keeps a second track from becoming a second machine: when a
 * consumer needs to know what step 4 is called, there is exactly one function
 * to ask and it cannot answer without being told whose step 4 it is.
 */

/** Everything a surface needs to know about one track's shape. */
type TrackRegistry = {
  steps: readonly IntakeStep[];
  schemas: Record<string, z.ZodType>;
  labels: Record<string, string>;
};

function registryFor(
  track: IntakeTrackKey,
  flavour: ShowcaseFlavour,
): TrackRegistry {
  switch (track) {
    case "showcase":
      return {
        steps: showcaseSteps(flavour),
        schemas: SHOWCASE_STEP_SCHEMAS,
        labels: SHOWCASE_ANSWER_LABELS,
      };
    case "durable":
      return {
        steps: INTAKE_STEPS,
        schemas: STEP_SCHEMAS,
        labels: ANSWER_LABELS,
      };
  }
}

/**
 * One track's steps, in order.
 *
 * The flavour argument only reaches the showcase track, and only one of its
 * intros flexes. Callers that need titles and numbers — the resume list, the
 * progress bar, the reminder sweep — leave it alone and get the generic copy,
 * which is the correct floor rather than a placeholder (D-PORT-5).
 */
export function stepsFor(
  track: IntakeTrackKey,
  flavour: ShowcaseFlavour = "generic",
): readonly IntakeStep[] {
  return registryFor(track, flavour).steps;
}

/**
 * How many steps a track has.
 *
 * Nine on the durable track and ten on the showcase track since PORT-18, and
 * each is a promise made on its welcome screen rather than a coincidence to
 * hardcode (D-INT-5) — the welcome reads this function too.
 */
export function stepCountFor(track: IntakeTrackKey): number {
  return stepsFor(track).length;
}

/** Every step key in a track, for validating a slug or a save. */
export function stepKeysFor(
  track: IntakeTrackKey,
): readonly AnyIntakeStepKey[] {
  return stepsFor(track).map((step) => step.key);
}

/** Resolves a URL slug within one track. Undefined is a 404, never a guess. */
export function findStep(
  track: IntakeTrackKey,
  slug: string,
  flavour: ShowcaseFlavour = "generic",
): IntakeStep | undefined {
  return stepsFor(track, flavour).find((step) => step.key === slug);
}

/** The step a resume link should land on: furthest reached, or the first. */
export function stepByNumber(
  track: IntakeTrackKey,
  number: number,
  flavour: ShowcaseFlavour = "generic",
): IntakeStep {
  const steps = stepsFor(track, flavour);
  return steps[Math.min(Math.max(number, 1), steps.length) - 1]!;
}

export function nextStep(
  track: IntakeTrackKey,
  step: IntakeStep,
  flavour: ShowcaseFlavour = "generic",
): IntakeStep | null {
  return step.number < stepCountFor(track)
    ? stepByNumber(track, step.number + 1, flavour)
    : null;
}

export function previousStep(
  track: IntakeTrackKey,
  step: IntakeStep,
  flavour: ShowcaseFlavour = "generic",
): IntakeStep | null {
  return step.number > 1
    ? stepByNumber(track, step.number - 1, flavour)
    : null;
}

/**
 * The shape guard for one step of one track.
 *
 * Undefined when the key does not belong to this track — a durable step key on
 * a showcase engagement, or the reverse. Callers treat that as not-found rather
 * than as an empty save: writing `{}` under a foreign key would put a step in
 * the answers document that the track's own document generator will never read.
 */
export function schemaFor(
  track: IntakeTrackKey,
  stepKey: string,
): z.ZodType | undefined {
  return registryFor(track, "generic").schemas[stepKey];
}

/**
 * Every field a step knows how to ask about, answered or not.
 *
 * The schema is the only complete list of a step's fields — the step component
 * renders them but a component cannot be enumerated — so the "Not answered"
 * inventory is derived from it. Reaching into a Zod object's shape is the one
 * place that happens, and it happens here rather than in the document
 * generator, which has no business knowing what a validator is made of.
 */
export function fieldKeysFor(
  track: IntakeTrackKey,
  stepKey: string,
): readonly string[] {
  const schema = schemaFor(track, stepKey) as
    { shape?: Record<string, unknown> } | undefined;

  return schema?.shape ? Object.keys(schema.shape) : [];
}

/**
 * The subset of a step's fields that hold free text.
 *
 * The second consumer of a Zod object's shape, and it lives here for the same
 * reason the first one does (M-PORT-8): reaching into a validator's internals
 * is a thing this codebase does in exactly one module, so a Zod upgrade that
 * moves `_def` breaks one file rather than every caller who guessed.
 *
 * "Free text" means a string field, optional or not — never an array, a
 * boolean, or a record. The business primer (PORT-10) proposes only into these:
 * a checkbox group has an enumerated option set that a free-text proposal would
 * miss, and the shape guard would silently drop the answer on save.
 */
export function textFieldKeysFor(
  track: IntakeTrackKey,
  stepKey: string,
): readonly string[] {
  const schema = schemaFor(track, stepKey) as
    { shape?: Record<string, unknown> } | undefined;

  if (!schema?.shape) return [];

  return Object.entries(schema.shape)
    .filter(([, field]) => isStringField(field))
    .map(([key]) => key);
}

/** Unwraps one optional layer and asks whether what is left is a string. */
function isStringField(field: unknown): boolean {
  const def = (field as { _def?: { type?: string; innerType?: unknown } })
    ?._def;
  if (!def) return false;
  if (def.type === "string") return true;
  return def.innerType ? isStringField(def.innerType) : false;
}

/** The document's label for an answer key. Falls back to the raw key. */
export function labelFor(track: IntakeTrackKey, key: string): string {
  return registryFor(track, "generic").labels[key] ?? key;
}

/**
 * What an engagement's site is for. The one answer the cartridge branches on.
 *
 * Durable engagements have no kind and never will; callers on that track do not
 * ask, and the resolver below is the only thing that reads this.
 */
export function kindOf(answers: IntakeAnswers): ShowcaseKind {
  return kindFor(answers);
}

/** Which field groups a kind's questionnaire carries (PORT-13/14/15 read this). */
export function groupsFor(kind: ShowcaseKind): ReadonlySet<ShowcaseGroup> {
  return groupsForKind(kind);
}

/**
 * Whether a kind is asked one of the five optional questions.
 *
 * The steps that flex by kind read this rather than comparing kind keys
 * themselves. Three of them did compare — and two wrote the same comparison
 * for different reasons, which is exactly how a registry and a component drift
 * apart (M-ADM-7).
 */
export function kindAsks(
  kind: ShowcaseKind,
  question: ShowcaseKindQuestion,
): boolean {
  return kindAsksQuestion(kind, question);
}

/** Which array a kind's step 4 fills, and which entry card it renders. */
export function workShapeFor(kind: ShowcaseKind): ShowcaseWorkShape {
  return workShapeForKind(kind);
}

/**
 * The cartridge's two enumerations, for `yarn verify:tracks`.
 *
 * Exported through this seam rather than imported from the registries directly,
 * so the verifier proves the same resolver every surface uses rather than the
 * modules behind it.
 */
export const showcaseFlavours = SHOWCASE_FLAVOURS;
export const showcaseCopySlots = SHOWCASE_COPY_SLOTS;

/** The kinds themselves, for the start form's picker and step 1's kind line. */
export function showcaseKinds(): typeof SHOWCASE_KINDS {
  return SHOWCASE_KINDS;
}

/** One kind's label, for the surfaces that show it back rather than ask it. */
export function labelForKind(kind: ShowcaseKind): string {
  return kindEntry(kind).label;
}

/**
 * The disciplines a portfolio or a studio may check, for the start form.
 *
 * Through this seam rather than imported from the registry, for the reason
 * every other registry fact comes through here: the start form was the one
 * surface reaching into `showcase-steps.ts` directly (noted at ADM-4), and the
 * cartridge verifier proves what the seam serves, not what a module exports.
 */
export function showcaseDisciplines(): typeof SHOWCASE_DISCIPLINES {
  return SHOWCASE_DISCIPLINES;
}

/**
 * The pack a kind earns, resolved against a disciplines answer.
 *
 * Exported for the start form, which needs a pack before an engagement exists —
 * it is choosing the words on the very screen that mints one.
 */
export function flavourForKind(
  kind: ShowcaseKind,
  disciplines: readonly string[] | undefined,
): ShowcaseFlavour {
  return packForKind(kind, () => flavourFromDisciplines(disciplines));
}

/**
 * Which example-site set an engagement's taste step should load.
 *
 * The same as its copy pack for every kind but a studio: a studio reads entity
 * copy — it is an organisation — while its gallery may follow the discipline
 * its work is in, because a design studio and a film studio do not need the
 * same twenty sites. When the discipline has no set of its own, the entity set
 * is the honest floor (kinds scope §2.1).
 */
export function galleryFlavourFor(
  flavour: ShowcaseFlavour,
  disciplines: readonly string[] | undefined,
): ShowcaseFlavour {
  if (flavour !== "entity") return flavour;

  const byDiscipline = flavourFromDisciplines(disciplines);
  return byDiscipline === "generic" ? "entity" : byDiscipline;
}

/**
 * Which copy pack an engagement has earned, from what it answered.
 *
 * The kind decides, and the discipline answer reaches exactly one branch: a
 * portfolio's, where it always did (D-PORT-8). Before PORT-11 this read the
 * disciplines alone, which is why a consultant and a filmmaker got the same
 * words — the answer that said otherwise was stored and never read
 * (`CODED-INTAKE-CATEGORY-AUDIT.md` B2).
 *
 * Durable has no packs and never asks; it is always generic, which for that
 * track means "the only copy there is".
 */
export function flavourFor(
  track: IntakeTrackKey,
  answers: IntakeAnswers,
): ShowcaseFlavour {
  if (track !== "showcase") return "generic";

  const about = answers.about as { disciplines?: string[] } | undefined;
  return flavourForKind(kindFor(answers), about?.disciplines);
}

/**
 * The mono eyebrow that sits above every screen in a track's flow.
 *
 * Agora is the charging entity on both tracks and the name on the client's
 * statement, so it leads; what follows names the build they are buying. One
 * home, because the same two words appear on the start page, the welcome
 * screen, the resume screen, and the pay screen, and four copies drift.
 */
export function eyebrowFor(track: IntakeTrackKey): string {
  return track === "showcase"
    ? "Agora · Custom build"
    : "Agora · Website build";
}

/** The flexing strings themselves, for the step slices that render them. */
export function copyPackFor(flavour: ShowcaseFlavour): ShowcaseCopyPack {
  return resolvePack(flavour);
}

/**
 * Step 6's person-voice options, resolved for one client's pack and name.
 *
 * Re-exported through this seam rather than imported from the registry
 * directly, for the same reason `copyPackFor` is: a step component asks one
 * module what its copy is, and the registry keeps exactly one importer.
 */
export function personVoiceOptionsFor(
  flavour: ShowcaseFlavour,
  displayName?: string,
): readonly PersonVoiceOption[] {
  return personVoiceOptions(flavour, displayName);
}
