"use client";

import { useState } from "react";
import type { ServiceEntry } from "@/lib/validators/showcase-intake";
import { ChoiceGroup } from "../../../intake/_components/choice-group";
import { TextArea, TextField } from "../../../intake/_components/text-field";
import { CollapseLink, EntryRow, EntrySummary } from "./entry-collapse";

const PLACEMENT = [
  { value: "front", label: "Front and centre" },
  { value: "archive", label: "In the archive" },
  { value: "off", label: "Leave it off for now" },
] as const;

/**
 * One service a business sells.
 *
 * The durable track proved this shape on `step-pricing.tsx` and its
 * placeholders are carried across verbatim — "$149, or from $80/hr" is the one
 * that tells a client a rough answer is welcome, which is the whole point of
 * asking a trade about price in a form.
 */
export function ServiceEntryCard({
  index,
  entry,
  onChange,
  onBlur,
}: {
  index: number;
  entry: ServiceEntry;
  onChange: (next: ServiceEntry) => void;
  onBlur: () => void;
}) {
  const titled = Boolean(entry.title?.trim());
  const [open, setOpen] = useState(!titled);

  const set = (patch: Partial<ServiceEntry>) =>
    onChange({ ...entry, ...patch });

  if (titled && !open) {
    return (
      <EntrySummary
        index={index}
        title={entry.title!}
        detail={entry.price?.trim() || undefined}
        onOpen={() => setOpen(true)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {titled ? <CollapseLink onCollapse={() => setOpen(false)} /> : null}
      <EntryRow id={`f-service-title-${index}`} label="Service">
        <TextField
          id={`f-service-title-${index}`}
          value={entry.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>
      <EntryRow id={`f-service-price-${index}`} label="Price">
        <TextField
          id={`f-service-price-${index}`}
          value={entry.price ?? ""}
          onChange={(e) => set({ price: e.target.value })}
          onBlur={onBlur}
          placeholder="$149, or from $80/hr"
        />
      </EntryRow>
      <EntryRow id={`f-service-included-${index}`} label="What's included">
        <TextArea
          id={`f-service-included-${index}`}
          value={entry.included ?? ""}
          onChange={(e) => set({ included: e.target.value })}
          onBlur={onBlur}
          placeholder="Bullet points are fine"
        />
      </EntryRow>
      <EntryRow id={`f-service-duration-${index}`} label="How long it takes">
        <TextField
          id={`f-service-duration-${index}`}
          value={entry.duration ?? ""}
          onChange={(e) => set({ duration: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>
      <EntryRow
        id={`f-service-takesLonger-${index}`}
        label="What makes it take longer"
      >
        <TextField
          id={`f-service-takesLonger-${index}`}
          value={entry.takesLonger ?? ""}
          onChange={(e) => set({ takesLonger: e.target.value })}
          onBlur={onBlur}
        />
      </EntryRow>

      <EntryRow id={`f-service-placement-${index}`} label="Where it belongs">
        <ChoiceGroup
          legend="Where it belongs"
          name={`service-placement-${index}`}
          options={PLACEMENT}
          value={entry.placement ? [entry.placement] : []}
          onChange={(next) => set({ placement: next[0] ?? "" })}
          onBlur={onBlur}
        />
      </EntryRow>
    </div>
  );
}
