"use client";

import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor } from "@/lib/intake/tracks";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { Reveal } from "../../../../intake/_components/reveal";
import { TextField } from "../../../../intake/_components/text-field";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { asks, ForKinds, not } from "../for-kinds";
import { UpsellQuestions } from "../upsell-block";

type Account = { platform?: string; link?: string };

const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

const DOMAIN_ACCESS = [
  { value: "invite", label: "Invite you to my domain account" },
  { value: "instructions", label: "Send me what to add and I'll do it" },
  { value: "call", label: "Not sure — let's sort it on the call" },
] as const;

const HANDS_ON = [
  { value: "very", label: "Very — I'll edit it myself with Claude Code" },
  { value: "some", label: "A little — small tweaks myself, you for the rest" },
  { value: "none", label: "Not at all — I'll send you changes" },
] as const;

const CONTACT_METHOD = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

/**
 * The domain question's label and help change with the answer above them.
 *
 * Asking "Which one?" of someone who said No is asking a question with no
 * answer; asking it of someone who said Not sure invites a guess they think
 * they will be held to. One control, three honest framings — the v2 doc
 * specifies all three verbatim.
 */
const DOMAIN_FIELD: Record<string, { label: string; help?: string }> = {
  yes: { label: "Which one?" },
  unsure: {
    label: "What do you think it is?",
    help: "A guess is fine — we can look it up from there.",
  },
  no: {
    label: "Any address you'd want?",
    help: "Registering it is part of the build. If you haven't thought about it, skip this.",
  },
};

function asAccounts(value: unknown): Account[] {
  return Array.isArray(value) ? (value as Account[]) : [];
}

/**
 * Step 9 — Accounts and access.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 9,
 * verbatim.
 *
 * **There is no password field here and there never will be one.** Access is
 * collected out of band: the callout says what we will ask for instead, and
 * every route to it is an invite or a call. A credential typed into a
 * free-text box is a design failure upstream of the box, so no field here is
 * labelled in a way that invites one.
 *
 * The domain questions come first and carry the most weight, because they are
 * the ones that can break something a client already depends on — an email
 * address that stops receiving is a worse outcome than any missing answer.
 */
