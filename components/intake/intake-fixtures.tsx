import type { ReactNode } from "react";
import { ShowcaseDone } from "@/app/websites/coded/intake/_components/showcase-done";
import { ShowcasePayGate } from "@/app/websites/coded/intake/_components/showcase-pay-gate";
import { ShowcaseStart } from "@/app/websites/coded/intake/_components/showcase-start";
import { ShowcaseWelcome } from "@/app/websites/coded/intake/_components/showcase-welcome";
import { StepAbout } from "@/app/websites/coded/intake/_components/steps/step-about";
import { StepAudience } from "@/app/websites/coded/intake/_components/steps/step-audience";
import { StepIngest } from "@/app/websites/coded/intake/_components/steps/step-ingest";
import { StepTaste } from "@/app/websites/coded/intake/_components/steps/step-taste";
import { StepWords } from "@/app/websites/coded/intake/_components/steps/step-words";
import { KnownFact } from "@/app/websites/intake/_components/known-fact";
import { LinkUnavailable } from "@/app/websites/intake/_components/link-unavailable";
import { IngestionMarksProvider } from "@/app/websites/intake/_components/machine-filled";
import { PaymentConfirming } from "@/app/websites/intake/_components/payment-confirming";
import { ResumeList } from "@/app/websites/intake/_components/resume-list";
import type { SaveState } from "@/app/websites/intake/_components/save-indicator";
import { StepShell } from "@/app/websites/intake/_components/step-shell";
import { WorkingIndicator } from "@/app/websites/intake/_components/working-indicator";
import type { ExampleSet, ExampleSite } from "@/content/intake-examples";
import { SITE } from "@/lib/config";
import { stepByNumber, stepsFor } from "@/lib/intake/tracks";
import type { AnyIntakeStepKey, IntakeTrackKey } from "@/lib/types/intake";
import type { Engagement } from "@/server/services/engagement";
import type { SellableProduct } from "@/server/services/products";
import { PreviewModeProvider } from "./preview-mode";
import { SaveLineDriver } from "./save-line-driver";

/**
 * The intake's drawn states on synthetic engagements held in memory
 * (D-SITE-218, D-SITE-241). Nothing here reads or writes a database: each
 * engagement is a literal, and every state renders inside
 * `PreviewModeProvider`, so the write paths beneath refuse as they do in the
 * admin preview.
 *
 * Two readers: the admin client preview (`/admin/intake/preview/<key>`) and
 * the test harness (`/test-harness/intake?state=<key>`), which 404s in
 * production. There is no `?state=` on an intake route. SITE-29 and SITE-30
 * add their keys here.
 */

/** A token that matches no engagement; the routes it builds go nowhere real. */
export const SYNTHETIC_TOKEN = "tok_synthetic_site28";

export const INTAKE_STATE_KEYS = [
  "save",
  "resume",
  "confirming",
  "unavailable",
  "unavailable-invalid",
  "working",
  // SITE-29: the coded flow.
  "start",
  "start-resume",
  "invalid",
  "welcome",
  "step",
  "pay",
  "done",
  // SITE-30: the taste gallery, the credits import and the voice step.
  "taste",
  "import",
  "import-reading",
  "import-mark",
  "words",
] as const;

export type IntakeStateKey = (typeof INTAKE_STATE_KEYS)[number];

export function isIntakeStateKey(value: unknown): value is IntakeStateKey {
  return INTAKE_STATE_KEYS.includes(value as IntakeStateKey);
}

/** Every value invented, every date the epoch: built like `previewEngagement`. */
export function syntheticEngagement(
  track: IntakeTrackKey,
  overrides: Partial<Engagement> = {},
): Engagement {
  const epoch = new Date(0);

  return {
    id: "eng_synthetic_site28",
    createdAt: epoch,
    updatedAt: epoch,
    answers: { about: { siteKind: "portfolio" } },
    businessName: "Fixture Studio",
    completedAt: null,
    contactEmail: "fixture@example.invalid",
    contactName: "Sam Fixture",
    contactPhone: null,
    currency: "cad",
    currentStep: 0,
    depositAmountCents: 0,
    depositRequired: true,
    lastActivityAt: epoch,
    paidAt: epoch,
    projectSummary: null,
    sentAt: null,
    startedAt: epoch,
    termsAcceptedAt: epoch,
    termsVersion: null,
    tokenExpiresAt: epoch,
    track,
    status: "created",
    ...overrides,
  };
}

