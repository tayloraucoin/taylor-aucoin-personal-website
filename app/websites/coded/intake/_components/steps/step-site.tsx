"use client";

import { useEffect } from "react";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor } from "@/lib/intake/tracks";
import { INCLUDED_PAGES } from "@/lib/validators/showcase-intake";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import { Reveal } from "../../../../intake/_components/reveal";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ForKinds, hasGroup } from "../for-kinds";
import {
  HomeShortlist,
  type ShortlistFile,
  type ShortlistVideo,
} from "../home-shortlist";
import { UpsellQuestions } from "../upsell-block";
import { CustomPages } from "../custom-pages";

const HOW_TO_REACH = [
  { value: "email", label: "An email link — no form" },
  { value: "form", label: "A short form" },
  { value: "both", label: "Both" },
  { value: "rep", label: "Through my rep" },
] as const;


/**
 * The page every site has.
 *
 * Locked in the checklist rather than removed from it: a client should still
 * see Home in the sitemap they are reading, and dropping it from the list to
 * stop it being unticked would make the list disagree with the site.
 */
const ALWAYS_PAGE = "home";
const LOCKED_PAGES = [ALWAYS_PAGE] as const;

/**
 * Whether a form built somewhere else has to live on the site.
 *
 * Separate from "How should people reach you?" on purpose: that question is
 * about the contact route, and this one is about a form that already exists
 * and already collects into something — an application on Typeform, an
 * intake on Jotform, a waiver, a registration. Answering "a short form" above
 * does not tell us there is a Google Form whose responses feed a spreadsheet
 * somebody's whole operation runs on (Taylor, 2026-09-03).
 *
 * [COPY — pending Taylor] — every string in this block.
 */
const EMBED_FORM = [
  {
    value: "yes",
    label: "Yes — there's a form that needs to live on the site",
  },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure yet" },
] as const;

