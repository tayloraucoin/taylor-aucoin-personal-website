"use client";

import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ExperienceEntry } from "@/lib/validators/showcase-intake";
import { LongAnswer } from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { TextArea, TextField } from "../../../../intake/_components/text-field";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ExtractionBlock } from "../extraction-block";

function asEntries(value: unknown): ExperienceEntry[] {
  return Array.isArray(value) ? (value as ExperienceEntry[]) : [];
}

/**
 * True when an entry holds anything at all.
 *
 * The repeatable block always renders one empty card as an invitation, and
 * that card is not an answer. Dropping the empties before appending extracted
 * entries stops a blank row wedging itself between two real ones.
 */
function hasContent(entry: ExperienceEntry): boolean {
  return Object.entries(entry).some(
    ([key, value]) =>
      key !== "entryKey" && typeof value === "string" && value.trim() !== "",
  );
}

/**
 * Step 3 — Experience and proof.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 3,
 * verbatim.
 *
 * This is the LinkedIn layer: positions, memberships, ongoing roles. The films
 * and projects those produced are step 4's, and the step intro says so — the
 * distinction is the one thing clients get wrong here, so both steps name it
 * explicitly rather than relying on the titles.
 *
 * "Feature this" is a checkbox with words, not a star. A star means whatever
 * the person looking at it assumes; the label says what it does.
 */
export function StepExperience({
  token,
  initial,
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "experience", initial });
  useReportSaveState(form.state, form.retry);

  const entries = asEntries(form.values.experience);

  return (
    <>
      <ExtractionBlock
        token={token}
        mode="experience"
        intro="Paste everything — your LinkedIn, your old site's about page, your CV, your IMDb bio. One big messy blob is perfect."
        afterLine="Entries appear below, filled in. Fix anything we got wrong — nothing saves as fact until you've seen it."
        value={
          typeof form.values.fastWay === "string" ? form.values.fastWay : ""
        }
        onChange={(next) => form.setValue("fastWay", next)}
        onBlur={form.flush}
        // Appends. A second run never touches an entry already on screen —
        // including one the client has just corrected.
        onEntries={(incoming) =>
          form.setValue("experience", [
            ...asEntries(form.values.experience).filter(hasContent),
            ...(incoming as unknown as ExperienceEntry[]),
          ])
        }
      />

      <Field
        id="f-experience"
        label="Your experience"
        help={`Positions, ongoing roles, things you founded, programs you run. "Feature this" marks the ones that should be impossible to miss.`}
      >
        <RepeatableBlock<ExperienceEntry>
          items={entries}
          onChange={(next) => form.setValue("experience", next)}
          emptyItem={() => ({ entryKey: mintEntryKey() })}
          addLabel="Add another"
          renderItem={(item, index, update) => (
            <div className="space-y-3">
              <TextField
                id={`f-exp-what-${index}`}
                value={item.what ?? ""}
                onChange={(e) => update({ ...item, what: e.target.value })}
                onBlur={form.flush}
                placeholder="Instructor — Film Production"
              />
              <TextField
                id={`f-exp-where-${index}`}
                value={item.where ?? ""}
                onChange={(e) => update({ ...item, where: e.target.value })}
                onBlur={form.flush}
                placeholder="LaSalle College"
              />
              <TextField
                id={`f-exp-when-${index}`}
                value={item.when ?? ""}
                onChange={(e) => update({ ...item, when: e.target.value })}
                onBlur={form.flush}
                placeholder="2019–now"
              />
              <TextArea
                id={`f-exp-about-${index}`}
                value={item.about ?? ""}
                onChange={(e) => update({ ...item, about: e.target.value })}
                onBlur={form.flush}
                placeholder="A sentence or two — or leave it and we'll ask"
              />
              <TextField
                id={`f-exp-category-${index}`}
                value={item.category ?? ""}
                onChange={(e) => update({ ...item, category: e.target.value })}
                onBlur={form.flush}
                placeholder="Teaching, directing, community…"
              />

              <label className="flex min-h-12 cursor-pointer items-center gap-3 font-body text-[16px] font-light text-(--color-body)">
                <input
                  type="checkbox"
                  checked={item.feature === true}
                  onChange={(e) => {
                    update({ ...item, feature: e.target.checked });
                    form.flush();
                  }}
                  className="h-5 w-5 shrink-0 accent-(--color-c2)"
                />
                Feature this
              </label>
            </div>
          )}
        />
      </Field>

      <LongAnswer
        form={form}
        name="awards"
        label="Awards, grants, and festival selections"
        help="Every prize, nomination, grant, and official selection you can remember — festival names and years included. Festivals hand out laurel graphics for these; there's a spot for the files in the media step."
      />

      <LongAnswer
        form={form}
        name="press"
        label="Press"
        help="Reviews, interviews, write-ups. Paste quotes or links."
      />

      <LongAnswer
        form={form}
        name="kindWords"
        label="Kind words"
        help="Things clients, collaborators, or students have said about working with you — paste from emails or texts. One or two is plenty."
      />

      {/* Unchecked by default, always. A platform once auto-generated eleven
          fabricated customers for a real business; nothing goes on a site as a
          quote without a named, real, consenting source. */}
      <Field id="f-publishPermission" label="Can we publish those?">
        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3 font-body text-[16px] font-light leading-[1.4] text-(--color-body)">
          <input
            type="checkbox"
            checked={form.values.publishPermission === true}
            onChange={(event) => {
              form.setValue("publishPermission", event.target.checked);
              form.flush();
            }}
            className="mt-0.5 h-5 w-5 shrink-0 accent-(--color-c2)"
          />
          Yes — these are real, and the people who said them would be fine
          seeing them on my site.
        </label>
      </Field>

      <LongAnswer
        form={form}
        name="notableNames"
        label="Notable names"
        help={`Clients, companies, or people you've worked with that carry weight — and, honestly, whether you're allowed to say so publicly. "Worked with them, can't name them" is useful to know too.`}
      />
    </>
  );
}
