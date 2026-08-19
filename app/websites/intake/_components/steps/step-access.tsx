"use client";

import type { SocialAccountAnswer } from "@/lib/validators/intake";
import { SITE, STRIPE_SETUP_GUIDE_URL } from "@/lib/config";
import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { ChoiceAnswer, LongAnswer, TextAnswer } from "../answer-inputs";
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

/**
 * Pointing a domain at the new site needs either a seat on the account or a
 * short list of records typed into it. Both are offered because neither is
 * strictly better: an invite is less work for the client, records keep the
 * account untouched — and a client who wants neither today can say so without
 * it reading as a refusal.
 */
const DOMAIN_ACCESS = [
  { value: "invite", label: "Invite you to my domain account" },
  { value: "records", label: "Send me what to add and I'll do it" },
  { value: "unsure", label: "Not sure — let's sort it on the call" },
] as const;

const CONTACT_METHODS = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

/**
 * Prices live in the label, not in a footnote. A tick-box whose cost is one
 * tap away is a dark pattern, and this list sits inside a form the client has
 * already paid a deposit on — the one place trust is most expensive to lose.
 */
const EXTRAS = [
  { value: "booking", label: "Online booking setup — $250" },
  { value: "stripe", label: "Stripe payments setup — $250" },
  { value: "gbp", label: "Google Business Profile clean-up — $300" },
  { value: "logo", label: "Logo refresh — $250" },
  { value: "extraPage", label: "An extra page beyond the standard five — $150 each" },
  { value: "none", label: "None of these for now" },
] as const;

const CALLOUT_CLASS =
  "mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5";
const CALLOUT_EYEBROW_CLASS =
  "font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)";
const CALLOUT_BODY_CLASS =
  "mt-3 font-body text-[16px] font-light leading-[1.6] text-(--color-body)";
const CALLOUT_LINK_CLASS =
  "font-mono text-[11px] uppercase tracking-[.10em] text-(--color-c2) underline underline-offset-4 hover:text-(--color-c3)";