function asList(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

const AVAILABILITY = [
  { value: "yes", label: "Yes — show availability" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

/**
 * Step 8 — The site itself.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 8,
 * verbatim.
 *
 * The pages note is the delicate part. It is **information, not a warning and
 * not a quote**: dim body copy, never gold, no arithmetic, no total, no price
 * attached to the count — and that holds for the running `n/allowance` PORT-19
 * added, which is the same fact shown before it matters rather than sprung at
 * the moment it does. The copy promises that nothing extra is charged without a
 * conversation first, and a screen that quietly totalled up $150s while someone
 * ticked boxes would be having that conversation with itself.
 *
 * The home block is the other thing this step carries since PORT-19. It
 * replaced the reel question on step 5; see `HomeShortlist` for why it is here
 * and what it does not promise.
 *
 * Nothing on this step can charge anything. That is structural, not
 * disciplinary — there is no payment code on this surface at all, and the
 * extra-page path is Taylor-initiated only (M-PORT-4).
 */
export function StepSite({
  token,
  initial,
  flavour,
  kind,
  paidExtraPages = 0,
  purchasedExtras = [],
  homeVideos = [],
  homeFiles = [],
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  kind: ShowcaseKind;
  /**
   * Everything the client has already given us, offered back for the home
   * page (PORT-19).
   *
   * Assembled by the step page from step 5's projects, step 8's videos, and
   * the upload rows — never read here. This step holds a form over its own
   * answers only: `saveStepAnswers` replaces a step's object wholesale, so a
   * component that reached into another step's would be one blur away from
   * erasing it. Empty in a preview, which has no engagement to read.
   */
  homeVideos?: readonly ShortlistVideo[];
  homeFiles?: readonly ShortlistFile[];
  /**
   * Pages this client already paid for on the pay screen, beyond the included
   * five. Zero for almost everyone, and zero is also what a preview shows.
   */
  paidExtraPages?: number;
  /**
   * What this engagement paid for on the pay screen, in the extras vocabulary.
   *
   * Empty in a preview, which buys nothing — the review surface reaches these
   * blocks through document mode instead, where `Reveal` renders every branch
   * under a line naming what opens it.
   */
  purchasedExtras?: readonly string[];
}) {
  const pack = copyPackFor(flavour);

  const form = useStepAutosave({ token, stepKey: "site", initial });
  useReportSaveState(form.state, form.retry);

  const pages = Array.isArray(form.values.pages)
    ? (form.values.pages as string[])
    : [];

  const customPages = Array.isArray(form.values.pagesCustom)
    ? (form.values.pagesCustom as string[])
    : [];

  /**
   * Home is on, always, and the stored answer says so.
   *
   * `locked` on the group governs the rendering and refuses the toggle; this is
   * what puts the value in the answers document, so Taylor's read of the
   * sitemap does not depend on a client having left a tick alone. Runs once on
   * arrival and then only if something removed it.
   */
  useEffect(() => {
    if (!pages.includes(ALWAYS_PAGE)) {
      form.setValue("pages", [ALWAYS_PAGE, ...pages]);
    }
    // `form.setValue` is stable for the life of the step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  /**
   * What this client has actually bought: the five included, plus whatever
   * they added at checkout.
   *
   * The checklist is *not* capped at it. A client who genuinely needs a
   * seventh page has to be able to say so, and a checkbox that refuses the
   * tick makes the one thing we most want to hear unsayable — the note under
   * the group is the honest control, and it says how far over they are and
   * that the conversation comes before the charge (Taylor, 2026-09-03).
   */
  const allowance = INCLUDED_PAGES + paidExtraPages;

  // A typed page counts. It was the point of making them rows rather than a
  // sentence in a box, and a total that ignored them would understate the
  // sitemap the client just described.
  const named = customPages.filter((page) => page.trim().length > 0).length;
  const total = pages.length + named;
  const over = total > allowance;

  return (
    <>
      {/* The count is always shown, not only once they are over it (Taylor,
          2026-09-03). A checklist whose limit only announces itself at the
          moment you exceed it is a limit sprung on someone; a running `n/5`
          is the same fact, available before it matters.

          The standing line under it is the other half of Taylor's note: what
          gets ticked here is input, not instruction. We read every answer on
          this form and then decide what pages the site actually wants — and
          saying that up front is what makes it fair to say it later.
          [COPY — pending Taylor] */}
      <ChoiceAnswer
        form={form}
        name="pages"
        label="Pages you're imagining"
        help="Check what feels right — we'll push back if something's missing or unnecessary, and flag it before anything goes past what's included."
        options={pack.pages}
        multiple
        locked={LOCKED_PAGES}
        note={
          <>
            <span className="text-(--color-dim)">
              {total}/{allowance} pages
              {paidExtraPages > 0
                ? ` (${INCLUDED_PAGES} included, ${paidExtraPages} you added at checkout)`
                : " included"}
              {over
                ? ". Nothing extra gets charged without a conversation first."
                : "."}
            </span>
            <span className="mt-1.5 block text-(--color-dim)">
              We take this as input rather than instruction. If a different set
              of pages serves you better, we&apos;ll say so — having read
              everything you&apos;ve told us, not just this list.
            </span>
          </>
        }
      />

      {/* Was "Something else?", one text box. See `CustomPages` for why a typed
          page is now a row that counts. */}
      <Field
        id="f-pagesCustom"
        label="Any other pages"
        // [COPY — pending Taylor]
        help="Anything the list above doesn't cover. Each one you add counts toward the total."
      >
        <CustomPages
          pages={customPages}
          onChange={(next) => form.setValue("pagesCustom", next)}
          onBlur={form.flush}
        />
      </Field>

      {/* Only for someone who already bought pages. Asking everyone else what
          their extra pages are for is asking about something they do not
          have. [COPY — pending Taylor] */}
      {paidExtraPages > 0 ? (
        <LongAnswer
          form={form}
          name="extraPagesPlan"
          label={`What the ${paidExtraPages} extra ${paidExtraPages === 1 ? "page is" : "pages are"} for`}
          help="You paid for these at checkout — tell us what each one does. A page per service, a page per project type, a manifesto, a page for one specific audience: whatever you had in mind when you added them."
        />
      ) : null}

      {/* The home page, asked here rather than as a reel question on step 5.

          The braindump comes first and the shortlist second, deliberately: the
          sentence someone writes cold is better than the one they write after
          scrolling their own back catalogue, and the shelves below are a
          reminder of what they have rather than a menu that decides for them.
          [COPY — pending Taylor] */}
      <LongAnswer
        form={form}
        name="homeBrainDump"
        label="What should be on the home page?"
        help="However it comes out. The one thing someone should hit first, what has to be above the fold, what you want them feeling ten seconds in — and anything that must not be there."
      />

      <Field
        id="f-homeShortlist"
        label="Anything from what you've given us that belongs there"
        help="A shortlist, not a running order. We'll design the home page from everything on this form — this is you pointing at the pieces worth considering first."
      >
        <HomeShortlist
          videos={homeVideos}
          files={homeFiles}
          chosenVideos={asList(form.values.homeVideos)}
          chosenFiles={asList(form.values.homeMedia)}
          onVideos={(next) => {
            form.setValue("homeVideos", next);
            form.flush();
          }}
          onFiles={(next) => {
            form.setValue("homeMedia", next);
            form.flush();
          }}
        />
      </Field>

      <LongAnswer
        form={form}
        name="howSeparate"
        label="If you do more than one thing, how separate should they be?"
        help={pack.howSeparateHelp}
      />

      {/* The same question with two option sets, not two questions. Both are
          rendered in the overview so the extra ways in are visible as
          kind-specific rather than missing. */}
      <ForKinds
        kind={kind}
        test={hasGroup("ask")}
        otherwise={
          <HowToReach form={form} pack={pack} options={HOW_TO_REACH} />
        }
      >
        <HowToReach
          form={form}
          pack={pack}
          options={[...HOW_TO_REACH, ...pack.reachExtraOptions]}
        />
      </ForKinds>

      <ChoiceAnswer
        form={form}
        name="embedForm"
        label="Do you need a form embedded?"
        help="Something already built elsewhere — Typeform, Google Forms, Jotform, a booking widget, a waiver — that has to sit on a page of the site."
        options={EMBED_FORM}
      />

      <Reveal
        values={form.values}
        dependsOn={{ field: "embedForm", equals: "yes" }}
      >
        <>
          <TextAnswer
            form={form}
            name="embedFormLink"
            label="The link"
            help="Paste the form's own address, or its embed code if you have it."
            placeholder="https://…"
          />

          <LongAnswer
            form={form}
            name="embedFormNotes"
            label="Where it goes, and what it's for"
            help="Which page it belongs on, who fills it in, where the answers land now, and anything that has to keep working exactly as it does today."
          />
        </>
      </Reveal>

      <ChoiceAnswer
        form={form}
        name="showAvailability"
        label={pack.availability.label}
        help={pack.availability.help}
        options={AVAILABILITY}
      />

      {/* "Yes" on its own does not say what the line should read, and "not
          sure" is usually not-sure about the wording rather than the idea. So
          the follow-up opens on both (Taylor, 2026-09-03) and asks for the two
          things that make it buildable: the sentence, and when it expires.
          [COPY — pending Taylor] */}
      <Reveal
        values={form.values}
        dependsOn={{ field: "showAvailability", in: ["yes", "unsure"] }}
      >
        <TextAnswer
          form={form}
          name="availabilityDetail"
          label="What should it say?"
          help={`"Booking for fall 2026", "Taking two projects this quarter", "Currently on a feature until March" — and tell us when it stops being true.`}
        />
      </Reveal>

      {/* Both of these change the *shape* of the site rather than its look,
          which is what this step is for: a database decides what pages can do,
          and a blog is a section with its own rules. */}
      <UpsellQuestions
        form={form}
        extras={purchasedExtras}
        extra="supabase"
        block={pack.upsells.supabase}
      />

      <UpsellQuestions
        form={form}
        extras={purchasedExtras}
        extra="seoBlog"
        block={pack.upsells.seoBlog}
      />

      <LongAnswer
        form={form}
        name="oldSiteSurvives"
        label="Your old site: what must survive?"
        help="Anything on the current site that has to carry over — and anything that should die with it."
      />

      <LongAnswer
        form={form}
        name="linksOutThere"
        label="Links out in the world"
        help="If your site's been up for years, links to it live in old emails, articles, festival pages. We'll redirect the important ones — any addresses you know people still use?"
      />
    </>
  );
}

/**
 * The contact question, which is one question with two option sets.
 *
 * Extracted so the extra ways in (apply, invest, join) can be shown beside the
 * base four in the all-kinds overview without the label and help line existing
 * twice. Copy lives here once; `options` is the only thing that varies.
 */
function HowToReach({
  form,
  pack,
  options,
}: Readonly<{
  form: ReturnType<typeof useStepAutosave>;
  pack: ReturnType<typeof copyPackFor>;
  options: readonly { value: string; label: string }[];
}>) {
  return (
    <ChoiceAnswer
      form={form}
      name="howToReach"
      label="How should people reach you?"
      help={`Forms filter people; a bare email converts. For sites like this we usually recommend the email.${
        pack.reachHelpSuffix ? ` ${pack.reachHelpSuffix}` : ""
      }`}
      options={options}
    />
  );
}
