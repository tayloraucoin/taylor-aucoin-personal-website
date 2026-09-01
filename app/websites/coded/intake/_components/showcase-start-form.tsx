"use client";

import { useActionState, useState } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { SHOWCASE_DISCIPLINES } from "@/lib/intake/showcase-steps";
import { ChoiceGroup, type Choice } from "../../../intake/_components/choice-group";
import { Field } from "../../../intake/_components/field";
import {
  looksLikeEmail,
  TextField,
} from "../../../intake/_components/text-field";
import { startShowcaseIntake, type StartResult } from "../_actions/start";
import { useIsPreview } from "@/components/intake/preview-mode";

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
 * `docs/websites/portfolio-intake-questions-v2.md` verbatim. It is approved
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
 * The categories, with three not yet open.
 *
 * They render as real, focusable, announced options that cannot be chosen —
 * the roadmap is the point, and hiding it behind a tooltip would show it to
 * sighted mouse users only. Whether they appear at all is Taylor's open item;
 * dropping them is deleting three lines of this array.
 */
const SITE_KINDS: readonly Choice[] = [
  { value: "portfolio", label: "Portfolio — your creative work is the product" },
  { value: "consultant", label: "Consultant or coach" },
  { value: "speaker", label: "Speaker or author" },
  { value: "studio", label: "Studio or small team" },
  { value: "other", label: "Something else" },
];

const DISCIPLINES: readonly Choice[] = SHOWCASE_DISCIPLINES.map((d) => ({
  value: d.key,
  label: d.label,
}));

export function ShowcaseStartForm({ promo }: { promo?: string }) {
  const [result, formAction, pending] = useActionState(action, null);
  // Submitting would mint a real engagement and a real token.
  const preview = useIsPreview();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [siteKinds, setSiteKinds] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);

  return (
    <form action={formAction}>
      {/* Carried from the link Taylor sent, so an offer made in conversation
          survives the one page that mints the engagement. */}
      {promo ? <input type="hidden" name="promo" value={promo} /> : null}

      {/* The checkbox groups are controlled React state, so their values reach
          the action as hidden fields rather than as native checkbox entries. */}
      {siteKinds.map((value) => (
        <input key={value} type="hidden" name="siteKinds" value={value} />
      ))}
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
          invalid={Boolean(emailError)}
          helpId={emailError ? "contactEmail-help" : undefined}
          onValueChange={() => {
            if (emailError) setEmailError(null);
          }}
          onBlur={(event) => {
            const value = event.target.value.trim();
            setEmailError(
              value && !looksLikeEmail(value)
                ? "That doesn't look like an email address — check for a typo."
                : null,
            );
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

      <Field id="whatYouDo" label="What you do, in one line">
        <TextField
          id="whatYouDo"
          name="whatYouDo"
          placeholder="Founder and product designer in Vancouver"
        />
      </Field>

      <Field
        id="siteKinds"
        label="What kind of site is this?"
        help="If you're a mix, check everything that's true."
      >
        <ChoiceGroup
          legend="What kind of site is this?"
          name="siteKindsChoice"
          options={SITE_KINDS}
          value={siteKinds}
          onChange={setSiteKinds}
          multiple
        />
      </Field>

      {/* Only asked once "Something else" is checked — an always-visible box
          under a list nobody picked from is a question about nothing. */}
      {siteKinds.includes("other") ? (
        <Field id="siteKindsOther" label="Tell us what kind">
          <TextField
            id="siteKindsOther"
            name="siteKindsOther"
            helpId="siteKindsOther-help"
          />
        </Field>
      ) : null}

      <Field id="disciplines" label="What's the work?">
        <ChoiceGroup
          legend="What's the work?"
          name="disciplinesChoice"
          options={DISCIPLINES}
          value={disciplines}
          onChange={setDisciplines}
          multiple
        />
      </Field>

      <Field
        id="disciplinesOther"
        label="Something else?"
        help="This decides which example sites you'll review later, and how we talk about your work inside. Check everything that's true."
      >
        <TextField
          id="disciplinesOther"
          name="disciplinesOther"
          helpId="disciplinesOther-help"
        />
      </Field>

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
          className="mb-5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {result.error}
        </p>
      ) : null}

      <GradientButton type="submit" disabled={pending || preview}>
        {pending ? "Starting…" : "Start →"}
      </GradientButton>
      {preview ? (
        <p className="mt-2 text-xs text-(--color-dim)">
          Starting is disabled in preview.
        </p>
      ) : null}
    </form>
  );
}
