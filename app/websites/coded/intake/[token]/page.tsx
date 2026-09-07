import { notFound, redirect } from "next/navigation";
import { SITE } from "@/lib/config";
import { showcaseIntakeRoutes } from "@/lib/routes";
import { getCheckoutCatalogue } from "@/server/services/deposit";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { findSellableProductByKey } from "@/server/services/products";
import { ShowcasePayGate } from "../_components/showcase-pay-gate";
import { ShowcaseWelcome } from "../_components/showcase-welcome";
import { LinkUnavailable } from "../../../intake/_components/link-unavailable";
import { PaymentConfirming } from "../../../intake/_components/payment-confirming";
import { ResumeList } from "../../../intake/_components/resume-list";

/**
 * The showcase track's entry point, routed by where the engagement is.
 *
 * Same state machine and same precedence as the durable track's (UX spec §2):
 * completion beats everything so a returning client sees their finished state
 * rather than being asked to start again, and money comes before the
 * questionnaire because an unpaid deposit is step zero.
 *
 * A durable engagement's token cannot open this tree, and vice versa — each
 * track's links only work in their own. Wrong-tree access is a 404 rather than
 * a redirect: the two trees are different products, and silently moving
 * someone between them would be a worse answer than not finding the page.
 */
export default async function ShowcaseIntakeEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    paid?: string;
    canceled?: string;
    promo?: string;
  }>;
}) {
  const { token } = await params;
  const { paid, canceled, promo } = await searchParams;

  let engagement;
  try {
    engagement = await requireEngagement(token);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return <LinkUnavailable expired={error.reason === "expired"} />;
    }
    throw error;
  }

  if (engagement.track !== "showcase") notFound();

  if (engagement.completedAt) redirect(showcaseIntakeRoutes.done(token));

  if (engagement.depositRequired && !engagement.paidAt) {
    // Returned from Checkout but the webhook has not landed yet. `?paid=1` is
    // a hint and never a fact — the paid state comes from `paidAt`, which only
    // a signature-verified webhook writes.
    if (paid === "1") return <PaymentConfirming supportEmail={SITE.email} />;

    // The plan cards are priced from the catalogue's own rows. `half` is the
    // one row this screen cannot render without; `full` is optional and simply
    // is not offered when it is not sellable.
    const {
      deposit: half,
      addons,
      extraPage,
      seoPost,
    } = await getCheckoutCatalogue(false, engagement.track, "half");
    const full = await findSellableProductByKey("showcase_full");

    return (
      <ShowcasePayGate
        engagement={engagement}
        token={token}
        canceled={canceled === "1"}
        half={half}
        full={full}
        addons={addons}
        seoPost={seoPost}
        extraPage={extraPage}
        promoCode={promo}
      />
    );
  }

  if (engagement.startedAt) {
    return <ResumeList engagement={engagement} token={token} />;
  }

  return <ShowcaseWelcome engagement={engagement} token={token} />;
}