/** The `save` key's step: 4 of 10 on the coded track (C-SITE-intake-coded-11). */
const SAVE_STEP = 4;

/** The working line's messages for the `working` key, invented. */
const WORKING_LINES = [
  "[Fixture: first line]",
  "[Fixture: second line]",
  "[Fixture: third line]",
] as const;

/** A sellable row, invented: nothing here reaches Stripe or the catalogue. */
function product(
  key: string,
  name: string,
  priceCents: number,
  repeatable = false,
): SellableProduct {
  return {
    id: `prod_synthetic_${key}`,
    key,
    name,
    description: "[Fixture: one line on what this adds]",
    priceCents,
    repeatable,
    track: "showcase",
    stripePriceId: `price_synthetic_${key}`,
  };
}

/** One example site, invented, shot with an image already under `public/`. */
function exampleSite(key: string, name: string): ExampleSite {
  return {
    key,
    name,
    url: `https://${key}.invalid`,
    role: "[Fixture: role line]",
    group: "dark-cinematic",
    axes: { ground: "dark", motion: "still", density: "balanced" },
    styles: ["grid", "serif"],
    build: "custom",
    embed: false,
    checkedOn: "2026-10-01",
    captures: [
      {
        src: "/websites/clean-coast/desktop-home.jpg",
        width: 1600,
        height: 1000,
        alt: `[Fixture: ${name} home page]`,
      },
    ],
  };
}

/** The `taste` key's gallery: one group, three sites, in memory. */
const GALLERY: ExampleSet = {
  curated: true,
  sites: [
    exampleSite("fixture-one", "Fixture One"),
    exampleSite("fixture-two", "Fixture Two"),
    exampleSite("fixture-three", "Fixture Three"),
  ],
};

/** A showcase step by key, so a fixture names the step it draws. */
function showcaseStep(key: string) {
  return stepsFor("showcase").find((step) => step.key === key)!;
}

/** The `import-mark` key's filled field and the line it was read from. */
const MARKED_VALUE = "[Fixture: book a call, or email me about a commission]";

/** The `step` key's step: 2 of 10, About you, as drawn. */
const ABOUT_STEP = 2;

/**
 * One state, rendered as the client meets it. `navigate` points a step's Back
 * and Continue somewhere other than the synthetic token's routes, as the admin
 * preview does.
 */
export function IntakeStateView({
  stateKey,
  save = "idle",
  navigate,
}: {
  stateKey: IntakeStateKey;
  /** Where the `save` key's line starts. */
  save?: SaveState;
  navigate?: { step: (stepKey: AnyIntakeStepKey) => string; done: string };
}) {
  return (
    <PreviewModeProvider>{body(stateKey, save, navigate)}</PreviewModeProvider>
  );
}

