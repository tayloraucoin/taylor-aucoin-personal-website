import type { Metadata } from "next";
import { PageClose } from "@/components/site/PageClose";
import { closingLine } from "@/content/about";
import { availability } from "@/content/services";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";
import { readPageState, type PageSearchParams } from "@/lib/page-state";
import { AboutIntro } from "./_components/AboutIntro";
import { AboutTestimonials } from "./_components/AboutTestimonials";
import { AnchorFocus } from "./_components/AnchorFocus";
import { Education } from "./_components/Education";
import { Experience } from "./_components/Experience";
import { HowIThink } from "./_components/HowIThink";
import { OffTheClock } from "./_components/OffTheClock";
import { Teaching } from "./_components/Teaching";
import { Tools } from "./_components/Tools";
import { ABOUT_STATES } from "./_fixtures";

const description =
  "Systems designer from a bio-med background. Thirteen products from zero to one, fourteen BCIT cohorts mentored, based in Vancouver. The person behind the work.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...socialCard({
    title: `About — ${SITE.name}`,
    description,
  }),
};

/**
 * About in about.md's order: Intro, How I think, Experience, Teaching,
 * Education, Tools, Testimonials, Off the clock, then the close. The
 * pending-testimonial state shows the synthetic card outside production only.
 */
export default async function AboutPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const state = await readPageState(searchParams, ABOUT_STATES);

  return (
    <>
      <main
        id="main"
        className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
      >
        <AnchorFocus />
        <AboutIntro />
        <HowIThink />
        <Experience />
        <Teaching />
        <Education />
        <Tools />
        <AboutTestimonials pending={state === "pending-testimonial"} />
        <OffTheClock />
      </main>
      <PageClose
        line={closingLine}
        availability={availability}
        surface="about"
        resume
      />
    </>
  );
}
