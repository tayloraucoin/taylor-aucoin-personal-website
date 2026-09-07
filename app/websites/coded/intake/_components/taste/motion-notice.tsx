"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import { formatMoney } from "@/lib/intake/money";
import type { UpsellBlock } from "@/lib/intake/showcase-copy";
import { startAddonCheckout } from "../../_actions/add-on";
import { DocTag } from "../../../../intake/_components/document";
import type { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { UpsellQuestions } from "../upsell-block";

/** [COPY — draft] — every string in this component. */
const COPY = {
  offerEyebrow: "Motion · an add-on",
  offer: (price: string) =>
    `Animation — things that move, settle, respond when you scroll or hover — is built rather than bolted on, and it's priced on its own: ${price}. The site works and looks finished without it. If any of the sites you picked above won you over with how they move, this is the part that buys that.`,
  buy: (price: string) => `Add motion · ${price}`,
  opening: "Opening secure checkout…",
  trust: "Pay on Stripe, same as before.",
  boughtEyebrow: "Motion · added",
  bought:
    "You've added motion to the build, so the three questions below are yours to answer. What you say must never move is as useful as anything you want moving.",
  canceled: "No charge was made. Whenever you're ready.",
  failed:
    "That didn't open — try once more, and tell Taylor if it keeps happening. Nothing has been charged.",
  confirming: "Confirming your payment. This usually takes a couple of seconds.",
  slow: "Stripe has it. If this card doesn't update in a minute, carry on — Taylor sees the payment either way.",
  unavailable:
    "Motion isn't available to add here right now — mention it to Taylor and he'll sort it out.",
  preview: "Not available in preview.",
};

/**
 * The one commercial moment on this step, and the last thing on it.
 *
 * It sits below the brain dump on purpose: a price above someone's reactions
 * would colour them, and the whole step exists to collect honest reactions.
 *
 * **The bought state is read from the settled basket, never from the URL.**
 * `?added=` only scrolls this into view and, while the webhook is still in
 * flight, shows a confirming line. A query string a browser can type is not
 * evidence that money moved.
 *
 * **No urgency, ever.** No countdown, no "most clients add this", no
 * strike-through, no scarcity. D-INT-1's law is about every payment surface and
 * not only the first one: the notice states a fact and a price and stops.
 * Confirmation is a gold eyebrow and a hairline — there is no green on this
 * palette and validation here is gold, never a traffic light.
 */
export function MotionNotice({
  token,
  form,
  extras,
  block,
  priceCents,
  currency,
  returned,
}: {
  token: string;
  form: ReturnType<typeof useStepAutosave>;
  /** What this engagement actually paid for. Empty in a preview. */
  extras: readonly string[];
  block: UpsellBlock;
  /** The catalogue price, or null when no sellable row exists. */
  priceCents: number | null;
  currency: string;
  /** What Stripe sent them back with, if anything. */
  returned?: "added" | "canceled";
}) {
  const preview = useIsPreview();
  const document = useIsDocument();
  const bought = extras.includes("animations");

  /**
   * A document renders both states, because a reviewer cannot buy anything and
   * a branch behind a purchase is a question missing from the review (ADM-4).
   */
  if (document) {
    return (
      <div className="mt-12 border-t border-(--color-faint) pt-7">
        <DocTag>
          Shown when the animations add-on has NOT been purchased — an offer and
          a Stripe checkout button
        </DocTag>
        <Card eyebrow={COPY.offerEyebrow}>{COPY.offer("$N")}</Card>

        <DocTag>Shown when it HAS been purchased, here or on the pay screen</DocTag>
        <Card eyebrow={COPY.boughtEyebrow}>{COPY.bought}</Card>
        <UpsellQuestions
          form={form}
          extras={extras}
          extra="animations"
          block={block}
        />
      </div>
    );
  }

  if (bought) {
    return (
      <div className="mt-12 border-t border-(--color-faint) pt-7">
        <Card eyebrow={COPY.boughtEyebrow}>{COPY.bought}</Card>
        <UpsellQuestions
          form={form}
          extras={extras}
          extra="animations"
          block={block}
        />
      </div>
    );
  }

  return (
    <Offer
      token={token}
      priceCents={priceCents}
      currency={currency}
      returned={returned}
      preview={preview}
      flush={form.flush}
    />
  );
}

function Offer({
  token,
  priceCents,
  currency,
  returned,
  preview,
  flush,
}: {
  token: string;
  priceCents: number | null;
  currency: string;
  returned?: "added" | "canceled";
  preview: boolean;
  /** Writes anything still sitting in the autosave debounce, before we leave. */
  flush: () => void | Promise<unknown>;
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const price = priceCents === null ? null : formatMoney(priceCents, currency);

  return (
    <div className="mt-12 border-t border-(--color-faint) pt-7">
      <Card eyebrow={COPY.offerEyebrow}>
        {COPY.offer(price ?? "priced on request")}
      </Card>

      {/* Paid, but the webhook has not landed yet. Never "?added means paid":
          this is what the deposit screen does and for the same reason. */}
      {returned === "added" ? (
        <p
          aria-live="polite"
          className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-body)"
        >
          {COPY.confirming} {COPY.slow}
        </p>
      ) : null}

      {price === null ? (
        <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
          {COPY.unavailable}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <GhostButton
            type="button"
            disabled={preview || pending}
            onClick={
              preview
                ? undefined
                : () => {
                    setFailed(false);
                    startTransition(async () => {
                      try {
                        // Stripe is a hard navigation away from this page, and
                        // the autosave debounce is 900ms — a rating typed just
                        // before this press would otherwise be lost on a step
                        // the client never chose to leave.
                        await flush();
                        await startAddonCheckout(token, "showcase_animations");
                      } catch {
                        // A redirect throws by design and unmounts this;
                        // anything landing here is a real failure to open.
                        setFailed(true);
                      }
                    });
                  }
            }
          >
            {pending ? COPY.opening : COPY.buy(price)}
          </GhostButton>

          <span className="font-body text-[13.5px] font-light text-(--color-dim)">
            {preview ? COPY.preview : COPY.trust}
          </span>
        </div>
      )}

      {returned === "canceled" ? (
        <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-body)">
          {COPY.canceled}
        </p>
      ) : null}

      {failed ? (
        <p
          aria-live="polite"
          className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {COPY.failed}
        </p>
      ) : null}
    </div>
  );
}

/** The callout both states wear: same border, same eyebrow, same register. */
function Card({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
      <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        {eyebrow}
      </p>
      <p className="mt-3 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
        {children}
      </p>
    </div>
  );
}
