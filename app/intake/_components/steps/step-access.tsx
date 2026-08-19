"use client";

import type { SocialAccountAnswer } from "@/lib/validators/intake";
import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { ChoiceAnswer, TextAnswer } from "../answer-inputs";
import { Field } from "../field";
import { RepeatableBlock } from "../repeatable-block";
import { TextField } from "../text-field";

const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

const GBP = [
  { value: "have", label: "I have one" },
  { value: "unsure", label: "Not sure" },
  { value: "none", label: "I don't have one" },
] as const;

const CONTACT_METHODS = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

function asSocials(value: unknown): SocialAccountAnswer[] {
  return Array.isArray(value) ? (value as SocialAccountAnswer[]) : [];
}

/**
 * Step 9 — Accounts and access. The step with the highest abandonment risk, so
 * it opens by removing the reason for it.
 *
 * There is no password field here, and there is no free-text field phrased in
 * a way that invites one. Everything below is either an invitation the client
 * sends us or something set up together on a call — the confirmation email
 * lists exactly which.
 *
 * The domain and domain-email questions come first and carry ink-weight
 * labels. Breaking a client's email during a DNS cutover is the fastest way to
 * destroy the relationship and it is entirely preventable by asking here.
 */
export function StepAccess({
  token,
  initial,
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "access", initial });
  useReportSaveState(form.state, form.retry);

  const ownsDomain = form.values.ownsDomain === "yes";

  return (
    <>
      <div className="mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
        <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
          No passwords · ever
        </p>
        <p className="mt-3 font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
          We never ask for passwords. Everything below is either something you
          send us an invite to, or something we set up together on a call.
        </p>
      </div>

      <ChoiceAnswer
        form={form}
        name="ownsDomain"
        label="Do you own a domain?"
        options={YES_NO_UNSURE}
      />

      {ownsDomain ? (
        <>
          <TextAnswer form={form} name="domainName" label="Which one?" />
          <TextAnswer
            form={form}
            name="registrar"
            label="Where did you buy it?"
            help="GoDaddy, Namecheap, Squarespace — or 'not sure'."
          />
        </>
      ) : null}

      <ChoiceAnswer
        form={form}
        name="emailAtDomain"
        label="Do you use email at that domain?"
        help="Important — we need to know so your email keeps working."
        options={YES_NO_UNSURE}
      />

      <ChoiceAnswer
        form={form}
        name="googleBusinessProfile"
        label="Google Business Profile"
        options={GBP}
      />

      <Field id="f-socials" label="Social accounts">
        <RepeatableBlock<SocialAccountAnswer>
          items={asSocials(form.values.socials)}
          onChange={(next) => form.setValue("socials", next)}
          emptyItem={() => ({})}
          addLabel="Add another account"
          renderItem={(social, index, update) => (
            <div className="space-y-3">
              <TextField
                id={`social-${index}-platform`}
                aria-label="Platform"
                placeholder="Instagram, Facebook…"
                value={social.platform ?? ""}
                onChange={(e) => update({ ...social, platform: e.target.value })}
                onBlur={form.flush}
              />
              <TextField
                id={`social-${index}-url`}
                aria-label="Link or handle"
                placeholder="Link or handle"
                value={social.url ?? ""}
                onChange={(e) => update({ ...social, url: e.target.value })}
                onBlur={form.flush}
              />
            </div>
          )}
        />
      </Field>

      <TextAnswer form={form} name="existingWebsite" label="Existing website" />
      <TextAnswer
        form={form}
        name="existingWebsitePlatform"
        label="What is it built on?"
        help="Wix, Squarespace, WordPress — or 'not sure'."
      />

      <ChoiceAnswer
        form={form}
        name="hasStripe"
        label="Do you have a Stripe account?"
        help="Only matters if you'll take payments through the site."
        options={YES_NO_UNSURE}
      />

      <TextAnswer
        form={form}
        name="bookingTool"
        label="Booking or scheduling tool you use"
      />

      <ChoiceAnswer
        form={form}
        name="bestContactMethod"
        label="Best way to reach you"
        options={CONTACT_METHODS}
      />
    </>
  );
}
