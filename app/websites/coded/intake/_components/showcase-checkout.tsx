"use client";

import { useEffect, useRef, useState } from "react";
import { useIsPreview } from "@/components/intake/preview-mode";
import { formatMoney } from "@/lib/intake/money";
import { EXTRA_PAGES_MAX } from "@/lib/validators/intake";
import { checkShowcasePromoCode } from "../_actions/promo";
import { AddonInfo } from "../../../intake/_components/addon-info";
import type { CheckoutAddonView } from "../../../intake/_components/deposit-checkout";
import { LegalAgreement } from "../../../intake/_components/legal-agreement";
import { PromoRail } from "../../../intake/_components/promo-rail";
import { ShowcasePayButton } from "./showcase-pay-button";

type PromoState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "invalid" }
  | {
      status: "active";
      code: string;
      granted?: { key: string; name: string; description: string };
      build?: { halfCents: number; fullCents?: number };
    };

/**
 * The interactive half of the coded track's pay screen: the plan choice, the
 * optional add-ons, the promo rail, today's total, the terms checkbox, and the
 * pay button.
 *
 * The plan choice is the one thing this screen has that the platform track's
 * does not, and it is deliberately unselected on arrival. Preselecting half
 * would be nudging toward the smaller charge; preselecting full would be
 * nudging toward the larger one. Neither is a decision this screen gets to
 * make on someone's behalf, so the button carries no amount until they choose.
 *
 * Only today's charge is ever totalled. Nothing recurring is sold here at all
 * (M-PORT-6), so there is no monthly line to explain and no start date to be
 * vague about.
 *
 * The CTA is disabled until the terms box is ticked (D-INT-11 as amended), with
 * one dim line under the button stating the fact rather than issuing a
 * correction. No red anywhere, as ever.
 */
