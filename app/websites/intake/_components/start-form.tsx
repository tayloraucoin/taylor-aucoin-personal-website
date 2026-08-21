"use client";

import { useActionState, useState } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { startIntake, type StartResult } from "../_actions/start";
import { Field } from "./field";
import { TextField, looksLikeEmail } from "./text-field";

async function action(
  _previous: StartResult | null,
  formData: FormData,
): Promise<StartResult | null> {
  return startIntake(formData);
}

/**
 * The public start form.
 *
 * Six fields and no autosave, because there is no engagement to save against
 * yet — this submission is what creates one. It is the only screen in the flow
 * without the safety net, which is why it is kept short enough to retype
 * without resentment if something goes wrong.
 *
 * Validation is on blur, never while typing. Telling someone their email is
 * invalid at the third character is telling them something they already know
 * and have not finished fixing. The message clears the moment they resume
 * typing, so a correction is never argued with mid-keystroke.
 *
 * Nothing here is behind a payment. A client can get this far, see exactly
 * what they have started, and walk away owing nothing.
 */
export function StartForm() {
  const [result, formAction, pending] = useActionState(action, null);
  const [emailError, setEmailError] = useState<string | null>(null);

  return (
    <form action={formAction}>
      <Field id="businessName" label="Business name">
        <TextField
          id="businessName"
          name="businessName"
          required
          autoComplete="organization"
        />
      </Field>

      <Field id="contactName" label="Your name">
        <TextField id="contactName" name="contactName" required autoComplete="name" />
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
          placeholder="Mobile detailing in Langley"
        />
      </Field>

      <Field
        id="googleMapsUrl"
        label="Your business on Google Maps"
        help="Open Google Maps, find your business, tap Share, and paste the link. This is how your real reviews get onto the site."
      >
        <TextField
          id="googleMapsUrl"
          name="googleMapsUrl"
          mode="url"
          placeholder="maps.app.goo.gl/…"
          helpId="googleMapsUrl-help"
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
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {result && "error" in result ? (
        <p
          role="alert"
          className="mb-5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {result.error}
        </p>
      ) : null}

      <GradientButton type="submit" disabled={pending}>
        {pending ? "Starting…" : "Start →"}
      </GradientButton>
    </form>
  );
}
