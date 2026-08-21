"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/intake/money";
import {
  checkPromoCode,
  type PromoCheckResult,
} from "../[token]/_actions/promo";
import { AddonInfo } from "./addon-info";
import { LegalAgreement } from "./legal-agreement";
import { PayButton } from "./pay-button";

/** What the server hands this surface per product: render + total math only. */
export type CheckoutAddonView = {
  key: string;
  name: string;
  description: string;
  amountCents: number;
};

type PromoState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "invalid" }
  | {
      status: "active";
      code: string;
      grant: { key: string; name: string; description: string };
    };

/**
 * The interactive half of P0: optional add-ons, the promo rail, the running
 * total, the terms checkbox, and the pay button.
 *
 * Design (amends UX spec §3, logged as D-INT-11):
 *
 * Add-on rows follow the Specialties label/body register in the intake key —
 * whole row is a 48px-minimum label wrapping a real checkbox, with a quiet
 * "How it works" dialog per row for the client who wants the process before
 * the price. The deposit is not a row: it is not optional, and rendering it
 * as a ticked-and-locked checkbox would make the screen's one commitment
 * look negotiable.
 *
 * The promo rail hides behind one dim line ("Have a code from our call?")
 * because most clients don't have one, and an empty input box on a payment
 * screen reads as a test you might be failing. A code arriving by URL param
 * opens and applies itself. Activation is display-side only — the charge
 * re-resolves the same code server-side, so the screen can never invent a
 * price.
 *
 * The CTA is disabled until the terms box is ticked (Taylor's ruling,
 * amending the earlier tap-nudge design): with a real checkbox on screen,
 * a live button that then scolds you is worse than a button that plainly
 * waits. The one-line explanation sits under the button, dim, stating a
 * fact rather than issuing a correction. No red anywhere, as ever.
 */
export function DepositCheckout({
  token,
  depositCents,
  currency,
  addons,
  initialPromoCode,
  isAdminTest = false,
}: {
  token: string;
  depositCents: number;
  currency: string;
  addons: CheckoutAddonView[];
  /** From `?promo=` on the entry URL — a code Taylor put in the link he sent. */
  initialPromoCode?: string;
  /** From `?admin_test_payment=1` — hides add-ons/promo; charge is server-gated. */
  isAdminTest?: boolean;
}) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [agreed, setAgreed] = useState(false);

  const [promoOpen, setPromoOpen] = useState(Boolean(initialPromoCode));
  const [promoInput, setPromoInput] = useState(initialPromoCode ?? "");
  const [promo, setPromo] = useState<PromoState>({ status: "idle" });
  const autoApplied = useRef(false);

  const applyPromo = async (code: string) => {
    if (!code.trim()) return;
    setPromo({ status: "checking" });
    try {
      const result: PromoCheckResult = await checkPromoCode(token, code);
      setPromo(
        result.valid
          ? { status: "active", code, grant: result.grant }
          : { status: "invalid" },
      );
    } catch {
      setPromo({ status: "invalid" });
    }
  };

  // A code that arrived in the link applies itself — the client shouldn't
  // have to re-earn what Taylor already gave them on the call.
  useEffect(() => {
    if (!initialPromoCode || autoApplied.current) return;
    autoApplied.current = true;
    void applyPromo(initialPromoCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPromoCode]);

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
  const totalCents = depositCents + addonTotal;

  const payLabel =
    addonTotal > 0
      ? `Pay today — ${formatMoney(totalCents, currency)}`
      : `Pay deposit — ${formatMoney(depositCents, currency)}`;

  const activePromo = promo.status === "active" ? promo : null;

  return (
    <div>
      {!isAdminTest && addons.length > 0 ? (
        <div className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
            Add to your build · optional
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
        </div>
      ) : null}

      {!isAdminTest ? (
      <div className="mt-6">
        {activePromo ? (
          <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-body text-[16px] text-(--color-ink)">
                {activePromo.grant.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
                Included
              </span>
            </div>
            <p className="mt-1 max-w-[44ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
              {activePromo.grant.description} Nothing added to today&apos;s
              total.
            </p>
          </div>
        ) : !promoOpen ? (
          <button
            type="button"
            onClick={() => setPromoOpen(true)}
            className="font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim) underline decoration-(--color-faint) underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            Have a code from our call?
          </button>
        ) : (
          <div>
            <label
              htmlFor="promo-code"
              className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)"
            >
              Promo code
            </label>
            <div className="mt-2 flex gap-2.5">
              <input
                id="promo-code"
                type="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  if (promo.status === "invalid") setPromo({ status: "idle" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void applyPromo(promoInput);
                  }
                }}
                className="min-h-12 w-full min-w-0 grow rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 font-mono text-[16px] tracking-[.04em] text-(--color-ink) placeholder:text-(--color-dim) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              />
              <button
                type="button"
                disabled={promo.status === "checking" || !promoInput.trim()}
                onClick={() => void applyPromo(promoInput)}
                className="min-h-12 shrink-0 rounded-(--radius) border border-(--color-faint) px-5 font-mono text-[11px] uppercase tracking-[.10em] text-(--color-body) transition-colors hover:border-[rgb(232_185_97/.55)] hover:text-(--color-ink) disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                {promo.status === "checking" ? "Checking…" : "Apply"}
              </button>
            </div>
            {promo.status === "invalid" ? (
              <p
                aria-live="polite"
                className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
              >
                That code isn&apos;t one of mine — worth checking the spelling.
              </p>
            ) : null}
          </div>
        )}
      </div>
      ) : null}

      <div className="mt-8">
        <LegalAgreement checked={agreed} onChange={setAgreed} />
      </div>

      <div className="mt-4">
        <PayButton
          token={token}
          label={payLabel}
          addonKeys={[...selected]}
          promoCode={activePromo?.code}
          adminTestPayment={isAdminTest}
          disabled={!agreed}
        />
        {!agreed ? (
          <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            The button unlocks once you&apos;ve ticked the agreement above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
