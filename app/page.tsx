import { HomeHero } from "@/app/_components/HomeHero";
import { NotesSignup } from "@/app/_components/NotesSignup";
import { Pillars } from "@/app/_components/Pillars";
import { ProblemsITakeOn } from "@/app/_components/ProblemsITakeOn";
import { ProofBar } from "@/app/_components/ProofBar";
import { SelectedWork } from "@/app/_components/SelectedWork";
import { NOTES_STATES, notesFixtures } from "@/app/_fixtures";
import RootField from "@/components/field/RootField";
import Testimonials from "@/components/sections/Testimonials";
import { pillars } from "@/content/home";
import { readPageState, type PageSearchParams } from "@/lib/page-state";

/** Home's States (home.md): real content, seeded outside production. */
const STATES = [
  "capabilities-open",
  "capabilities-all",
  "pillar-open",
  "selected-work-websites",
  "selected-work-branding",
  "selected-work-filtered",
  ...NOTES_STATES,
] as const;

/**
 * Home in D-SITE-50's frame: hero, proof bar, pillars, Problems I take on,
 * Selected work, then today's Testimonials in the slot its replacement
 * takes. Each later home ticket swaps one in place.
 */
export default async function Home({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const state = await readPageState(searchParams, STATES);

  return (
    <main
      id="main"
      className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
    >
      {/* The field runs the full page height, not just the hero. */}
      <RootField />
      <HomeHero />
      <ProofBar />
      <Pillars
        items={pillars}
        initialOpen={state === "pillar-open" ? 1 : null}
      />
      <ProblemsITakeOn
        initialOpen={state === "capabilities-open" ? "search-discovery" : null}
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
      {/* Renders nothing when visibleTestimonials() is empty. */}
      <Testimonials />
      <NotesSignup
        seed={
          (NOTES_STATES as readonly string[]).includes(state)
            ? notesFixtures[state as (typeof NOTES_STATES)[number]]
            : undefined
        }
      />
    </main>
  );
}
