"use client";

import { useState } from "react";
import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import {
  copyPackFor,
  flavourForKind,
  labelForKind,
  showcaseKinds,
} from "@/lib/intake/tracks";
import type { PersonEntry } from "@/lib/validators/showcase-intake";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { ChoiceGroup } from "../../../../intake/_components/choice-group";
import { Field } from "../../../../intake/_components/field";
import type { ExistingFile } from "../../../../intake/_components/file-drop";
import { KnownFact } from "../../../../intake/_components/known-fact";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { Reveal } from "../../../../intake/_components/reveal";
import { TextField } from "../../../../intake/_components/text-field";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ExtractionBlock } from "../extraction-block";
import { asks, ForKinds, ForKindsStub, hasGroup } from "../for-kinds";
import { PersonEntryCard } from "../person-entry";

type Role = { role?: string };

/** The durable track's two roster questions, verbatim (D-PORT-13). */
const JUST_YOU = [
  { value: "yes", label: "Just me" },
  { value: "no", label: "There's a few of us" },
] as const;

const SHOW_TEAM = [
  { value: "yes", label: "Yes, put them on the site" },
  { value: "no", label: "No, keep it to me" },
] as const;

function asRoles(value: unknown): Role[] {
  return Array.isArray(value) ? (value as Role[]) : [];
}

