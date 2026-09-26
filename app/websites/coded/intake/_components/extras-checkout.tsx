"use client";

import { useState, useTransition, type ReactNode } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { NativeSelect } from "@/components/ui/native-select";
import type { ExtrasItem } from "@/lib/extras/cart";
import { includedBy, withoutBundled } from "@/lib/intake/addon-bundles";
import { formatMoney } from "@/lib/intake/money";
import type { ExtrasRow } from "@/server/services/extras";
import { startExtrasCheckoutAction } from "../_actions/extras";
import { AddonInfo } from "../../../intake/_components/addon-info";
import { INTAKE_COLUMN } from "../../../intake/_lib/column";

/**
 * The interactive half of the add-ons page (FIN-8): whatever the link
 * pre-selected, ticked; everything else they can buy, unticked; one total;
 * one pay button.
 *
 * The pay screen's grammar, row for row (`showcase-checkout.tsx`) — the same
 * checkbox, the same "How it works", the same count picker for pages and
 * posts, the same bundle rule — because a client who has been through the
 * pay screen should recognise this as the same place. Not extracted into a
 * shared row yet: the pay screen is live money, and changing it to share a
 * component is its own slice.
 *
 * Nothing here decides a price. The amounts shown are the catalogue's; the
 * server re-checks the cart and verifies every price against Stripe before a
 * session exists. The browser sends keys and counts.
 */
