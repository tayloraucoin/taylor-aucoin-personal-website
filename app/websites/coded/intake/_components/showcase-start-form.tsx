"use client";

import { useActionState, useState } from "react";
import { useIsPreview } from "@/components/intake/preview-mode";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  copyPackFor,
  flavourForKind,
  showcaseDisciplines,
  showcaseKinds,
  ventureTypeChoices,
} from "@/lib/intake/tracks";
import { startShowcaseIntake, type StartResult } from "../_actions/start";
import {
  ChoiceGroup,
  type Choice,
} from "../../../intake/_components/choice-group";
import { Field } from "../../../intake/_components/field";
import {
  looksLikeEmail,
  TextField,
} from "../../../intake/_components/text-field";

async function action(
  _previous: StartResult | null,
  formData: FormData,
): Promise<StartResult | null> {
  return startShowcaseIntake(formData);
}

/**
 * The public start form for the showcase track.
 *
 * Every label, placeholder, help line, and validation string below is
 * `docs/_legacy/websites/portfolio-intake-questions-v2.md` verbatim. It is approved
 * copy and it does not get improved in passing.
 *
 * No autosave, because there is no engagement to save against yet — this
 * submission is what creates one. It is the only screen in the flow without
 * the safety net, which is why it stays short enough to retype without
 * resentment.
 *
 * Validation is on blur, never while typing: telling someone their email is
 * wrong at the third character tells them something they already know and have
 * not finished fixing.
 */

/**
 * What the site is for — one answer, and the one the whole cartridge reads.
 *
 * This replaced a multi-select whose answer was stored and consumed by nothing
 * (`CODED-INTAKE-CATEGORY-AUDIT.md` B2). Single-select is the point: a person
 * can have several disciplines, but a site has one job that leads, and one
 * answer is what lets every string downstream be certain (D-PORT-8).
 *
 * The labels live with the kinds themselves, so the picker, the copy resolver,
 * and step 1's kind line cannot disagree about what "venture" means.
 */
const KINDS = showcaseKinds();
const KIND_OPTIONS: readonly Choice[] = KINDS.map((kind) => ({
  value: kind.key,
  label: kind.label,
}));

/**
 * Widened past the v2 doc's five on 2026-09-03 (Taylor). The list is the
 * registry's, through the seam, so the form and the flavour resolver cannot
 * disagree about which keys exist — see `SHOWCASE_DISCIPLINES` for why only
 * `film` earns a pack of its own.
 */
const DISCIPLINES: readonly Choice[] = showcaseDisciplines().map((d) => ({
  value: d.key,
  label: d.label,
}));

const EMAIL_ERROR =
  "That doesn't look like an email address — check for a typo.";

/**
 * A fixture's choices on arrival (VEN, C4). Fixture-only: the public page
 * never passes one, and every field it seeds is one the client sets by hand.
 */
export type StartFormSeed = {
  siteKind?: string;
  ventureType?: string;
  currentWebsite?: string;
};

