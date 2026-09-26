"use client";

import { useState } from "react";
import { CopyButton } from "@/app/admin/_components/copy-button";
import { withoutBundled } from "@/lib/intake/addon-bundles";
import { formatMoney } from "@/lib/intake/money";
import { showcaseIntakeRoutes } from "@/lib/routes";
import type { ExtrasRow } from "@/server/services/extras";

const KIND_HEADING: Record<string, string> = {
  addon: "Add-ons",
  round: "Rounds of changes",
};

/**
 * Ticks → URL, live. Owned one-time rows and rows with no Stripe price on
 * this tier are shown and not tickable, so the reason a row is missing is on
 * the screen. Counted rows (pages, posts) take a number. With nothing
 * ticked the URL still works: the page opens with nothing pre-selected.
 */
export function LinkBuilder({
  engagementId,
  currency,
  origin,
  rows,
}: {
  engagementId: string;
  currency: string;
  origin: string;
  rows: ExtrasRow[];
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const ticked = withoutBundled(
    rows.map((row) => row.key).filter((key) => (counts[key] ?? 0) > 0),
  );
  const url = `${origin}${showcaseIntakeRoutes.addOns(
    engagementId,
    ticked.map((key) => ({ key, quantity: counts[key] ?? 1 })),
  )}`;
  const total = ticked.reduce((sum, key) => {
    const row = rows.find((r) => r.key === key);
    return sum + (row ? row.unitCents * (counts[key] ?? 0) : 0);
  }, 0);

  const set = (key: string, count: number) =>
    setCounts((prev) => ({ ...prev, [key]: count }));

  return (
    <div className="flex flex-col gap-8">
      {(["addon", "round"] as const).map((kind) => {
        const group = rows.filter((row) => row.kind === kind);
        if (group.length === 0) return null;
        return (
          <fieldset key={kind} className="flex flex-col gap-1">
            <legend className="mb-2 text-sm text-(--color-ink)">
              {KIND_HEADING[kind]}
            </legend>
            {group.map((row) => {
              const blocked = row.owned || row.includedWith || !row.sellable;
              const count = counts[row.key] ?? 0;
              const note = row.owned
                ? "Already theirs"
                : row.includedWith
                  ? `Comes with the ${row.includedWith}`
                  : !row.sellable
                    ? "No Stripe price on this tier — run the catalogue"
                    : null;
              return (
                <div
                  key={row.key}
                  className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-b border-(--color-line-soft) py-2"
                >
                  {row.counted ? (
                    <select
                      aria-label={`${row.name}, how many`}
                      value={count}
                      disabled={Boolean(blocked)}
                      onChange={(event) =>
                        set(row.key, Number(event.target.value))
                      }
                      className="min-h-[36px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-2 text-sm text-(--color-ink) disabled:opacity-50"
                    >
                      {Array.from({ length: row.max + 1 }, (_, n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="checkbox"
                      aria-label={row.name}
                      checked={count > 0}
                      disabled={Boolean(blocked)}
                      onChange={() => set(row.key, count > 0 ? 0 : 1)}
                      className="h-4 w-4 accent-(--color-c2)"
                    />
                  )}
                  <span
                    className={`text-sm ${blocked ? "text-(--color-dim)" : "text-(--color-ink)"}`}
                  >
                    {row.name}
                  </span>
                  {note ? (
                    <span className="text-xs text-(--color-dim)">{note}</span>
                  ) : null}
                  <span className="ml-auto text-xs text-(--color-body)">
                    {formatMoney(row.unitCents, currency)}
                    {row.counted ? " each" : ""}
                  </span>
                </div>
              );
            })}
          </fieldset>
        );
      })}

      <div className="flex flex-col gap-1.5 border-t border-(--color-line-soft) pt-6">
        <label htmlFor="add-ons-url" className="text-sm text-(--color-body)">
          {ticked.length === 0
            ? "Their add-ons page, nothing pre-selected"
            : `Their add-ons page, ${formatMoney(total, currency)} plus GST pre-selected`}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="add-ons-url"
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-[44px] min-w-0 grow rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 font-(family-name:--font-mono) text-xs text-(--color-ink)"
          />
          <CopyButton text={url} label="Copy link" />
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="w-fit text-xs text-(--color-dim) underline"
        >
          Open it as they&apos;ll see it
        </a>
      </div>
    </div>
  );
}
