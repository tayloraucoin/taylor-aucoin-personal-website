import { eyebrowFor } from "@/lib/intake/tracks";
import type { Engagement } from "@/server/services/engagement";
import type { SellableProduct } from "@/server/services/products";
import type { CheckoutAddonView } from "../../../intake/_components/deposit-checkout";
import { Eyebrow } from "../../../intake/_components/eyebrow";
import { ShowcaseCheckout } from "./showcase-checkout";

/**
 * The coded track's pay screen.
 *
 * Colder than the platform track's P0 in one specific way: there was no phone
 * call. A filmmaker arrives here from a link someone sent them, so the screen
 * carries the whole weight of "this is real and safe" that a conversation
 * carried on the other track. What it does about that is state the offer
 * plainly and get out of the way.
 *
 * There is no countdown, no "spots left", no testimonial strip, and no
 * scarcity of any kind. Manufactured urgency next to a payment button borrows
 * against the only thing this screen has, which is confidence (D-INT-1).
 *
 * The headline and its paragraph are `portfolio-intake-questions-v2.md`
 * § Payment screen, verbatim.
 *
 * **Deliberately absent: the refund sentence.** D-INT-10 ruled one for the
 * platform track's $600 deposit; this screen can charge $1,900, and Taylor has
 * not ruled the equivalent. Rendering the other track's promise here would be
 * inventing a refund policy, so the trust block ends without one until he
 * rules. `[NEEDS DECISION — Taylor]`
 */
export function ShowcasePayGate({
  engagement,
  token,
  canceled,
  half,
  full,
  addons,
  extraPage,
  seoPost,
  promoCode,
}: {
  engagement: Engagement;
  token: string;
  canceled: boolean;
  half: SellableProduct;
  full: SellableProduct | null;
  addons: SellableProduct[];
  /** Priced per page, so it is counted rather than ticked. Null if unsellable. */
  extraPage: SellableProduct | null;
  seoPost: SellableProduct | null;
  promoCode?: string;
}) {
  const toView = (product: SellableProduct): CheckoutAddonView => ({
    key: product.key,
    name: product.name,
    description: product.description,
    amountCents: product.priceCents,
  });

  const addonViews: CheckoutAddonView[] = addons.map(toView);

  return (
    <div>
      <Eyebrow>{eyebrowFor(engagement.track)}</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        The build is $2,000.
      </h1>

      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        Five pages, your work fully produced, real code you own, hosting that
        costs close to nothing. Extra pages are $150 each — add them below if
        you already know you need them, or leave it: you&apos;ll pick pages
        inside, and nothing beyond what you pay for today is ever charged
        without a conversation first.
      </p>

      {canceled ? (
        <p className="mt-6 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
          No charge was made. Whenever you&apos;re ready.
        </p>
      ) : null}

      <ShowcaseCheckout
        token={token}
        currency={engagement.currency}
        halfCents={half.priceCents}
        // Null when the pay-in-full row is not sellable on this tier. The
        // option then does not render, rather than rendering at a number
        // derived from the deposit — a price nothing could actually charge.
        fullCents={full?.priceCents ?? null}
        addons={addonViews}
        extraPage={extraPage ? toView(extraPage) : null}
        seoPost={seoPost ? toView(seoPost) : null}
        initialPromoCode={promoCode}
      />

      <div className="mt-5 space-y-1.5 font-mono text-[10px] uppercase leading-[1.7] tracking-[.18em] text-(--color-dim)">
        <p>Payment handled by Stripe · Apple Pay / Google Pay / card</p>
        <p>Shows as TAYLORAUCOIN.COM on your statement</p>
        <p>Receipt emailed automatically</p>
      </div>
    </div>
  );
}
