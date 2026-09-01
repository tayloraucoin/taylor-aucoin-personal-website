"use client";

import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import {
  ChoiceAnswer,
  TextAnswer,
  LongAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { TextField } from "../../../../intake/_components/text-field";

type Role = { role?: string };

function asRoles(value: unknown): Role[] {
  return Array.isArray(value) ? (value as Role[]) : [];
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The roles actually typed, in order, deduplicated and blank-free.
 *
 * A repeatable block keeps an empty entry the moment "Add another role" is
 * pressed, so the raw array is never a safe list to build a choice group from.
 */
function namedRoles(items: Role[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const role = asText(item.role);
    if (!role || seen.has(role)) continue;
    seen.add(role);
    out.push(role);
  }
  return out;
}

/**
 * The line as the site will set it: the lead role first, then the rest.
 *
 * This is what "which role leads?" actually buys, and until it was drawn there
 * was no way to see that the answer changes anything. Ordering here is the
 * only place the lead role has a visible consequence during intake.
 */
function titleLine(roles: string[], leadRole: string): string {
  const ordered = leadRole
    ? [leadRole, ...roles.filter((role) => role !== leadRole)]
    : roles;
  return ordered.join(" / ");
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

  const roles = namedRoles(asRoles(form.values.roles));
  const leadRole = asText(form.values.leadRole);

  /**
   * A lead role that no longer matches any typed role stays on the list rather
   * than vanishing from it. Editing a role's spelling should not silently drop
   * the answer to a different question.
   */
  const roleOptions = (
    leadRole && !roles.includes(leadRole) ? [...roles, leadRole] : roles
  ).map((role) => ({ value: role, label: role }));

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
        help={`The line that sits under your name. "Founder / Product Designer" counts. So does "Ceramicist, mostly commissions" or "I run a two-person studio in Halifax." We'll sharpen it together.`}
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
              placeholder="Founder"
            />
          )}
        />
      </Field>

      <TitlePreview
        displayName={asText(form.values.displayName)}
        roles={roles}
        leadRole={leadRole}
      />

      {roleOptions.length > 0 ? (
        <ChoiceAnswer
          form={form}
          name="leadRole"
          label="Which role leads?"
          help="If a stranger could only know one thing you do, which is it? It goes first in the line under your name."
          options={roleOptions}
        />
      ) : (
        <Field id="f-leadRole" label="Which role leads?">
          <p className="font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            Add a role above and you can pick which one leads.
          </p>
        </Field>
      )}

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
        name="credentials"
        label="Memberships and credentials"
        help="Unions and guilds, professional colleges, degrees, certifications, training worth naming. Include the category or number where it matters. We only list what's current."
      />

      <LongAnswer
        form={form}
        name="affiliations"
        label="Affiliations and partnerships"
        help="Studios or agencies you work under, companies you're formally tied to, brands you're an official partner or reseller for. Only the ones you can name publicly."
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

/**
 * How the name and title will sit on the finished site.
 *
 * Not a mockup of the design — the site does not exist yet and pretending to
 * preview its type would be a promise nobody has made. It shows the one thing
 * the client controls here: which words end up on the line, and in what order.
 *
 * It renders only once there is something true to show. An empty frame
 * captioned "preview" teaches nothing.
 */
function TitlePreview({
  displayName,
  roles,
  leadRole,
}: {
  displayName: string;
  roles: string[];
  leadRole: string;
}) {
  const line = titleLine(roles, leadRole);
  if (!displayName && !line) return null;

  return (
    <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        How this reads on the site
      </p>
      <p className="mt-3 font-display text-[22px] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
        {displayName || "Your name"}
      </p>
      {line ? (
        <p className="mt-1.5 font-body text-[15px] font-light leading-[1.4] text-(--color-body)">
          {line}
        </p>
      ) : null}
    </div>
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