function asPeople(value: unknown): PersonEntry[] {
  return Array.isArray(value) ? (value as PersonEntry[]) : [];
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
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
 * Step 1 — About you, or about the thing.
 *
 * Every string here comes from the copy pack or from
 * `docs/websites/portfolio-intake-questions-v2.md` § Step 1 — none is a literal
 * in this file, so Taylor's human-hand pass reaches all of them in one place.
 *
 * **The kind decides what this step asks.** A filmmaker sees exactly the step
 * they saw before: a name, a one-liner, roles, how long. A venture sees what
 * it's called, where it stands, and who the people are. Before PORT-11 there
 * was one shape and every client got the filmmaker's
 * (`CODED-INTAKE-CATEGORY-AUDIT.md` B3).
 *
 * **The kind is derived live from the form, not from the server.** The page
 * hands down what the engagement resolved to on load; from then on this
 * component reads its own autosaved answer, so changing the kind re-renders the
 * questions immediately without a reload. That is what makes the Change link
 * feel like a choice rather than a navigation.
 *
 * **Changing the kind writes one key and nothing else** (D-PORT-11). Every
 * group's answers live under their own keys, so a question that stops rendering
 * leaves its value in the answers document for the intake generator to print.
 * The reassurance line under the picker says so, and it is true by
 * construction rather than by promise.
 *
 * **The fast way is gone from this step** (PORT-18, 2026-09-03). It asked for
 * one document and proposed into free-text fields; step 1 now asks for
 * everything at once and fills the form from it, so a second, narrower paste
 * box on step 2 would be the same question asked twice. `businessPrimer`
 * stays in the schema and the label map, read-only, so an engagement that
 * answered it still prints in the document — the `unions` precedent.
 *
 * The three contact fields are shown, not asked (D-INT-8). They arrive from the
 * engagement's own columns — the client gave them on the start form — so they
 * render filled rather than as blank questions the person has already answered.
 * Editing them is a conversation, not a form field: the columns are what an
 * invoice and a Stripe receipt are addressed to, and a silent divergence
 * between the row and an answer would put two different emails in two
 * different systems.
 */
export function StepAbout({
  token,
  initial,
  initialKind,
  prefill,
  headshots,
}: {
  token: string;
  initial: Record<string, unknown>;
  /** What the engagement resolved to on load, including the legacy derivation. */
  initialKind: ShowcaseKind;
  prefill: {
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
  };
  headshots: readonly (ExistingFile & { entryKey: string | null })[];
}) {
  const form = useStepAutosave({ token, stepKey: "about", initial });
  useReportSaveState(form.state, form.retry);

  const [pickingKind, setPickingKind] = useState(false);

  const kinds = showcaseKinds();
  const stored = asText(form.values.siteKind);
  const kind = (
    kinds.some((entry) => entry.key === stored) ? stored : initialKind
  ) as ShowcaseKind;

  const pack = copyPackFor(
    flavourForKind(kind, asList(form.values.disciplines)),
  );

  const roles = namedRoles(asRoles(form.values.roles));
  const leadRole = asText(form.values.leadRole);
  const people = asPeople(form.values.people);

  /**
   * A lead role that no longer matches any typed role stays on the list rather
   * than vanishing from it. Editing a role's spelling should not silently drop
   * the answer to a different question.
   */
  const roleOptions = (
    leadRole && !roles.includes(leadRole) ? [...roles, leadRole] : roles
  ).map((role) => ({ value: role, label: role }));

  /**
   * The lead is chosen by entry key, so renaming someone keeps them the lead.
   * A person removed from the roster simply leaves the list; their stored key
   * stays in the document until the client picks someone else, which is the
   * same forgiveness the six-second undo gives the entry itself.
   */
  const personOptions = people
    .filter((person) => asText(person.name))
    .map((person) => ({
      value: person.entryKey,
      label: asText(person.name),
    }));

  const filesFor = (entryKey: string) =>
    headshots.filter((file) => file.entryKey === entryKey);

  return (
    <>
      {/*
        The braindump, asked first and on purpose.

        Every other question on this form narrows something down, and twenty
        minutes of narrowing is very good at talking someone out of the thing
        they arrived wanting to say. This is the box for that thing, before the
        form gets to it (Taylor, 2026-09-03). It sits with the fast way rather
        than at the end beside step 9's "anything else", which is a different
        question asked of a different mood.

        [COPY — pending Taylor]
      */}
      <LongAnswer
        form={form}
        name="lookingFor"
        label="What do you want this site to do for you?"
        help="Before the questions start narrowing it down — say the thing you came here wanting to say. New site or a rebuild, and either way: what isn't working now, who you need to reach, what you're sick of explaining, and what has to be true a year from now for this to have been worth the money. Ramble."
      />

      {/* Collapsed, this is a fact we already hold and renders as one — no
          label element, because there is no field to label. Open, it is an
          ordinary radio group and needs its question visible: `ChoiceGroup`
          puts its legend in `sr-only`, so `Field` supplies the seen one. */}
      {pickingKind ? (
        <Field id="f-siteKind" label={pack.kindLabel}>
          <div className="space-y-3">
            <ChoiceGroup
              legend={pack.kindLabel}
              name="siteKind"
              options={kinds.map((k) => ({ value: k.key, label: k.label }))}
              value={[kind]}
              onChange={(next) => {
                form.setValue("siteKind", next[0] ?? "");
                form.flush();
                setPickingKind(false);
              }}
            />
            <p className="font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
              {pack.kindChangeLine}
            </p>
          </div>
        </Field>
      ) : (
        <div className="mb-7">
          <KnownFact
            label="This site is for"
            value={labelForKind(kind)}
            action={
              <button
                type="button"
                onClick={() => setPickingKind(true)}
                className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                Change
              </button>
            }
          />
        </div>
      )}

      <TextAnswer
        form={form}
        name="displayName"
        label={pack.nameLabel}
        help={pack.nameHelp}
      />

      <TextAnswer
        form={form}
        name="whatYouDo"
        label={pack.whatYouDoLabel}
        help={pack.whatYouDoHelp}
      />

      <ForKinds kind={kind} test={asks("roles")}>
        <>
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
                  onChange={(event) =>
                    update({ ...item, role: event.target.value })
                  }
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
        </>
      </ForKinds>

      {/* A venture is asked where it stands instead of how long it has been
          going — the second has no good answer for something not yet built,
          and all four of the first's answers are acceptable ones. */}
      {/* The one branch whose words do not exist on every pack: `stage` is the
          venture pack's alone. On a venture the question renders; on any other
          single-kind view the fall-through does. In the all-kinds overview the
          pack is generic, so there is no stage copy to show — and a silently
          absent branch is exactly what this surface may not do, so it names
          who is asked and points at the appendix instead (D-ADM-11). */}
      {pack.stage ? (
        <ForKinds
          kind={kind}
          test={hasGroup("stage")}
          otherwise={
            <TextAnswer
              form={form}
              name="howLong"
              label={pack.howLongLabel}
              help='"Since 2008" or "about fifteen years" — either is fine.'
            />
          }
        >
          <>
            <ChoiceAnswer
              form={form}
              name="stage"
              label={pack.stage.label}
              help={pack.stage.help}
              options={pack.stage.options}
            />

            {/* The box under the options. Four radios sort the fact; this is
                where the fact gets its meaning — see `stage.detail` in the
                copy pack for why one without the other is not enough. */}
            <LongAnswer
              form={form}
              name="stageDetail"
              label={pack.stage.detail.label}
              help={pack.stage.detail.help}
            />
          </>
        </ForKinds>
      ) : (
        <>
          <ForKindsStub
            test={hasGroup("stage")}
            note="Asked instead of how long they have been doing this. The words are the venture pack's — see the pack differences at the end."
          />
          <TextAnswer
            form={form}
            name="howLong"
            label={pack.howLongLabel}
            help='"Since 2008" or "about fifteen years" — either is fine.'
          />
        </>
      )}

      <TextAnswer
        form={form}
        name="basedIn"
        label="Where you're based"
        placeholder="Vancouver, BC"
        help={`And how far the work travels, if that matters — "Vancouver-based, works anywhere" is a common shape.${
          pack.basedInHelpSuffix ? ` ${pack.basedInHelpSuffix}` : ""
        }`}
      />

      <ForKinds kind={kind} test={hasGroup("roster")}>
        <Roster
          form={form}
          token={token}
          people={people}
          personOptions={personOptions}
          linePlaceholder={pack.rosterLinePlaceholder}
          rosterPaste={pack.rosterPaste}
          leadLabel={pack.rosterLead.label}
          leadHelp={pack.rosterLead.help}
          filesFor={filesFor}
        />
      </ForKinds>

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
        label={pack.representation.label}
        help={pack.representation.help}
      />
    </>
  );
}

/**
 * Who the people are, when there is more than one of them.
 *
 * The two preamble questions are the durable track's, word for word, and they
 * are asked in its order for its reason: someone who says "keep it to me" has
 * refused a team *page*, not refused to explain how the work gets done. The
 * roster is asked either way, and the document labels it accordingly.
 */
function Roster({
  form,
  token,
  people,
  personOptions,
  linePlaceholder,
  rosterPaste,
  leadLabel,
  leadHelp,
  filesFor,
}: {
  form: ReturnType<typeof useStepAutosave>;
  token: string;
  people: PersonEntry[];
  personOptions: { value: string; label: string }[];
  linePlaceholder: string;
  rosterPaste: { intro: string; afterLine: string };
  leadLabel: string;
  leadHelp: string;
  filesFor: (
    entryKey: string,
  ) => readonly (ExistingFile & { entryKey: string | null })[];
}) {
  return (
    <>
      <ChoiceAnswer
        form={form}
        name="justYou"
        label="Is it just you?"
        options={JUST_YOU}
      />

      <Reveal
        values={form.values}
        dependsOn={{ field: "justYou", equals: "no" }}
      >
        <>
          <ChoiceAnswer
            form={form}
            name="showTeam"
            label="Do you want them on the site?"
            options={SHOW_TEAM}
          />

          {/* The same paste-and-sort as steps 3 and 4, filling the roster.
              Client-side only: entries appear as ordinary editable cards and
              reach the document through the client's own next autosave, which
              cannot fire until they have been on screen (D-PORT-3). */}
          <ExtractionBlock
            token={token}
            mode="people"
            intro={rosterPaste.intro}
            afterLine={rosterPaste.afterLine}
            value={
              typeof form.values.peoplePaste === "string"
                ? form.values.peoplePaste
                : ""
            }
            onChange={(next) => form.setValue("peoplePaste", next)}
            onBlur={form.flush}
            onEntries={(incoming) =>
              form.setValue("people", [
                ...people.filter((person) =>
                  Object.entries(person).some(
                    ([key, value]) =>
                      key !== "entryKey" &&
                      typeof value === "string" &&
                      value.trim() !== "",
                  ),
                ),
                ...incoming.map((entry) => ({
                  ...entry,
                  entryKey: mintEntryKey(),
                })),
              ] as PersonEntry[])
            }
          />

          <Field id="f-people" label="Names and roles">
            <RepeatableBlock<PersonEntry>
              items={people}
              onChange={(next) => form.setValue("people", next)}
              emptyItem={() => ({ entryKey: mintEntryKey() })}
              addLabel="Add another person"
              renderItem={(item, index, update) => (
                <PersonEntryCard
                  index={index}
                  entry={item}
                  token={token}
                  files={filesFor(item.entryKey)}
                  linePlaceholder={linePlaceholder}
                  onChange={update}
                  onBlur={form.flush}
                />
              )}
            />
          </Field>

          {personOptions.length > 0 ? (
            <ChoiceAnswer
              form={form}
              name="leadPerson"
              label={leadLabel}
              help={leadHelp}
              options={personOptions}
            />
          ) : (
            <Field id="f-leadPerson" label={leadLabel}>
              <p className="font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                Add a name above and you can pick who leads.
              </p>
            </Field>
          )}
        </>
      </Reveal>
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
    // `mb-7` matches what `Field` puts under every question, because this card
    // sits between two of them and without it the next question crowds it.
    <div className="mb-7 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-4">
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