export function ShowcaseCheckout({
  token,
  currency,
  halfCents,
  fullCents,
  addons,
  extraPage,
  initialPromoCode,
}: {
  token: string;
  currency: string;
  halfCents: number;
  /** Null when no pay-in-full row is sellable; the option is then not offered. */
  fullCents: number | null;
  addons: CheckoutAddonView[];
  /**
   * Extra pages, priced per page. Null when no sellable row exists, in which
   * case nothing is offered rather than a count that cannot be charged.
   */
  extraPage: CheckoutAddonView | null;
  initialPromoCode?: string;
}) {
  // Promo validation round-trips to a server action against a real token.
  const preview = useIsPreview();
  const [plan, setPlan] = useState<"half" | "full" | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  /**
   * How many pages beyond the included five. Zero is the default and is not a
   * selection — nothing is added to the total until the client picks a number.
   */
  const [pages, setPages] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const [promoOpen, setPromoOpen] = useState(Boolean(initialPromoCode));
  const [promoInput, setPromoInput] = useState(initialPromoCode ?? "");
  const [promo, setPromo] = useState<PromoState>({ status: "idle" });
  const autoApplied = useRef(false);

  const applyPromo = async (code: string) => {
    if (preview) return;
    if (!code.trim()) return;
    setPromo({ status: "checking" });
    try {
      const result = await checkShowcasePromoCode(token, code);
      setPromo(
        result.valid
          ? {
              status: "active",
              code,
              granted: result.granted,
              build: result.build,
            }
          : { status: "invalid" },
      );
    } catch {
      setPromo({ status: "invalid" });
    }
  };

  // A code that arrived in the link applies itself — the client shouldn't have
  // to re-earn what Taylor already gave them.
  useEffect(() => {
    if (!initialPromoCode || autoApplied.current) return;
    autoApplied.current = true;
    void applyPromo(initialPromoCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPromoCode]);

  const active = promo.status === "active" ? promo : null;

  // A negotiated code replaces the published prices on the cards themselves,
  // so what the client reads is what they are charged.
  const effectiveHalf = active?.build?.halfCents ?? halfCents;
  const effectiveFull = active?.build ? active.build.fullCents : fullCents;

  // With no pay-in-full row — none seeded, or none behind an active code — the
  // option is not offered rather than offered at a price nothing can charge.
  const fullAvailable = typeof effectiveFull === "number";

  useEffect(() => {
    if (plan === "full" && !fullAvailable) setPlan(null);
  }, [fullAvailable, plan]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addonTotal = addons
    .filter((a) => selected.has(a.key))
    .reduce((sum, a) => sum + a.amountCents, 0);

  // The one multiplication on this screen, and it is display only. Stripe does
  // the arithmetic that matters, from the same count and its own price.
  const pagesCents = extraPage ? extraPage.amountCents * pages : 0;

  const planCents =
    plan === "full" && typeof effectiveFull === "number"
      ? effectiveFull
      : plan === "half"
        ? effectiveHalf
        : null;

  const totalCents =
    planCents === null ? null : planCents + addonTotal + pagesCents;

  const payLabel =
    totalCents === null
      ? "Pay deposit"
      : `Pay today — ${formatMoney(totalCents, currency)}`;

  return (
    <div>
      <fieldset className="mt-8 min-w-0 border-0 p-0">
        <legend className="font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)">
          How would you like to pay?
        </legend>

        <div className="mt-3 flex flex-col gap-2.5">
          <PlanCard
            selected={plan === "half"}
            onSelect={() => setPlan("half")}
            label="Half now, half before launch"
            amount={formatMoney(effectiveHalf, currency)}
          />
          {fullAvailable ? (
            <PlanCard
              selected={plan === "full"}
              onSelect={() => setPlan("full")}
              label="All up front, 5% off"
              amount={formatMoney(effectiveFull, currency)}
            />
          ) : null}
        </div>
      </fieldset>

      {addons.length > 0 ? (
        <div className="mt-9">
          <p className="font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)">
            Worth adding?
          </p>

          <div className="mt-3 divide-y divide-(--color-faint) border-y border-(--color-faint)">
            {addons.map((addon) => {
              const isOn = selected.has(addon.key);
              return (
                <label
                  key={addon.key}
                  className="flex min-h-12 cursor-pointer items-start gap-3.5 py-3.5"
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggle(addon.key)}
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
                        {addon.name}
                      </span>
                      <span
                        className={`shrink-0 font-mono text-[12px] tracking-[.06em] transition-colors ${
                          isOn ? "text-(--color-ink)" : "text-(--color-dim)"
                        }`}
                      >
                        {formatMoney(addon.amountCents, currency)}
                      </span>
                    </span>
                    <span className="mt-1 block max-w-[44ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                      {addon.description}
                    </span>
                    <AddonInfo productKey={addon.key} />
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Counted, not ticked. Everything above is a yes/no; this is a how
          many, so it gets a number picker and its own line on the total
          rather than a checkbox that would have to mean "one". */}
      {extraPage ? (
        <div className="mt-9">
          <p className="font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)">
            Extra pages?
          </p>

          <div className="mt-3 border-y border-(--color-faint) py-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <label
                htmlFor="extra-pages"
                className="font-body text-[16px] leading-[1.4] text-(--color-body)"
              >
                Pages beyond the five included
              </label>
              <span className="shrink-0 font-mono text-[12px] tracking-[.06em] text-(--color-dim)">
                {formatMoney(extraPage.amountCents, currency)} each
              </span>
            </div>

            <p className="mt-1 max-w-[44ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
              {/* [COPY — pending Taylor] */}
              Only if you already know you need them — you&apos;ll lay out what
              every page is for inside the questionnaire, and we can always add
              pages later. Project detail pages don&apos;t count; they come with
              the work section.
            </p>

            <div className="mt-3 flex items-center gap-3">
              <select
                id="extra-pages"
                value={pages}
                onChange={(event) => setPages(Number(event.target.value))}
                className="min-h-12 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3 font-body text-[16px] font-light text-(--color-ink) transition-colors hover:border-[rgb(232_185_97/.28)] focus:border-[rgb(232_185_97/.55)]"
              >
                {Array.from({ length: EXTRA_PAGES_MAX + 1 }, (_, n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "None" : n === 1 ? "1 page" : `${n} pages`}
                  </option>
                ))}
              </select>

              {pages > 0 ? (
                <span className="font-mono text-[12px] tracking-[.06em] text-(--color-ink)">
                  {formatMoney(pagesCents, currency)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {totalCents !== null ? (
        <div className="flex items-baseline justify-between pt-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
            Total today
          </span>
          <span className="font-body text-[16px] text-(--color-ink)">
            {formatMoney(totalCents, currency)}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
              + GST
            </span>
          </span>
        </div>
      ) : null}

      <div className="mt-6">
        <PromoRail
          open={promoOpen}
          state={{ status: promo.status }}
          value={promoInput}
          onOpen={() => setPromoOpen(true)}
          onChange={(next) => {
            setPromoInput(next);
            if (promo.status === "invalid") setPromo({ status: "idle" });
          }}
          onApply={() => void applyPromo(promoInput)}
          activeSlot={
            active ? (
              <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-3.5">
                {active.granted ? (
                  <>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-body text-[16px] text-(--color-ink)">
                        {active.granted.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
                        Included
                      </span>
                    </div>
                    <p className="mt-1 max-w-[44ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                      {active.granted.description} Nothing added to today&apos;s
                      total.
                    </p>
                  </>
                ) : (
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-body text-[16px] text-(--color-ink)">
                      Your agreed price
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
                      Applied
                    </span>
                  </div>
                )}
              </div>
            ) : null
          }
        />
      </div>

      <div className="mt-8">
        <LegalAgreement checked={agreed} onChange={setAgreed} />
      </div>

      <div className="mt-4">
        <ShowcasePayButton
          token={token}
          label={payLabel}
          plan={plan}
          addonKeys={[...selected]}
          extraPages={pages}
          promoCode={active?.code}
          disabled={!agreed || plan === null}
        />
        {plan === null ? (
          <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            Pick how you&apos;d like to pay, and tick the agreement above.
          </p>
        ) : !agreed ? (
          <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            The button unlocks once you&apos;ve ticked the agreement above.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * One payment plan, as a full-width tap-card.
 *
 * The amount carries the site's stat-number treatment — solid gold display
 * type, the one place gradient-adjacent emphasis is sanctioned on a money
 * screen (UX spec §3). Radios rather than buttons so the group is one
 * arrow-key traversal and announces as a choice, not as two actions.
 */
function PlanCard({
  selected,
  onSelect,
  label,
  amount,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  amount: string;
}) {
  return (
    <label
      className={`flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-(--radius) border px-4 py-3.5 transition-colors duration-(--dur-fast) ease-(--ease-out) ${
        selected
          ? "border-[rgb(232_185_97/.55)] bg-(--color-card-hover)"
          : "border-(--color-faint) bg-(--color-card) hover:border-[rgb(232_185_97/.28)] hover:bg-(--color-card-hover)"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <input
          type="radio"
          name="plan"
          checked={selected}
          onChange={onSelect}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-(--dur-fast) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-(--color-c2) ${
            selected ? "bg-(--color-c2)" : "bg-(--color-faint)"
          }`}
        />
        <span
          className={`font-body text-[16px] font-light leading-[1.4] ${
            selected ? "text-(--color-ink)" : "text-(--color-body)"
          }`}
        >
          {label}
        </span>
      </span>

      <span className="shrink-0 font-display text-[20px] font-medium tracking-[-.02em] text-(--color-c2)">
        {amount}
      </span>
    </label>
  );
}
