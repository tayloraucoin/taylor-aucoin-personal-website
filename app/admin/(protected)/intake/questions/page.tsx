import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { ShowcasePayGate } from "@/app/websites/coded/intake/_components/showcase-pay-gate";
import { ShowcaseStartForm } from "@/app/websites/coded/intake/_components/showcase-start-form";
import { ShowcaseWelcome } from "@/app/websites/coded/intake/_components/showcase-welcome";
import { DepositGate } from "@/app/websites/intake/_components/deposit-gate";
import { StartForm } from "@/app/websites/intake/_components/start-form";
import { Welcome } from "@/app/websites/intake/_components/welcome";
import {
  PreviewModeProvider,
  type KindScope,
  type RenderMode,
} from "@/components/intake/preview-mode";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import {
  flavourForKind,
  labelForKind,
  showcaseKinds,
} from "@/lib/intake/tracks";
import type { IntakeTrackKey } from "@/lib/types/intake";
import { getCheckoutCatalogue } from "@/server/services/deposit";
import { findSellableProductByKey } from "@/server/services/products";
import { AccordionControls, AccordionProvider } from "./_components/accordion";
import { DownloadMarkdown } from "./_components/download-markdown";
import { FlowSection, SectionUnavailable } from "./_components/flow-sections";
import { PackDiffSection } from "./_components/pack-diff-section";
import { EVERY_KIND, PreviewControls } from "./_components/preview-controls";
import { previewEngagement } from "./_components/preview-engagement";
import { QuestionStack } from "./_components/question-stack";
import { markdownFilename } from "./_components/to-markdown";

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
  searchParams: Promise<{
    track?: string;
    kind?: string;
    pack?: string;
    mode?: string;
  }>;
}) {
  const params = await searchParams;

  // A typo in a query string sends a reviewer back to the default view, not to
  // an error page. There is nothing here worth 404ing over.
  const track: IntakeTrackKey =
    params.track === "showcase" ? "showcase" : "durable";
  // The kind is the input the whole cartridge branches on: it picks the copy
  // pack *and* decides which field groups exist. Reviewing by pack alone
  // showed one questionnaire out of seven (PORT-11 onward).
  const kind: ShowcaseKind =
    (showcaseKinds().find((entry) => entry.key === params.kind)
      ?.key as ShowcaseKind) ?? "portfolio";

  // Two orthogonal switches, both in the URL and both falling back the way
  // ADM-2 set: a typo lands on the ordinary view, never on an error page.
  const mode: RenderMode =
    params.mode === "document" ? "document" : "interface";

  // The overview. It reads generic-pack words with every kind-driven branch
  // shown and tagged; the pack differences are listed in the appendix, because
  // one document cannot render six packs' strings at once (D-ADM-11).
  const everyKind = params.kind === EVERY_KIND;
  const scope: KindScope = everyKind ? "all" : "one";
  const document = mode === "document";

  // Only a portfolio's pack still moves with its disciplines.
  const film = params.pack === "film";
  const flavour = flavourForKind(kind, film ? ["film"] : undefined);

  // Everything the export needs to name itself and to say where it came from.
  const trackLabel =
    track === "showcase" ? "Coded / showcase" : "Platform / durable";
  const viewLabel = everyKind
    ? "Every kind — the overview"
    : track === "showcase"
      ? `${labelForKind(kind)}${film ? " · film" : ""}`
      : "The one questionnaire";

  const engagement = previewEngagement(track);
  const catalogue = await loadCatalogue(track);

  return (
    <>
      <AdminPageHeader
        title="Intake questions"
        description="The whole flow in order: what is asked before payment, the deposit and add-ons, then the questionnaire."
        actions={
          <PreviewControls
            track={track}
            kind={kind}
            film={film}
            mode={mode}
            everyKind={everyKind}
          />
        }
      />

      {/* Document mode only: there is nothing to export from a screen of form
          controls, and a button that saved an empty file would be worse than
          no button. */}
      {document ? (
        <div className="mb-6">
          <DownloadMarkdown
            containerId={DOCUMENT_ID}
            filename={markdownFilename({ track, kind, film, everyKind })}
            meta={{
              track: trackLabel,
              view: viewLabel,
              pack: flavour,
            }}
          />
        </div>
      ) : null}

      {/*
        Orientation, not a warning — plain words, no alarm colour, no icon, and
        no way to dismiss it. Someone testing a form should never have to
        reconstruct which mode they are in.
      */}
      <p className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-3 text-sm text-(--color-dim)">
        Preview — nothing here is saved, no engagement is created, and no
        payment can be started. Prices are the real catalogue.
      </p>

      <PreviewModeProvider render={mode} scope={scope}>
        {/* Every band and every step collapses, all of them open on arrival.
            `keepMounted` in document mode is what keeps the export complete
            whatever is collapsed — see `AccordionProvider`. */}
        <AccordionProvider keepMounted={document}>
          <div className="mt-8 flex justify-end">
            <AccordionControls />
          </div>

          {/* The id is what the export reads: the file is this element's own
              rendered HTML, converted, so it cannot disagree with the page. */}
          <div id={DOCUMENT_ID} className="mt-4">
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
              {document ? (
                <NotQuestions />
              ) : catalogue.kind === "missing" ? (
                <SectionUnavailable reason={catalogue.reason} />
              ) : track === "showcase" ? (
                <ShowcasePayGate
                  engagement={engagement}
                  token=""
                  canceled={false}
                  half={catalogue.deposit}
                  full={catalogue.full}
                  addons={catalogue.addons}
                  extraPage={catalogue.extraPage}
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
              {document ? (
                <NotQuestions />
              ) : track === "showcase" ? (
                <ShowcaseWelcome engagement={engagement} token="" />
              ) : (
                <Welcome engagement={engagement} token="" />
              )}
            </FlowSection>

            <FlowSection
              stage="After payment"
              title="The questionnaire"
              note="One screen per step for the client. Stacked here so they read end to end."
            >
              <QuestionStack track={track} flavour={flavour} kind={kind} />

              {/* The other half of "what is unique to a kind": not which
                questions exist, but which are asked in different words. Derived
                from the packs at render, so it cannot drift. */}
              {document && track === "showcase" ? (
                <PackDiffSection flavour={flavour} everyPack={everyKind} />
              ) : null}
            </FlowSection>
          </div>
        </AccordionProvider>
      </PreviewModeProvider>
    </>
  );
}

type Catalogue =
  | {
      kind: "found";
      deposit: Awaited<ReturnType<typeof getCheckoutCatalogue>>["deposit"];
      addons: Awaited<ReturnType<typeof getCheckoutCatalogue>>["addons"];
      extraPage: Awaited<ReturnType<typeof getCheckoutCatalogue>>["extraPage"];
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
    const { deposit, addons, extraPage } = await getCheckoutCatalogue(
      false,
      track,
      "half",
    );
    const full =
      track === "showcase"
        ? await findSellableProductByKey("showcase_full")
        : null;
    return { kind: "found", deposit, addons, extraPage, full };
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

/**
 * The element the Markdown export reads.
 *
 * One constant rather than a string in two files, because a rename in one place
 * would silently produce an empty download rather than an error.
 */
const DOCUMENT_ID = "intake-document";

/**
 * A band that exists in the flow but holds no questions.
 *
 * The pay screen and the welcome screen are real steps a client meets, and
 * dropping them from the document would hide the payment boundary the flow
 * bands exist to show (Taylor's 2026-09-01 amendment). But a document of the
 * *questions* has nothing to say about a screen that asks none, so it says
 * that, and points at the mode that does render it.
 */
function NotQuestions() {
  return (
    <p className="max-w-[68ch] font-body text-[15px] font-light leading-[1.5] text-(--color-dim)">
      A screen, not questions — read it in Interface mode.
    </p>
  );
}
