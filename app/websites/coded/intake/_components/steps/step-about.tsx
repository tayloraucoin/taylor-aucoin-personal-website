"use client";

import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { TextAnswer, LongAnswer } from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { TextField } from "../../../../intake/_components/text-field";

type Role = { role?: string };

function asRoles(value: unknown): Role[] {
  return Array.isArray(value) ? (value as Role[]) : [];
}

/**
 * Step 1 — About you.
 *
 * Every label, help line, and placeholder is
 * `docs/websites/portfolio-intake-questions-v2.md` § Step 1, verbatim.
 *
 * The three contact fields are shown, not asked (D-INT-8). They arrive from the
 * engagement's own columns — the client gave them on the start form — so they
 * render filled and read-only-looking rather than as blank questions the person
 * has already answered. Editing them is a conversation, not a form field: the
 * columns are what an invoice and a Stripe receipt are addressed to, and a
 * silent divergence between the row and an answer would put two different
 * emails in two different systems.
 */
export function StepAbout({
  token,
  initial,
  prefill,
}: {
  token: string;
  initial: Record<string, unknown>;
  prefill: {
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
  };
}) {
  const form = useStepAutosave({ token, stepKey: "about", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <TextAnswer
        form={form}
        name="displayName"
        label="Your name, as it should appear on the site"
        help="If you go by something different professionally, use that."
      />

      <TextAnswer
        form={form}
        name="whatYouDo"
        label="What you do, in one line"
        help={`The line that sits under your name. "Director / Camera / Editor / Teacher" counts. So does something looser. We'll sharpen it together.`}
      />

      <Field id="f-roles" label="Your roles">
        <RepeatableBlock<Role>
          items={asRoles(form.values.roles)}
          onChange={(next) => form.setValue("roles", next)}
          emptyItem={() => ({})}
          addLabel="Add another role"
          renderItem={(item, index, update) => (
            <TextField
              id={`f-role-${index}`}
              value={item.role ?? ""}
              onChange={(event) => update({ ...item, role: event.target.value })}
              onBlur={form.flush}
              placeholder="Director"
            />
          )}
        />
      </Field>

      <TextAnswer
        form={form}
        name="leadRole"
        label="Which role leads?"
        help="If a stranger could only know one thing you do, which is it?"
      />

      <TextAnswer
        form={form}
        name="howLong"
        label="How long you've been doing this"
        help='"Since 2008" or "about fifteen years" — either is fine.'
      />

      <TextAnswer
        form={form}
        name="basedIn"
        label="Where you're based"
        placeholder="Vancouver, BC"
        help='And how far the work travels, if that matters — "Vancouver-based, works anywhere" is a common shape.'
      />

      {/* Shown, never re-asked. These are the engagement's own columns. */}
      <Field id="f-contact" label="Who we'll be dealing with">
        <div className="space-y-2.5">
          <KnownFact label="Name" value={prefill.contactName} />
          <KnownFact label="Best phone number" value={prefill.contactPhone} />
          <KnownFact label="Email" value={prefill.contactEmail} />
          <p className="font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            Wrong, or should be someone else? Tell Taylor and he&apos;ll change
            it.
          </p>
        </div>
      </Field>

      <LongAnswer
        form={form}
        name="unions"
        label="Union or guild memberships"
        help="IATSE, DGC, a guild, a professional college — with the category or number if it matters. We only list what's current."
      />

      <LongAnswer
        form={form}
        name="representation"
        label="Representation"
        help="Agent, manager, or rep — who they are, and whether enquiries should go through them."
      />
    </>
  );
}

/** One fact we already hold, rendered as a fact rather than as an empty box. */
function KnownFact({ label, value }: { label: string; value: string | null }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-body text-[16px] font-light leading-[1.4] text-(--color-ink)">
      <span className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        {label}
      </span>
      {value ?? "—"}
    </p>
  );
}
