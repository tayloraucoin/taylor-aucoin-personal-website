import { redirect } from "next/navigation";
import { SITE } from "@/lib/config";
import { intakeRoutes } from "@/lib/routes";
import { getDepositPrice } from "@/server/services/deposit";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { DepositGate } from "../_components/deposit-gate";
import { LinkUnavailable } from "../_components/link-unavailable";
import { PaymentConfirming } from "../_components/payment-confirming";
import { ResumeList } from "../_components/resume-list";
import { Welcome } from "../_components/welcome";

/**
 * The entry point, routed by where the engagement actually is (UX spec §2).
 *
 * The client gets one link for the whole engagement and this decides what it
 * opens: pay, confirming, welcome, resume, or the finished view. Their link
 * never changes and they are never asked to remember which URL was which.
 *
 * Order matters. Completion wins over everything so a returning client sees
 * their finished state rather than being asked to pay or start again; money
 * comes before the questionnaire because an unpaid deposit is step zero.
 *
 * `?paid=1` is a hint and never a fact. It only decides whether an unpaid
 * engagement shows the pay screen or the confirming screen — the paid state
 * itself comes from `paidAt`, which only a signature-verified webhook writes.
 */
export default async function IntakeEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string }>;
}) {
  const { token } = await params;
  const { paid, canceled } = await searchParams;

  let engagement;
  try {
    engagement = await requireEngagement(token);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return <LinkUnavailable expired={error.reason === "expired"} />;
    }
    throw error;
  }

  if (engagement.completedAt) redirect(intakeRoutes.done(token));

  if (engagement.depositRequired && !engagement.paidAt) {
    // Returned from Checkout but the webhook has not landed yet.
    if (paid === "1") return <PaymentConfirming supportEmail={SITE.email} />;

    return (
      <DepositGate
        engagement={engagement}
        token={token}
        canceled={canceled === "1"}
        deposit={await getDepositPrice()}
      />
    );
  }

  if (engagement.startedAt) {
    return <ResumeList engagement={engagement} token={token} />;
  }

  return <Welcome engagement={engagement} token={token} />;
}
