import { PreviewModeProvider } from "@/components/intake/preview-mode";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import type { IntakeTrackKey } from "@/lib/types/intake";
import { getCheckoutCatalogue } from "@/server/services/deposit";
import { findSellableProductByKey } from "@/server/services/products";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";

import { StartForm } from "@/app/websites/intake/_components/start-form";
import { DepositGate } from "@/app/websites/intake/_components/deposit-gate";
import { Welcome } from "@/app/websites/intake/_components/welcome";
import { ShowcaseStartForm } from "@/app/websites/coded/intake/_components/showcase-start-form";
import { ShowcasePayGate } from "@/app/websites/coded/intake/_components/showcase-pay-gate";
import { ShowcaseWelcome } from "@/app/websites/coded/intake/_components/showcase-welcome";

import { FlowSection, SectionUnavailable } from "./_components/flow-sections";
import { PreviewControls } from "./_components/preview-controls";
import { previewEngagement } from "./_components/preview-engagement";
import { QuestionStack } from "./_components/question-stack";

/**
 * The whole intake, top to bottom, in one scroll.
 *
 * Not just the nine questionnaire steps: the start form asks real questions
 * before anyone has paid, and the pay screen is where the upsell happens.
 * Reviewing the steps alone hid both, and hid the payment boundary between
 * them (Taylor, 2026-09-01).
 *
 * The fields are live, because the choice groups and conditional reveals are
 * half of what there is to review. Nothing writes. Preview mode is a context
 * that defaults to off, so the client flow is not "preview disabled" — it never
 * mounts the provider, and this route is the only place that does. Every write
 * path beneath it refuses: autosave, uploads, extraction, promo codes, starting
 * an engagement, and opening Stripe Checkout.
 *
 * **Prices on the pay section are real**, read from the product catalogue, so
 * this screen quotes what a client would be quoted. That is the one query this
 * page issues, and it reads Taylor's own catalogue — never client data.
 */
export default async function IntakeQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string; pack?: string }>;
}) {
  const params = await searchParams;

  // A typo in a query string sends a reviewer back to the default view, not to
  // an error page. There is nothing here worth 404ing over.
  const track: IntakeTrackKey =
    params.track === "showcase" ? "showcase" : "durable";
  const flavour: ShowcaseFlavour = params.pack === "film" ? "film" : "generic";

  const engagement = previewEngagement(track);
  const catalogue = await loadCatalogue(track);

  return (
    <>
      <AdminPageHeader
        title="Intake questions"
        description="The whole flow in order: what is asked before payment, the deposit and add-ons, then the nine steps."
        actions={<PreviewControls track={track} flavour={flavour} />}
      />

      {/*
        Orientation, not a warning — plain words, no alarm colour, no icon, and
        no way to dismiss it. Someone testing a form should never have to
        reconstruct which mode they are in.
      */}
      <p className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-3 text-sm text-(--color-dim)">
        Preview — nothing here is saved, no engagement is created, and no
        payment can be started. Prices are the real catalogue.
      </p>

      <PreviewModeProvider>
        <div className="mt-10">
          <FlowSection
            stage="Before payment · Step 1"
            title="Start form"
            note="The public page. A client fills this in before they have paid anything, and their answers mint the engagement and prefill the questionnaire."
          >
            {track === "showcase" ? <ShowcaseStartForm /> : <StartForm />}
          </FlowSection>

          <FlowSection
            stage="Before payment · Step 2"
            title="Deposit and add-ons"
            note="The upsell and the checkout. Nothing past this point is reachable until the deposit is paid."
          >
            {catalogue.kind === "missing" ? (
              <SectionUnavailable reason={catalogue.reason} />
            ) : track === "showcase" ? (
              <ShowcasePayGate
                engagement={engagement}
                token=""
                canceled={false}
                half={catalogue.deposit}
                full={catalogue.full}
                addons={catalogue.addons}
              />
            ) : (
              <DepositGate
                engagement={engagement}
                token=""
                canceled={false}
                deposit={catalogue.deposit}
                addons={catalogue.addons}
              />
            )}
          </FlowSection>

          <FlowSection
            stage="After payment"
            title="Welcome"
            note="The first screen after the deposit lands. It sets the expectation for the questionnaire."
          >
            {track === "showcase" ? (
              <ShowcaseWelcome engagement={engagement} token="" />
            ) : (
              <Welcome engagement={engagement} token="" />
            )}
          </FlowSection>

          <FlowSection
            stage="After payment"
            title="The questionnaire"
            note="Nine steps, each its own screen for the client. Stacked here so they read end to end."
          >
            <QuestionStack track={track} flavour={flavour} />
          </FlowSection>
        </div>
      </PreviewModeProvider>
    </>
  );
}

type Catalogue =
  | {
      kind: "found";
      deposit: Awaited<ReturnType<typeof getCheckoutCatalogue>>["deposit"];
      addons: Awaited<ReturnType<typeof getCheckoutCatalogue>>["addons"];
      full: Awaited<ReturnType<typeof findSellableProductByKey>>;
    }
  | { kind: "missing"; reason: string };

/**
 * The real catalogue, or an honest explanation of why it is absent.
 *
 * A catalogue read can fail for reasons that have nothing to do with this
 * screen — no database in the environment, no sellable row for the track yet.
 * Rendering nothing in that case would read as "there is no payment step",
 * which is the opposite of true, so the section says what happened instead.
 */
async function loadCatalogue(track: IntakeTrackKey): Promise<Catalogue> {
  try {
    const { deposit, addons } = await getCheckoutCatalogue(false, track, "half");
    const full =
      track === "showcase"
        ? await findSellableProductByKey("showcase_full")
        : null;
    return { kind: "found", deposit, addons, full };
  } catch (error) {
    // Surface the thrown message verbatim. `getBuildProduct` already raises the
    // exact remedy ("Run `yarn stripe:catalogue --apply` and `yarn db:seed`…"),
    // and an earlier version of this catch threw that away and substituted a
    // sentence that named no cause and no fix. This screen is Taylor-only, so
    // there is nothing here to protect a reader from.
    return {
      kind: "missing",
      reason:
        error instanceof Error ? error.message : "Unknown catalogue failure.",
    };
  }
}