function body(
  stateKey: IntakeStateKey,
  save: SaveState,
  navigate:
    { step: (stepKey: AnyIntakeStepKey) => string; done: string } | undefined,
): ReactNode {
  switch (stateKey) {
    case "save": {
      const engagement = syntheticEngagement("showcase", {
        currentStep: SAVE_STEP,
      });
      return (
        <StepShell
          track="showcase"
          token={SYNTHETIC_TOKEN}
          step={stepByNumber("showcase", SAVE_STEP)}
          navigate={navigate}
          saveSlot={<SaveLineDriver initial={save} />}
        >
          <KnownFact label="Business" value={engagement.businessName} />
        </StepShell>
      );
    }
    case "resume":
      return (
        <ResumeList
          engagement={syntheticEngagement("showcase", { currentStep: 4 })}
          token={SYNTHETIC_TOKEN}
        />
      );
    case "confirming":
      return <PaymentConfirming supportEmail={SITE.email} />;
    case "unavailable":
      return <LinkUnavailable expired />;
    case "unavailable-invalid":
      return <LinkUnavailable />;
    case "start":
      return <ShowcaseStart inProgress={null} />;
    case "start-resume":
      return (
        <ShowcaseStart
          inProgress={{ token: SYNTHETIC_TOKEN, name: "Sam Fixture" }}
        />
      );
    case "invalid":
      return <ShowcaseStart inProgress={null} invalidEmail="sam@fixture" />;
    case "welcome":
      return (
        <ShowcaseWelcome
          engagement={syntheticEngagement("showcase", { startedAt: null })}
          token={SYNTHETIC_TOKEN}
        />
      );
    case "step":
      return (
        <StepShell
          track="showcase"
          token={SYNTHETIC_TOKEN}
          step={stepByNumber("showcase", ABOUT_STEP)}
          navigate={navigate}
          saveSlot={<SaveLineDriver initial={save} />}
        >
          <StepAbout
            token={SYNTHETIC_TOKEN}
            initial={{}}
            initialKind="portfolio"
            prefill={{
              contactName: "Sam Fixture",
              contactEmail: "fixture@example.invalid",
              contactPhone: null,
            }}
            headshots={[]}
          />
        </StepShell>
      );
    case "pay":
      return (
        <ShowcasePayGate
          engagement={syntheticEngagement("showcase", { paidAt: null })}
          token={SYNTHETIC_TOKEN}
          canceled={false}
          half={product("showcase_half", "[Fixture: half now]", 100000)}
          full={product("showcase_full", "[Fixture: in full]", 200000)}
          addons={[
            product("addon_one", "[Fixture: first add-on]", 30000),
            product("addon_two", "[Fixture: second add-on]", 45000),
          ]}
          extraPage={product(
            "extra_page",
            "[Fixture: extra page]",
            15000,
            true,
          )}
          seoPost={null}
        />
      );
    case "done":
      return (
        <ShowcaseDone
          track="showcase"
          token={SYNTHETIC_TOKEN}
          unanswered={[
            { step: "[Fixture: a step]", labels: ["[Fixture: a question]"] },
            {
              step: "[Fixture: another step]",
              labels: ["[Fixture: another question]"],
            },
          ]}
          shortfall={null}
        />
      );
    case "taste":
      return (
        <StepShell
          track="showcase"
          token={SYNTHETIC_TOKEN}
          step={showcaseStep("taste")}
          navigate={navigate}
          saveSlot={<SaveLineDriver initial={save} />}
        >
          <StepTaste
            token={SYNTHETIC_TOKEN}
            initial={{ picks: [{ siteKey: "fixture-one", score: 4 }] }}
            flavour="generic"
            gallery={GALLERY}
            files={{ inspiration: [] }}
            motion={{ priceCents: null, currency: "cad" }}
            initialOpen={["dark-cinematic"]}
          />
        </StepShell>
      );
    case "import":
    case "import-reading":
      return (
        <StepShell
          track="showcase"
          token={SYNTHETIC_TOKEN}
          step={showcaseStep("ingest")}
          navigate={navigate}
          saveSlot={<SaveLineDriver initial={save} />}
        >
          <StepIngest
            token={SYNTHETIC_TOKEN}
            initial={{ dump: "[Fixture: a pasted bio and credits list]" }}
            flavour="generic"
            files={[]}
            runState={
              stateKey === "import"
                ? { status: "done", filled: 6, failed: ["[fixture.pdf]"] }
                : { status: "running" }
            }
          />
        </StepShell>
      );
    case "import-mark":
      return (
        <StepShell
          track="showcase"
          token={SYNTHETIC_TOKEN}
          step={showcaseStep("audience")}
          navigate={navigate}
          saveSlot={<SaveLineDriver initial={save} />}
        >
          <IngestionMarksProvider
            fields={[
              {
                stepKey: "audience",
                fieldKey: "whatShouldTheyDo",
                value: MARKED_VALUE,
                quote: "[Fixture: the sentence it was read from.]",
                assumed: false,
                source: { name: "[fixture-bio.pdf]", transcribed: false },
              },
            ]}
          >
            <StepAudience
              token={SYNTHETIC_TOKEN}
              initial={{ whatShouldTheyDo: MARKED_VALUE }}
              flavour="generic"
            />
          </IngestionMarksProvider>
        </StepShell>
      );
    case "words":
      return (
        <StepShell
          track="showcase"
          token={SYNTHETIC_TOKEN}
          step={showcaseStep("words")}
          navigate={navigate}
          saveSlot={<SaveLineDriver initial={save} />}
        >
          <StepWords
            token={SYNTHETIC_TOKEN}
            initial={{}}
            flavour="generic"
            files={{ voiceNote: [], writing: [] }}
          />
        </StepShell>
      );
    case "working":
      return (
        <div>
          <h1 className="sr-only">[Fixture: working line]</h1>
          <WorkingIndicator messages={WORKING_LINES} intervalMs={1000} />
        </div>
      );
  }
}