export function ExtrasCheckout({
  engagementId,
  currency,
  rows,
  preselected,
  ownedKeys,
  canceled,
}: {
  engagementId: string;
  currency: string;
  rows: ExtrasRow[];
  preselected: ExtrasItem[];
  ownedKeys: string[];
  canceled: boolean;
}) {
  const all = rows;
  const picked = new Set(preselected.map((item) => item.key));
  const buyable = (row: ExtrasRow) =>
    row.sellable && !row.owned && !row.includedWith;

  // Pre-selected rows lead, in the link's order; then the add-ons; then the
  // rounds. Rows they own are left off the lists entirely — a page for
  // buying more is not a receipt.
  const selection = preselected
    .map((item) => rows.find((row) => row.key === item.key))
    .filter((row): row is ExtrasRow => row !== undefined);
  const addons = rows.filter(
    (row) => row.kind === "addon" && buyable(row) && !picked.has(row.key),
  );
  const rounds = rows.filter(
    (row) => row.kind === "round" && buyable(row) && !picked.has(row.key),
  );

  /** key → count. Absent or 0 is not in the cart. */
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(preselected.map((item) => [item.key, item.quantity])),
  );
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const ticked = Object.keys(counts).filter((key) => (counts[key] ?? 0) > 0);
  const chargeable = withoutBundled(ticked);
  const have = new Set([...ownedKeys, ...chargeable]);

  // A row with a prerequisite (a post needs the blog) only shows once it has
  // one — owned, or in this cart. The server refuses the same sale.
  const unlocked = (row: ExtrasRow) =>
    row.requires === null || have.has(row.requires);

  const items: ExtrasItem[] = chargeable
    .filter((key) => {
      const row = all.find((r) => r.key === key);
      return row !== undefined && unlocked(row);
    })
    .map((key) => ({ key, quantity: counts[key] ?? 1 }));

  const totalCents = items.reduce((sum, item) => {
    const row = all.find((r) => r.key === item.key);
    return sum + (row ? row.unitCents * item.quantity : 0);
  }, 0);

  const set = (key: string, count: number) =>
    setCounts((prev) => ({ ...prev, [key]: count }));

  const pay = () => {
    setError(null);
    start(async () => {
      try {
        const result = await startExtrasCheckoutAction(engagementId, items);
        setError(result.message);
      } catch {
        // A redirect throws by design and unmounts this; anything that
        // lands here is a real failure to open Checkout.
        setError(
          "That didn't open — try once more, and tell Taylor if it keeps happening. Nothing has been charged.",
        );
      }
    });
  };

  const renderRow = (row: ExtrasRow) => {
    if (!unlocked(row)) return null;
    const count = counts[row.key] ?? 0;
    const owner = includedBy(row.key, new Set(ticked));
    const ownerName = owner
      ? (all.find((r) => r.key === owner)?.name ?? null)
      : null;

    if (row.owned || row.includedWith) {
      return (
        <div key={row.key} className="py-3.5">
          <span className="flex items-baseline justify-between gap-4">
            <span className="font-body text-[16px] leading-[1.4] text-(--color-body)">
              {row.name}
            </span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
              {/* [COPY — draft] */}
              Already yours
            </span>
          </span>
        </div>
      );
    }

    if (row.counted) {
      return (
        <div key={row.key} className="py-3.5">
          <div className="flex items-baseline justify-between gap-4">
            <label
              htmlFor={`count-${row.key}`}
              className="font-body text-[16px] leading-[1.4] text-(--color-body)"
            >
              {row.name}
            </label>
            <span className="shrink-0 font-mono text-[12px] tracking-[.06em] text-(--color-dim)">
              {formatMoney(row.unitCents, currency)} each
            </span>
          </div>
          <p className="mt-1 max-w-[44ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            {row.description}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <NativeSelect
              id={`count-${row.key}`}
              value={count}
              onChange={(event) => set(row.key, Number(event.target.value))}
              className="min-h-12 border-(--color-faint) bg-(--color-card) font-body text-[16px] font-light text-(--color-ink) transition-colors hover:border-(--color-gold-line-soft) focus:border-(--color-gold-line)"
            >
              {Array.from({ length: row.max + 1 }, (_, n) => (
                <option key={n} value={n}>
                  {n === 0 ? "None" : String(n)}
                </option>
              ))}
            </NativeSelect>
            {count > 0 ? (
              <span className="font-mono text-[12px] tracking-[.06em] text-(--color-ink)">
                {formatMoney(row.unitCents * count, currency)}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    const isOn = count > 0 && !ownerName;
    return (
      <label
        key={row.key}
        className={`flex min-h-12 items-start gap-3.5 py-3.5 ${
          ownerName ? "cursor-default" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          checked={isOn}
          disabled={ownerName !== null}
          onChange={() => set(row.key, count > 0 ? 0 : 1)}
          aria-label={`${row.name}, ${formatMoney(row.unitCents, currency)}`}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-(--radius) border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-c2) ${
            isOn
              ? "border-(--color-c2) bg-(--color-c2)"
              : "border-(--color-faint) bg-transparent"
          }`}
        >
          {isOn ? (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path
                d="M1 4.5L4 7.5L10 1"
                stroke="var(--color-ground-a)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="min-w-0 grow">
          <span className="flex items-baseline justify-between gap-4">
            <span
              className={`font-body text-[16px] leading-[1.4] transition-colors ${
                isOn ? "text-(--color-ink)" : "text-(--color-body)"
              }`}
            >
              {row.name}
            </span>
            <span
              className={`shrink-0 font-mono text-[12px] tracking-[.06em] transition-colors ${
                isOn ? "text-(--color-ink)" : "text-(--color-dim)"
              }`}
            >
              {ownerName ? "Included" : formatMoney(row.unitCents, currency)}
            </span>
          </span>
          <span className="mt-1 block max-w-[44ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            {row.description}
          </span>
          {ownerName ? (
            <span className="mt-1 block max-w-[44ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
              {/* [COPY — pending Taylor] — the pay screen's line */}
              Comes with the {ownerName.toLowerCase()} — it can&apos;t run
              without one, so you&apos;re not paying for it twice.
            </span>
          ) : null}
          <AddonInfo productKey={row.key} />
        </span>
      </label>
    );
  };

  return (
    <div>
      {canceled ? (
        <p className="mt-6 max-w-[48ch] font-body text-[14px] font-light leading-[1.5] text-(--color-dim)">
          No charge was made. Whenever you&apos;re ready.
        </p>
      ) : null}

      <Section title="Your selection" rows={selection} render={renderRow} />
      <Section
        title={selection.length > 0 ? "Worth adding?" : "Add to your site"}
        rows={addons}
        render={renderRow}
      />
      <Section title="Rounds of changes" rows={rounds} render={renderRow} />

      {/* The total and the pay button ride a bar fixed to the bottom, so
          nobody scrolls back to find them after ticking a row. The intake
          step footer's bar exactly (`step-shell.tsx`): full-width, its inner
          row on `INTAKE_COLUMN` so the button lines up with the rows above.
          The page carries the clearance (`pb-32` on its root). */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-(--color-faint) bg-(--color-card) backdrop-blur-[6px]">
        <div className={`py-4 ${INTAKE_COLUMN}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
                Total
              </span>
              <span
                aria-live="polite"
                className="font-body text-[16px] text-(--color-ink)"
              >
                {formatMoney(totalCents, currency)}
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                  + GST
                </span>
              </span>
            </div>

            <GradientButton
              disabled={pending || items.length === 0}
              onClick={pay}
              className="min-w-[11rem] justify-center"
            >
              {pending
                ? "Opening checkout…"
                : items.length === 0
                  ? "Nothing selected"
                  : "Pay"}
            </GradientButton>
          </div>

          {error ? (
            <p
              aria-live="polite"
              className="mt-2.5 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** One titled group of rows, in the pay screen's ruled list; absent when empty. */
function Section({
  title,
  rows,
  render,
}: {
  title: string;
  rows: ExtrasRow[];
  render: (row: ExtrasRow) => ReactNode;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-9">
      <p className="font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)">
        {title}
      </p>
      <div className="mt-3 divide-y divide-(--color-faint) border-y border-(--color-faint)">
        {rows.map(render)}
      </div>
    </div>
  );
}
