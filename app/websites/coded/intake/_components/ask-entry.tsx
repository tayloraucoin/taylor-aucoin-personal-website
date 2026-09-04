"use client";

import { useState } from "react";
import type { ShowcaseCopyPack } from "@/lib/intake/showcase-copy";
import type { AskEntry } from "@/lib/validators/showcase-intake";
import { ChoiceGroup } from "../../../intake/_components/choice-group";
import { Reveal } from "../../../intake/_components/reveal";
import { TextArea, TextField } from "../../../intake/_components/text-field";
import { CollapseLink, EntryRow, EntrySummary } from "./entry-collapse";

/**
 * One thing a visitor is being asked to do: invest, apply, book, get in touch.
 *
 * This is the gap the category audit named (B4). Nothing in nine steps captured
 * the commercial ask, because a portfolio's ask is "hire me" and step 8's
 * contact question already carried it — which left a venture with three
 * different conversions and nowhere to describe any of them.
 *
 * **What this block refuses to be.** It is not a pricing-table builder, not a
 * payment integration, and not a countdown. `number` is free text so a client
 * can write "from €50k" or "tiers, not public" without a validator arguing, and
 * nothing on this surface totals, converts, or charges anything — there is no
 * arithmetic anywhere near it, which is structural rather than disciplinary
 * (D-INT-1's no-urgency posture, applied to the one screen that could break it).
 *
 * **"Not yet" is a full-size answer.** A raise that has not opened is the
 * ordinary case for the clients this block exists for, and an option that looks
 * like a lesser choice would push someone into describing something that is not
 * true yet.
 */
export function AskEntryCard({
  index,
  entry,
  pack,
  onChange,
  onBlur,
}: {
  index: number;
  entry: AskEntry;
  pack: ShowcaseCopyPack;
  onChange: (next: AskEntry) => void;
  onBlur: () => void;
}) {
  const chosen = Boolean(entry.ask?.trim());
  const [open, setOpen] = useState(!chosen);

  const set = (patch: Partial<AskEntry>) => onChange({ ...entry, ...patch });

  const labelOf = (
    options: readonly { value: string; label: string }[],
    value?: string,
  ) => options.find((option) => option.value === value)?.label;

  if (chosen && !open) {
    return (
      <EntrySummary
        index={index}
        title={labelOf(pack.ask.askField.options, entry.ask) ?? entry.ask!}
        detail={labelOf(pack.ask.mechanism.options, entry.mechanism)}
        onOpen={() => setOpen(true)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {chosen ? <CollapseLink onCollapse={() => setOpen(false)} /> : null}

      <EntryRow id={`f-ask-ask-${index}`} label={pack.ask.askField.label}>
        <ChoiceGroup
          legend={pack.ask.askField.label}
          name={`ask-${index}`}
          options={pack.ask.askField.options}
          value={entry.ask ? [entry.ask] : []}
          onChange={(next) => set({ ask: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>

      <EntryRow id={`f-ask-forWhom-${index}`} label={pack.ask.forWhomLabel}>
        <TextField
          id={`f-ask-forWhom-${index}`}
          value={entry.forWhom ?? ""}
          onChange={(e) => set({ forWhom: e.target.value })}
          onBlur={onBlur}
          placeholder={pack.ask.forWhomPlaceholder}
        />
      </EntryRow>

      <EntryRow
        id={`f-ask-getWhat-${index}`}
        label={pack.ask.getWhat.label}
        help={pack.ask.getWhat.help}
      >
        <TextArea
          id={`f-ask-getWhat-${index}`}
          value={entry.getWhat ?? ""}
          onChange={(e) => set({ getWhat: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>

      {/* Free text, always. A minimum, a range, a target, or "not public yet"
          are all real answers, and none of them is a number. */}
      <EntryRow
        id={`f-ask-number-${index}`}
        label={pack.ask.number.label}
        help={pack.ask.number.help}
      >
        <TextField
          id={`f-ask-number-${index}`}
          value={entry.number ?? ""}
          onChange={(e) => set({ number: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>

      <EntryRow
        id={`f-ask-mechanism-${index}`}
        label={pack.ask.mechanism.label}
      >
        <ChoiceGroup
          legend={pack.ask.mechanism.label}
          name={`ask-mechanism-${index}`}
          options={pack.ask.mechanism.options}
          value={entry.mechanism ? [entry.mechanism] : []}
          onChange={(next) => set({ mechanism: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>

      {/* An inbox or a tool. Never a credential — the no-passwords law covers
          this surface exactly as it covers step 9. */}
      <Reveal
        values={entry}
        dependsOn={{
          field: "mechanism",
          in: ["form", "request", "email"],
        }}
      >
        <EntryRow
          id={`f-ask-destination-${index}`}
          label={pack.ask.destination.label}
          help={pack.ask.destination.help}
        >
          <TextField
            id={`f-ask-destination-${index}`}
            value={entry.destination ?? ""}
            onChange={(e) => set({ destination: e.target.value })}
            onBlur={onBlur}
            autoComplete="off"
          />
        </EntryRow>
      </Reveal>

      <EntryRow
        id={`f-ask-visibility-${index}`}
        label={pack.ask.visibility.label}
      >
        <ChoiceGroup
          legend={pack.ask.visibility.label}
          name={`ask-visibility-${index}`}
          options={pack.ask.visibility.options}
          value={entry.visibility ? [entry.visibility] : []}
          onChange={(next) => set({ visibility: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>
    </div>
  );
}
