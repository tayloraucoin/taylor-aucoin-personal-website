"use client";

import { useRef, useState } from "react";
import { mintEntryKey } from "@/lib/intake/entry-key";
import type { TasteReference } from "@/lib/validators/showcase-intake";
import { RepeatableBlock } from "../../../../intake/_components/repeatable-block";
import { TextField } from "../../../../intake/_components/text-field";
import { PickBlock } from "./pick-block";

/** [COPY — draft] */
const COPY = {
  addFirst: "Add a site",
  add: "Add another site",
  link: "Link",
  placeholder: "juliarossetti.com",
};

/**
 * Sites the client found themselves, with the same two questions.
 *
 * The step this replaced had one box called "Links worth a look" and a client
 * pasted four URLs into it. A bare URL says a site was worth mentioning and
 * nothing else — not which part, not how much. So each link now takes the same
 * scale and the same note as a site we showed them, and the only difference is
 * that we have not looked at these: no capture, no tags, no See more.
 *
 * **Adding the row is selecting**, so the pick block opens composing rather
 * than behind a Select nobody would understand pressing. An entry that arrived
 * from storage is collapsed, because it was saved once already.
 *
 * **Nothing is open on arrival.** Most clients have not been collecting links,
 * and an open card asked them for one anyway — then made them cancel out of it
 * to say no (Taylor, 2026-09-04). The button is the whole question now, and
 * the field's help line above says the answer may be none.
 *
 * A link is normalised, never refused. Someone typing `juliarossetti.com` has
 * given a perfectly good answer, and a validator arguing with them about a
 * scheme is the form failing at its one job.
 */
export function ReferenceList({
  references,
  onChange,
  onBlur,
}: {
  references: readonly TasteReference[];
  onChange: (next: TasteReference[]) => void;
  onBlur: () => void;
}) {
  /**
   * Which entries have been saved, so a fresh one opens and a stored one does
   * not. Seeded from what was on screen at mount: those were saved on an
   * earlier visit by definition.
   */
  const initial = useRef(new Set(references.map((r) => r.entryKey)));
  const [saved, setSaved] = useState<ReadonlySet<string>>(initial.current);

  const markSaved = (key: string) =>
    setSaved((current) => new Set(current).add(key));

  return (
    <RepeatableBlock<TasteReference>
      items={references}
      onChange={onChange}
      emptyItem={() => ({ entryKey: mintEntryKey(), source: "typed" })}
      startEmpty
      addLabel={COPY.add}
      addFirstLabel={COPY.addFirst}
      renderItem={(entry, index, update) => {
        /**
         * Ids come from the index, never from the entry key.
         *
         * `RepeatableBlock` mints a fresh key on every render while the list is
         * empty, so a key-derived id is a different string on the server than
         * it is in the browser and the tree fails to hydrate — labels stop
         * pointing at their inputs, silently. The index is stable across both,
         * which is why every other entry card on this track numbers its fields
         * the same way.
         */
        const idPrefix = `f-ref-${index}`;
        const urlId = `${idPrefix}-url`;
        const isSaved = saved.has(entry.entryKey);

        return (
          <div>
            <label
              htmlFor={urlId}
              className="block font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)"
            >
              {COPY.link}
            </label>
            <div className="mt-2">
              <TextField
                id={urlId}
                mode="url"
                value={entry.url ?? ""}
                placeholder={COPY.placeholder}
                onChange={(event) =>
                  update({ ...entry, url: event.target.value })
                }
                onBlur={onBlur}
              />
            </div>

            <PickBlock
              idPrefix={idPrefix}
              pick={
                isSaved
                  ? {
                      ...(entry.score === undefined
                        ? {}
                        : { score: entry.score }),
                      ...(entry.note ? { note: entry.note } : {}),
                    }
                  : null
              }
              openInitially={!isSaved}
              removable={false}
              onSave={(next) => {
                update({ ...entry, ...next });
                markSaved(entry.entryKey);
                onBlur();
              }}
              onCancel={() => {
                // An entry nobody put a link in was never an answer. Cancelling
                // out of it should leave the page as it was, not leave a blank
                // card behind for the client to tidy up.
                if (!entry.url?.trim() && !isSaved) {
                  onChange(references.filter((_, i) => i !== index));
                }
              }}
            />
          </div>
        );
      }}
    />
  );
}