export function StepAccess({
  token,
  initial,
  flavour,
  kind,
  purchasedExtras = [],
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  kind: ShowcaseKind;
  /**
   * What this engagement paid for on the pay screen, in the extras vocabulary.
   *
   * Empty in a preview, which buys nothing — the review surface reaches these
   * blocks through document mode instead, where `Reveal` renders every branch
   * under a line naming what opens it.
   */
  purchasedExtras?: readonly string[];
}) {
  const pack = copyPackFor(flavour);

  const form = useStepAutosave({ token, stepKey: "access", initial });
  useReportSaveState(form.state, form.retry);

  const ownsDomain =
    typeof form.values.ownsDomain === "string" ? form.values.ownsDomain : "";
  const domainField = DOMAIN_FIELD[ownsDomain] ?? DOMAIN_FIELD.yes!;

  return (
    <>
      <div className="mb-9 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
        <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
          No passwords · ever
        </p>
        <p className="mt-3 font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
          We never ask for account passwords. Everything below is either
          something you send us an invite to, or something we set up together on
          a call.{" "}
          <span className="text-(--color-ink)">
            Any invite — domain, Vimeo, anything — goes to
            hello@tayloraucoin.com.
          </span>
        </p>
      </div>

      <ChoiceAnswer
        form={form}
        name="ownsDomain"
        label="Do you own a domain?"
        help="A web address you've already bought — yourname.com, or similar."
        options={YES_NO_UNSURE}
      />

      <TextAnswer
        form={form}
        name="domainName"
        label={domainField.label}
        help={domainField.help}
        placeholder="yourname.com"
      />

      <Reveal
        values={form.values}
        dependsOn={{ field: "ownsDomain", equals: "yes" }}
      >
        <>
          <TextAnswer
            form={form}
            name="registrar"
            label="Where did you buy it?"
            help={`GoDaddy, Namecheap, Squarespace — or "not sure."`}
          />

          <ChoiceAnswer
            form={form}
            name="domainAccess"
            label="How would you rather handle access?"
            help="Invites go to hello@tayloraucoin.com."
            options={DOMAIN_ACCESS}
          />
        </>
      </Reveal>

      <ChoiceAnswer
        form={form}
        name="emailAtDomain"
        label="Do you use email at that domain?"
        help="Important — we need to know so your email keeps working."
        options={YES_NO_UNSURE}
      />

      {/* The tools group, and nothing opposite it.

          "Where does your video live?" used to sit on the other side of this
          branch for a portfolio and a studio, and it was asking someone to
          name Vimeo or YouTube after they had already pasted the links — on
          every project card and on Media. The domains answer it (Taylor,
          2026-09-03), so the question was making a client type the same fact
          twice, and it is gone.

          The branch itself stays, and it has nothing to do with video. The
          tools group asks which services an organisation already runs and
          **whose account each one is in** — a founder's personal Instagram is
          a different asset from the company's, and finding that out at launch
          is too late. That question only has a wrong answer when there are two
          parties who could own the account.

          A portfolio and a studio meet nothing here, and nothing is missing:
          the accounts block and the current-platform question directly below
          are asked of everyone, and for one person they collect the same
          facts without the whose-account half that does not apply. */}
      <ForKinds kind={kind} test={not(asks("video"))}>
        <>
          <ChoiceAnswer
            form={form}
            name="tools"
            label={pack.tools.label}
            help={pack.tools.help}
            options={pack.tools.options}
            multiple
            exclusiveValue="none"
          />

          <LongAnswer
            form={form}
            name="toolsDetail"
            label={pack.tools.detail.label}
            help={pack.tools.detail.help}
          />

          {/* The checklist is eight guesses about a stack. This is the box
                for the ninth thing, and it is asked unconditionally rather
                than behind an "Other" tick — nothing here should require
                finding the right box to open first. */}
          <LongAnswer
            form={form}
            name="toolsOther"
            label={pack.tools.other.label}
            help={pack.tools.other.help}
          />
        </>
      </ForKinds>

      <Field
        id="f-accounts"
        label="Your accounts around the web"
        help={pack.accountsHelp}
      >
        <RepeatableBlock<Account>
          items={asAccounts(form.values.accounts)}
          onChange={(next) => form.setValue("accounts", next)}
          emptyItem={() => ({})}
          addLabel="Add another account"
          renderItem={(item, index, update) => (
            <div className="space-y-3">
              <TextField
                id={`f-account-platform-${index}`}
                value={item.platform ?? ""}
                onChange={(event) =>
                  update({ ...item, platform: event.target.value })
                }
                onBlur={form.flush}
                placeholder="Instagram, Vimeo, IMDb…"
              />
              <TextField
                id={`f-account-link-${index}`}
                value={item.link ?? ""}
                onChange={(event) =>
                  update({ ...item, link: event.target.value })
                }
                onBlur={form.flush}
                placeholder="Link or handle"
              />
            </div>
          )}
        />
      </Field>

      <TextAnswer
        form={form}
        name="currentPlatform"
        label="What's your current site built on?"
        help={`Wix, Squarespace, WordPress — or "not sure."`}
      />

      {/* Both are accounts, which is what this step is: an admin panel is a
          login we create, and booking is a calendar we join. They sit after
          the domain and tools questions because those can break something the
          client already depends on and these cannot. */}
      <UpsellQuestions
        form={form}
        extras={purchasedExtras}
        extra="adminPanel"
        block={pack.upsells.adminPanel}
      />

      <UpsellQuestions
        form={form}
        extras={purchasedExtras}
        extra="booking"
        block={pack.upsells.booking}
      />

      <ChoiceAnswer
        form={form}
        name="handsOn"
        label="After launch, how hands-on do you want to be?"
        help="No wrong answer — it shapes the handoff guide we write for you."
        options={HANDS_ON}
      />

      <ChoiceAnswer
        form={form}
        name="bestContactMethod"
        label="Best way to reach you"
        options={CONTACT_METHOD}
      />

      <LongAnswer
        form={form}
        name="anythingElse"
        label="Anything else we should know?"
        help="Anything I haven't asked — something you want on the site, something you'd hate, a person whose opinion of it matters."
      />
    </>
  );
}
