"use client";

import { useState } from "react";
import type { OfferingEntry } from "@/lib/validators/showcase-intake";
import { ChoiceGroup } from "../../../intake/_components/choice-group";
import { Reveal } from "../../../intake/_components/reveal";
import { TextArea, TextField } from "../../../intake/_components/text-field";
import { CollapseLink, EntryRow, EntrySummary } from "./entry-collapse";

const POSTURE = [
  { value: "site", label: "On the site" },
  { value: "request", label: "On request" },
  { value: "hide", label: "Don't show it" },
] as const;

const PLACEMENT = [
  { value: "front", label: "Front and centre" },
  { value: "archive", label: "In the archive" },
  { value: "off", label: "Leave it off for now" },
] as const;

/**
 * One thing a practice offers: an engagement, a session, a talk, a book.
 *
 * The same card as a project, for a client whose work is not artefacts. Price
 * is asked only once they have said it belongs on the site — a consultant who
 * quotes per engagement should not have to type a number into a field that
 * implies one exists.
 */
export function OfferingEntryCard({
  index,
  entry,
  onChange,
  onBlur,
}: {
  index: number;
  entry: OfferingEntry;
  onChange: (next: OfferingEntry) => void;
  onBlur: () => void;
}) {
  const titled = Boolean(entry.title?.trim());
  const [open, setOpen] = useState(!titled);

  const set = (patch: Partial<OfferingEntry>) =>
    onChange({ ...entry, ...patch });

  if (titled && !open) {
    return (
      <EntrySummary
        index={index}
        title={entry.title!}
        detail={entry.format?.trim() || undefined}
        onOpen={() => setOpen(true)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {titled ? <CollapseLink onCollapse={() => setOpen(false)} /> : null}
      <EntryRow id={`f-offer-title-${index}`} label="Title">
        <TextField
          id={`f-offer-title-${index}`}
          value={entry.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>
      <EntryRow id={`f-offer-format-${index}`} label="Format">
        <TextField
          id={`f-offer-format-${index}`}
          value={entry.format ?? ""}
          onChange={(e) => set({ format: e.target.value })}
          onBlur={onBlur}
          placeholder="1:1, a group programme, a keynote, a book…"
        />
      </EntryRow>
      <EntryRow id={`f-offer-forWhom-${index}`} label="Who it's for">
        <TextField
          id={`f-offer-forWhom-${index}`}
          value={entry.forWhom ?? ""}
          onChange={(e) => set({ forWhom: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>
      <EntryRow id={`f-offer-scope-${index}`} label="Scope">
        <TextArea
          id={`f-offer-scope-${index}`}
          value={entry.scope ?? ""}
          onChange={(e) => set({ scope: e.target.value })}
          onBlur={onBlur}
          placeholder="How long, how many, what's included"
        />
      </EntryRow>
      <EntryRow id={`f-offer-pricePosture-${index}`} label="Price on the site">
        <ChoiceGroup
          legend="Price on the site"
          name={`offer-posture-${index}`}
          options={POSTURE}
          value={entry.pricePosture ? [entry.pricePosture] : []}
          onChange={(next) => set({ pricePosture: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>

      {/* Revealed by the posture above it, and a price typed then hidden stays
          stored — the same forgiveness a whole question gets when the kind
          changes (D-PORT-11), at field scale. */}
      <Reveal
        values={entry}
        dependsOn={{ field: "pricePosture", equals: "site" }}
      >
        <EntryRow id={`f-offer-price-${index}`} label="Price">
          <TextField
            id={`f-offer-price-${index}`}
            value={entry.price ?? ""}
            onChange={(e) => set({ price: e.target.value })}
            onBlur={onBlur}
            placeholder="Whatever you'd actually put on the page"
          />
        </EntryRow>
      </Reveal>

      <EntryRow id={`f-offer-link-${index}`} label="A link, if there is one">
        <TextField
          id={`f-offer-link-${index}`}
          value={entry.link ?? ""}
          onChange={(e) => set({ link: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>
      <EntryRow id={`f-offer-story-${index}`} label="Anything worth knowing">
        <TextArea
          id={`f-offer-story-${index}`}
          value={entry.story ?? ""}
          onChange={(e) => set({ story: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>

      <EntryRow id={`f-offer-placement-${index}`} label="Where it belongs">
        <ChoiceGroup
          legend="Where it belongs"
          name={`offer-placement-${index}`}
          options={PLACEMENT}
          value={entry.placement ? [entry.placement] : []}
          onChange={(next) => set({ placement: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>
    </div>
  );
}
