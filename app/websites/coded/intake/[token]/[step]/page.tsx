import { notFound, redirect } from "next/navigation";
import { loadExampleSet } from "@/server/services/example-sites";
import {
  ingestedFor,
  readIngestionRecord,
} from "@/lib/intake/ingestion-record";
import {
  MEDIA_VIDEO_OWNER,
  videoRef,
  videosOf,
} from "@/lib/intake/project-videos";
import {
  findStep,
  flavourFor,
  galleryFlavourFor,
  kindOf,
  nextStep,
  previousStep,
} from "@/lib/intake/tracks";
import { showcaseIntakeRoutes } from "@/lib/routes";
import type {
  PersonEntry,
  ProjectEntry,
  ProjectVideo,
} from "@/lib/validators/showcase-intake";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { proposalsForStep } from "@/server/services/primer-store";
import {
  findSellableProductByKey,
  listPurchasedExtras,
  paidExtraPages,
} from "@/server/services/products";
import { listUploads, readStepAnswers } from "@/server/services/submission";
import type {
  ShortlistFile,
  ShortlistVideo,
} from "../../_components/home-shortlist";
import { StepProposals } from "../../_components/step-proposals";
import { StepAbout } from "../../_components/steps/step-about";
import { StepAccess } from "../../_components/steps/step-access";
import { StepAudience } from "../../_components/steps/step-audience";
import { StepExperience } from "../../_components/steps/step-experience";
import { StepIngest } from "../../_components/steps/step-ingest";
import { StepMedia } from "../../_components/steps/step-media";
import { StepSite } from "../../_components/steps/step-site";
import { StepTaste } from "../../_components/steps/step-taste";
import { StepWords } from "../../_components/steps/step-words";
import { StepWork } from "../../_components/steps/step-work";
import { LinkUnavailable } from "../../../../intake/_components/link-unavailable";
import { RecordStepReached } from "../../../../intake/_components/record-step-reached";
import { IngestionMarksProvider } from "../../../../intake/_components/machine-filled";
import { StepShell } from "../../../../intake/_components/step-shell";
import {
  FooterSaveIndicator,
  SaveStateProvider,
} from "../../../../intake/_lib/save-state";

/**
 * How long one request on this route may run.
 *
 * The ingestion run (PORT-18) fans out into three or four model calls and its
 * tail is minutes, not seconds — a sixty-page paste against the entry stages
 * is the case that sets this. 300 seconds is the ceiling Vercel Pro allows
 * without Fluid compute, and it is valid whether or not Fluid is enabled;
 * with Fluid on, this project may raise it to 800. Every other request on this
 * route finishes in well under a second and is unaffected by a ceiling.
 */
export const maxDuration = 300;

/**
 * One showcase questionnaire step.
 *
 * The engagement resolves before the slug, because which registry a slug
 * belongs to cannot be known without knowing whose questionnaire this is — the
 * same ordering the durable tree uses (PORT-1).
 *
 * The step's intro is resolved for this client's copy pack: a filmmaker reads
 * the film wording, everyone else reads the generic one, and a client who
 * checked two disciplines reads generic rather than a sentence that assumes
 * one of them (D-PORT-5).
 *
 * All ten steps are real.
 */
export default async function ShowcaseIntakeStepPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; step: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token, step: slug } = await params;
  const query = await searchParams;

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

  const flavour = flavourFor(engagement.track, engagement.answers);
  const step = findStep(engagement.track, slug, flavour);
  if (!step) notFound();

  if (engagement.depositRequired && !engagement.paidAt) {
    redirect(showcaseIntakeRoutes.entry(token));
  }

  const initial = readStepAnswers(
    engagement.track,
    engagement.answers,
    step.key,
  );

  // Step 6 writes the client's own name into its person-voice examples, and
  // that name is step 1's. This is a second read of the answers document
  // already in hand, not a second query.
  const about = readStepAnswers(engagement.track, engagement.answers, "about");
  const displayName =
    typeof about.displayName === "string" ? about.displayName : undefined;

  // A studio reads entity copy but may see its discipline's gallery, so the
  // set is resolved separately from the pack (kinds scope §2.1).
  const disciplines = Array.isArray(about.disciplines)
    ? (about.disciplines as string[])
    : undefined;

  // Step 1's roster, which step 3 groups its questions by. Read here rather
  // than by the step, because step 3 may not hold a form over step 1's
  // answers — `saveStepAnswers` replaces a step's object wholesale.
  const people = Array.isArray(about.people)
    ? (about.people as PersonEntry[])
    : [];
  const gallery = await loadExampleSet(galleryFlavourFor(flavour, disciplines));

  // What this engagement's site is for. Step 1 shows it back with a Change
  // link and then derives its own from the form, so this is the starting
  // value — including the legacy derivation for engagements answered before
  // the question existed (M-PORT-21).
  const kind = kindOf(engagement.answers);

  // What the business primer suggested for *this* step, minus anything the
  // client has since answered themselves or waved off. Met here, beside the
  // questions they belong to, never as one wall of suggestions (PORT-10).
  const proposals = proposalsForStep(engagement.answers, step.key, initial);

  // What the ingestion run wrote into *this* step, so each value it filled can
  // say so until the client edits it (M-PORT-33). Null for every engagement
  // that never ran the step, which mounts an empty provider and changes
  // nothing on screen.
  const ingestion = readIngestionRecord(engagement.answers);
  const ingested = ingestedFor(ingestion, step.key);

  // The ingestion step is spent once. It reads everything the client gave us
  // and rewrites most of the form from it, so a second visit can only invite
  // them to paste into a box that will never be read again (Taylor,
  // 2026-09-05). The record is the authority, not the client's history.
  const ingestionDone = step.key === "ingest" && ingestion !== null;
  if (ingestionDone) {
    const after = nextStep(engagement.track, step, flavour);
    if (after) redirect(showcaseIntakeRoutes.step(token, after.key));
  }

  const uploadsFor = (fieldKey: string) => listUploads(engagement.id, fieldKey);

  /**
   * Everything the client has already given us, for step 9's home shortlist.
   *
   * Assembled here rather than in the step, for the reason every cross-step
   * read on this page is: `saveStepAnswers` replaces a step's object wholesale,
   * so a component holding a form over step 9 must never also hold step 5's or
   * step 8's answers. It reads them; it does not own them.
   *
   * Only for step 9 — six upload queries and two answer reads on every other
   * step would be paid for nothing.
   */
  async function homeShortlist(): Promise<{
    videos: ShortlistVideo[];
    files: ShortlistFile[];
  }> {
    const work = readStepAnswers(
      engagement!.track,
      engagement!.answers,
      "work",
    );
    const media = readStepAnswers(
      engagement!.track,
      engagement!.answers,
      "media",
    );

    const projects = Array.isArray(work.projects)
      ? (work.projects as ProjectEntry[])
      : [];

    const videos: ShortlistVideo[] = [];

    projects.forEach((project, index) => {
      const source = project.title?.trim() || `Untitled project ${index + 1}`;
      for (const video of videosOf(project)) {
        videos.push({
          ref: videoRef(project.entryKey, video.entryKey),
          url: video.url,
          what: video.what,
          source,
        });
      }
    });

    for (const video of Array.isArray(media.videos)
      ? (media.videos as ProjectVideo[])
      : []) {
      videos.push({
        ref: videoRef(MEDIA_VIDEO_OWNER, video.entryKey),
        url: video.url,
        what: video.what,
        source: "Media",
      });
    }

    /**
     * The visual uploads, and only those.
     *
     * A logo, a laurel sheet, and a deck are assets the build consumes; they
     * are not candidates for a home page, and offering them as ticks would
     * make the shelf longer and the question vaguer. Taste inspiration is
     * absent for the same reason — it is somebody else's work.
     */
    const SHELVES: Array<[string, string]> = [
      ["portrait", "A photo of you"],
      ["behind_scenes", "Behind the scenes"],
      ["place", "The place"],
      ["project_images", "From a project"],
      ["piece_images", "From a piece"],
      ["brand_assets", "Your own material"],
    ];

    const files: ShortlistFile[] = [];
    for (const [fieldKey, source] of SHELVES) {
      for (const row of await uploadsFor(fieldKey)) {
        files.push({
          id: row.id,
          name: row.originalName ?? "Unnamed file",
          source,
        });
      }
    }

    return { videos, files };
  }

  /**
   * What this client actually bought, in the extras vocabulary.
   *
   * Four steps read it, so it is resolved once here rather than four times in
   * `body()`. Until 2026-09-03 the coded track never read it at all and every
   * add-on went unquestioned — see `PRODUCT_KEY_TO_EXTRA`.
   */
  const purchasedExtras = await listPurchasedExtras(engagement.id);

  async function body() {
    switch (step!.key) {
      case "ingest":
        return (
          <StepIngest
            token={token}
            initial={initial}
            flavour={flavour}
            files={await uploadsFor("ingest_documents")}
            // Present exactly when the step has run, which is what turns it
            // from a form into a record of what was sent.
            record={ingestion}
            // What we made of each attachment and each link (PORT-21). The
            // same rows the drop lists, carrying what was read from them.
            sources={{
              documents: await uploadsFor("ingest_documents"),
              links: await uploadsFor("ingest_links"),
            }}
          />
        );
      case "about":
        return (
          <StepAbout
            token={token}
            initial={initial}
            initialKind={kind}
            prefill={{
              contactName: engagement!.contactName,
              contactEmail: engagement!.contactEmail,
              contactPhone: engagement!.contactPhone,
            }}
            headshots={await uploadsFor("headshot")}
          />
        );
      case "audience":
        return (
          <StepAudience token={token} initial={initial} flavour={flavour} />
        );
      case "experience":
        return (
          <StepExperience
            token={token}
            initial={initial}
            flavour={flavour}
            people={people}
          />
        );
      case "work":
        return (
          <StepWork
            token={token}
            initial={initial}
            flavour={flavour}
            kind={kind}
            // One query for every project image, grouped client-side by the
            // entry each belongs to — rather than one query per project, which
            // on a forty-project catalogue is forty round trips to render one
            // screen.
            projectFiles={await uploadsFor("project_images")}
            pieceFiles={await uploadsFor("piece_images")}
          />
        );
      case "words":
        return (
          <StepWords
            token={token}
            initial={initial}
            flavour={flavour}
            displayName={displayName}
            files={{
              voiceNote: await uploadsFor("voice_note"),
              writing: await uploadsFor("writing"),
            }}
          />
        );
      case "taste": {
        /**
         * The motion add-on's live price, and what Stripe sent them back with.
         *
         * The price is read from the catalogue here rather than in the
         * component, so nothing client-side ever names an amount. `?added` and
         * `?canceled` are presentation only — the bought state itself comes
         * from the settled basket in `purchasedExtras`, because a query string
         * is not evidence that money moved (M-PORT-38).
         */
        const motionProduct =
          await findSellableProductByKey("showcase_animations");
        const returned =
          query.added === "showcase_animations"
            ? ("added" as const)
            : query.canceled === "1"
              ? ("canceled" as const)
              : undefined;

        return (
          <StepTaste
            token={token}
            initial={initial}
            flavour={flavour}
            gallery={gallery}
            files={{ inspiration: await uploadsFor("inspiration") }}
            purchasedExtras={purchasedExtras}
            motion={{
              priceCents: motionProduct?.priceCents ?? null,
              currency: engagement!.currency,
              returned,
            }}
          />
        );
      }
      case "media":
        return (
          <StepMedia
            token={token}
            initial={initial}
            flavour={flavour}
            kind={kind}
            files={{
              portrait: await uploadsFor("portrait"),
              behindScenes: await uploadsFor("behind_scenes"),
              laurels: await uploadsFor("laurels"),
              logo: await uploadsFor("logo"),
              brandAssets: await uploadsFor("brand_assets"),
              place: await uploadsFor("place"),
              documents: await uploadsFor("documents"),
            }}
            purchasedExtras={purchasedExtras}
          />
        );
      case "access":
        return (
          <StepAccess
            token={token}
            initial={initial}
            flavour={flavour}
            kind={kind}
            purchasedExtras={purchasedExtras}
          />
        );
      case "site": {
        const shortlist = await homeShortlist();

        return (
          <StepSite
            token={token}
            initial={initial}
            flavour={flavour}
            kind={kind}
            homeVideos={shortlist.videos}
            homeFiles={shortlist.files}
            // What they bought on the pay screen, so the page allowance and
            // the "what are they for" question both reflect the real deal
            // rather than the default five.
            paidExtraPages={await paidExtraPages(
              engagement!.id,
              engagement!.track,
            )}
            purchasedExtras={purchasedExtras}
          />
        );
      }
      default:
        return null;
    }
  }

  return (
    <SaveStateProvider>
      <RecordStepReached token={token} stepNumber={step.number} />

      <StepShell
        track={engagement.track}
        token={token}
        step={step}
        flavour={flavour}
        // Back off the step after ingestion, once ingestion is spent: the
        // redirect above would bounce them straight here, and a control that
        // returns you where you stood reads as broken.
        previousLocked={
          ingestion !== null &&
          previousStep(engagement.track, step, flavour)?.key === "ingest"
        }
        saveSlot={<FooterSaveIndicator />}
      >
        <StepProposals token={token} proposals={proposals} />

        <IngestionMarksProvider fields={ingested}>
          {await body()}
        </IngestionMarksProvider>
      </StepShell>
    </SaveStateProvider>
  );
}
