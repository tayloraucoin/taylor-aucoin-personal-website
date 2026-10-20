import { HomeHero } from "@/app/_components/HomeHero";
import { HomeTestimonials } from "@/app/_components/HomeTestimonials";
import { HowIWork } from "@/app/_components/HowIWork";
// Notes signup is off on home for now (feedback round 2): see below.
// import { NotesSignup } from "@/app/_components/NotesSignup";
import { Pillars } from "@/app/_components/Pillars";
import { ProblemsITakeOn } from "@/app/_components/ProblemsITakeOn";
import { ProofBar } from "@/app/_components/ProofBar";
import { SelectedWork } from "@/app/_components/SelectedWork";
import { WorkWithMe } from "@/app/_components/WorkWithMe";
import { PageClose } from "@/components/site/PageClose";
// import { NOTES_STATES, notesFixtures } from "@/app/_fixtures";
import { pillars } from "@/content/home";
import { availability, closing } from "@/content/services";
import { readPageState, type PageSearchParams } from "@/lib/page-state";

/** Home's States (home.md): real content, seeded outside production. */
const STATES = [
  "capabilities-open",
  "capabilities-all",
  "pillar-open",
  "selected-work-websites",
  "selected-work-branding",
  "selected-work-filtered",
  // ...NOTES_STATES, back with the notes signup below.
] as const;

/**
 * Home in D-SITE-50's order: hero, proof bar, pillars, Problems I take on,
 * Selected work, How I work, Testimonials, Work with me, then the PageClose
 * with the résumé (feedback round 2; Notes is off for now). The header and
 * footer come from the layout. No root field: the ground's glow only.
 */
export default async function Home({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const state = await readPageState(searchParams, STATES);

  return (
    <>
      <main
        id="main"
        className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
      >
        <HomeHero />
        <ProofBar />
        <Pillars
          items={pillars}
          initialOpen={state === "pillar-open" ? 1 : null}
        />
        <ProblemsITakeOn
          initialOpen={
            state === "capabilities-open" ? "search-discovery" : null
          }
          initialAll={state === "capabilities-all"}
        />
        <SelectedWork
          initialTab={
            state === "selected-work-websites"
              ? "websites"
              : state === "selected-work-branding"
                ? "branding"
                : undefined
          }
          initialChip={
            state === "selected-work-filtered" ? "full-time" : undefined
          }
        />
        <HowIWork />
        <HomeTestimonials />
        <WorkWithMe />
        {/*
        The notes signup is commented out on home until Taylor sets the
        newsletter up (feedback round 2:
        specs/web/epics/SITE-public-site-redesign/feedback/2026-10-19-round-2/feedback.md).
        The component, its action and the note_signups migration stay; to bring
        it back, restore this block, the two imports and NOTES_STATES above.

      <NotesSignup
        seed={
          (NOTES_STATES as readonly string[]).includes(state)
            ? notesFixtures[state as (typeof NOTES_STATES)[number]]
            : undefined
        }
      />
      */}
      </main>
      <PageClose
        line={closing}
        availability={availability}
        surface="home"
        resume
      />
    </>
  );
}