export function ShowcaseStartForm({
  promo,
  invalidEmail,
  seed,
}: {
  promo?: string;
  /** The `invalid` fixture: an address that fails the check, already blurred. */
  invalidEmail?: string;
  seed?: StartFormSeed;
}) {
  const [result, formAction, pending] = useActionState(action, null);
  // Submitting would mint a real engagement and a real token.
  const preview = useIsPreview();
  const [emailError, setEmailError] = useState<string | null>(
    invalidEmail ? EMAIL_ERROR : null,
  );
  const [siteKind, setSiteKind] = useState<string>(seed?.siteKind ?? "");
  // Held here until submit; the action seeds it only on a venture.
  const [ventureType, setVentureType] = useState<string>(
    seed?.ventureType ?? "",
  );
  const [disciplines, setDisciplines] = useState<string[]>([]);

  // Everything below the kind question is shaped by it: whether we ask about
  // disciplines, whether the thing has a name of its own, and what the
  // one-liner is even called. Nothing is gated on it — an unanswered picker
  // simply leaves the questionnaire on its generic floor.
  const kind = KINDS.find((entry) => entry.key === siteKind);
  const pack = copyPackFor(
    kind ? flavourForKind(kind.key, disciplines) : "generic",
  );
  // Non-empty only for a pack that asks what kind of venture it is (D-VEN-3).
  const subtypeChoices = ventureTypeChoices(pack);

  return (
    <form action={formAction}>
      {/* Carried from the link Taylor sent, so an offer made in conversation
          survives the one page that mints the engagement. */}
      {promo ? <input type="hidden" name="promo" value={promo} /> : null}

      {/* The checkbox groups are controlled React state, so their values reach
          the action as hidden fields rather than as native checkbox entries. */}
      {siteKind ? (
        <input type="hidden" name="siteKind" value={siteKind} />
      ) : null}
      {subtypeChoices.length > 0 && ventureType ? (
        <input type="hidden" name="ventureType" value={ventureType} />
      ) : null}
      {disciplines.map((value) => (
        <input key={value} type="hidden" name="disciplines" value={value} />
      ))}

      <Field id="contactName" label="Your name">
        <TextField
          id="contactName"
          name="contactName"
          required
          autoComplete="name"
        />
      </Field>

      <Field id="contactEmail" label="Email" error={emailError ?? undefined}>
        <TextField
          id="contactEmail"
          name="contactEmail"
          mode="email"
          required
          defaultValue={invalidEmail}
          invalid={Boolean(emailError)}
          helpId={emailError ? "contactEmail-help" : undefined}
          onValueChange={() => {
            if (emailError) setEmailError(null);
          }}
          onBlur={(event) => {
            const value = event.target.value.trim();
            setEmailError(value && !looksLikeEmail(value) ? EMAIL_ERROR : null);
          }}
        />
      </Field>

      <Field
        id="contactPhone"
        label="Phone"
        help="So Taylor can reach you about the build."
      >
        <TextField
          id="contactPhone"
          name="contactPhone"
          mode="tel"
          helpId="contactPhone-help"
        />
      </Field>

      <Field id="siteKind" label={pack.kindLabel} help={pack.kindHelp}>
        {/* Copy comes from the pack and the kind registry, never from here —
            Taylor's human-hand pass edits one file (`showcase-copy.ts`), and a
            literal on this screen would be a second home it never reaches. */}
        <ChoiceGroup
          legend={pack.kindLabel}
          name="siteKindChoice"
          options={KIND_OPTIONS}
          value={siteKind ? [siteKind] : []}
          onChange={(next) => setSiteKind(next[0] ?? "")}
        />
      </Field>

      {/* Revealed in place under the kind group, after it in DOM order, so Tab
          reaches it next and focus stays on the kind radio (C-VEN-kind-7).
          Optional: skipped, the questions stay plain venture. Values from the
          registry and words from the pack, never from here (C-VEN-kind-5). */}
      {subtypeChoices.length > 0 && pack.ventureType ? (
        <Field
          id="ventureType"
          label={pack.ventureType.label}
          help={pack.ventureType.help}
        >
          <ChoiceGroup
            legend={pack.ventureType.label}
            name="ventureTypeChoice"
            options={subtypeChoices}
            value={ventureType ? [ventureType] : []}
            onChange={(next) => setVentureType(next[0] ?? "")}
          />
        </Field>
      ) : null}

      {/* Asked of everything but a portfolio, where the practice is the person
          and the engagement's name is already their own (M-PORT-3). */}
      {kind?.asksName ? (
        <Field id="entityName" label={pack.entityNameLabel}>
          <TextField
            id="entityName"
            name="entityName"
            placeholder={pack.entityNamePlaceholder}
          />
        </Field>
      ) : null}

      <Field id="whatYouDo" label={pack.whatYouDoLabel}>
        <TextField
          id="whatYouDo"
          name="whatYouDo"
          placeholder="Founder and product designer in Vancouver"
        />
      </Field>

      {/* Only the two kinds whose pack a discipline can change. A consultant
          answering this would be answering a question with no consequence. */}
      {kind?.asksDisciplines ? (
        <>
          <Field
            id="disciplines"
            label="What's the work?"
            help="This decides which example sites you'll review later, and how we talk about your work inside. Check everything that's true."
          >
            {/* The help line moved up here from the free-text field below it:
                the reason to answer belongs beside the answer, not past it. */}
            <ChoiceGroup
              legend="What's the work?"
              name="disciplinesChoice"
              options={DISCIPLINES}
              value={disciplines}
              onChange={setDisciplines}
              multiple
            />
          </Field>

          <Field id="disciplinesOther" label="Something else?">
            <TextField id="disciplinesOther" name="disciplinesOther" />
          </Field>
        </>
      ) : null}

      <Field
        id="currentWebsite"
        label="Current website"
        help="If you have one. Leave blank if you don't."
      >
        <TextField
          id="currentWebsite"
          name="currentWebsite"
          mode="url"
          helpId="currentWebsite-help"
          defaultValue={seed?.currentWebsite}
        />
      </Field>

      {/* Honeypot. Hidden from people, tempting to bots. */}
      <div
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {result && "error" in result ? (
        <p
          role="alert"
          className="mb-5 text-meta leading-[1.55] text-(--color-ink)"
        >
          {result.error}
        </p>
      ) : null}

      {/* An address with an intake already open is answered by email rather
          than by opening it here, so this form can never show one person
          another person's answers. [COPY — draft, pending Taylor] */}
      {result && "sent" in result ? (
        <p
          role="status"
          className="mb-5 text-meta leading-[1.55] text-(--color-body)"
        >
          You already have one of these on the go. We&rsquo;ve sent the link to
          that address.
        </p>
      ) : null}

      <GradientButton type="submit" disabled={pending || preview}>
        {pending ? "Starting…" : "Start →"}
      </GradientButton>
      {preview ? (
        <p className="mt-2 text-meta text-(--color-dim)">
          Starting is disabled in preview.
        </p>
      ) : null}
    </form>
  );
}