function asSocials(value: unknown): SocialAccountAnswer[] {
  return Array.isArray(value) ? (value as SocialAccountAnswer[]) : [];
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
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
 *
 * The domain name is captured whichever way the ownership question is
 * answered. "Not sure" still usually knows the address, and "no" still has an
 * opinion about what it should be — and registration is part of the build, so
 * that opinion is work we would otherwise chase on the call.
 *
 * The extras block sits near the end but never at it: "Best way to reach you"
 * and then "Anything else we should know?" follow it, so the last thing a
 * client reads is an invitation rather than a price list. It is a callout in
 * the same grammar as the no-passwords block above — deliberately *not* the
 * gradient ring, which appears exactly once in this flow and is spent on the
 * Step 5 voice note (D-INT-3). Money must never be the loudest thing on the
 * screen.
 *
 * The closing question is open on purpose, in a form that otherwise prefers
 * checkboxes. Every other field here narrows; this one is the only place a
 * client can raise something the form never thought to ask, and on the Clean
 * Coast build the most expensive fact surfaced in exactly that shape — a
 * throwaway sentence, not an answer to a direct question.
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

  const ownsDomain = form.values.ownsDomain;
  const extras = asList(form.values.extrasWanted);
  const wantsBooking = extras.includes("booking");
  const wantsStripe = extras.includes("stripe");

  return (
    <>
      <div className={CALLOUT_CLASS}>
        <p className={CALLOUT_EYEBROW_CLASS}>No passwords · ever</p>
        <p className={CALLOUT_BODY_CLASS}>
          We never ask for passwords. Everything below is either something you
          send us an invite to, or something we set up together on a call.
        </p>
      </div>

      <ChoiceAnswer
        form={form}
        name="ownsDomain"
        label="Do you own a domain?"
        help="A web address you've already bought — yourbusiness.ca, or similar."
        options={YES_NO_UNSURE}
      />

      {ownsDomain === "yes" ? (
        <>
          <TextAnswer
            form={form}
            name="domainName"
            label="Which one?"
            placeholder="yourbusiness.ca"
          />
          <TextAnswer
            form={form}
            name="registrar"
            label="Where did you buy it?"
            help="GoDaddy, Namecheap, Squarespace — or 'not sure'."
          />

          <ChoiceAnswer
            form={form}
            name="domainAccess"
            label="How would you rather handle access?"
            help={`To put your site on that address we need to change two settings where you bought it. Either you invite ${SITE.email} to the account, or I send you exactly what to paste in. Still no passwords, and nothing changes until we do it together.`}
            options={DOMAIN_ACCESS}
          />
        </>
      ) : null}

      {ownsDomain === "unsure" ? (
        <TextAnswer
          form={form}
          name="domainName"
          label="What do you think it is?"
          help="A guess is fine — we can look it up from there."
          placeholder="yourbusiness.ca"
        />
      ) : null}

      {ownsDomain === "no" ? (
        <TextAnswer
          form={form}
          name="domainName"
          label="Any address you'd want?"
          help="Registering it is part of the build. If you haven't thought about it, skip this."
          placeholder="yourbusiness.ca"
        />
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
        label="Can you manage your Google Business Profile?"
        help="Whether you can log in and change it — not whether the listing exists."
        options={GBP}
      />

      <TextAnswer
        form={form}
        name="googleMapsUrl"
        label="Your business on Google Maps"
        help="Open Google Maps, find your business, tap Share, paste the link. This is how we get the right reviews onto your site."
        mode="url"
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

      <div className={CALLOUT_CLASS}>
        <p className={CALLOUT_EYEBROW_CLASS}>Extras · nothing charged here</p>
        <p className={CALLOUT_BODY_CLASS}>
          None of these are part of your build. Tick anything you want and
          I&apos;ll add it to your final invoice — I&apos;ll confirm the price
          with you first, and nothing is charged from this form.
        </p>
      </div>

      <ChoiceAnswer
        form={form}
        name="extrasWanted"
        label="Anything you'd like added?"
        options={EXTRAS}
        multiple
        exclusiveValue="none"
      />

      {wantsBooking ? (
        <>
          <LongAnswer
            form={form}
            name="bookingServices"
            label="Which services should people be able to book online?"
            help="Leave off anything you'd rather quote first."
          />
          <TextAnswer
            form={form}
            name="bookingCalendar"
            label="What calendar do you use?"
            help="Google, Apple, Outlook — or 'none'."
          />
        </>
      ) : null}

      {wantsStripe ? (
        <>
          <div className={CALLOUT_CLASS}>
            <p className={CALLOUT_EYEBROW_CLASS}>
              Stripe · about 20 minutes of your time
            </p>
            <p className={CALLOUT_BODY_CLASS}>
              Stripe is a regulated financial service, so the owner has to enter
              their own identity and banking details. That part can&apos;t be
              done for you — and you shouldn&apos;t want it to be. Everything
              after it is mine: products, checkout, receipts, tax, testing.
            </p>
            <p className={CALLOUT_BODY_CLASS}>
              I will never ask for your SIN, your ID, your banking details, or
              your Stripe password. Don&apos;t send them to anyone who does.
            </p>
            <p className={CALLOUT_BODY_CLASS}>
              When you&apos;re done, invite {SITE.email} to the account as an
              admin. That&apos;s the step that lets me build the rest.
            </p>

            {form.values.hasStripe === "yes" ? (
              <p className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)">
                You said you already have a Stripe account — tell me before you
                make a second one. Depending on what it was for, we may be able
                to use it.
              </p>
            ) : null}

            <p className="mt-4">
              <a
                href={STRIPE_SETUP_GUIDE_URL}
                target="_blank"
                rel="noreferrer"
                className={CALLOUT_LINK_CLASS}
              >
                Read the setup guide
              </a>
            </p>
          </div>

          <TextAnswer
            form={form}
            name="stripeAccountEmail"
            label="What email will the Stripe account be under?"
            help="Use a business address you'll keep — whoever controls it controls the account."
            mode="email"
          />
          <TextAnswer
            form={form}
            name="statementDescriptor"
            label="What should show on your customer's card statement?"
            help="Usually your business name, up to 22 characters. Make it recognisable or you'll get calls asking what the charge was."
          />
        </>
      ) : null}

      <ChoiceAnswer
        form={form}
        name="bestContactMethod"
        label="Best way to reach you"
        options={CONTACT_METHODS}
      />

      <LongAnswer
        form={form}
        name="anythingElse"
        label="Anything else we should know?"
        help="Anything I haven't asked about — something you want on the site, something you'd hate, a quirk of your trade that keeps catching people out."
      />
    </>
  );
}
