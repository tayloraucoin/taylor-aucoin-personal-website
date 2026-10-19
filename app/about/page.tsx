import type { Metadata } from "next";
import { PageClose } from "@/components/site/PageClose";
import { closingLine, offTheClock } from "@/content/about";
import { availability } from "@/content/services";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";
import { AboutIntro } from "./_components/AboutIntro";
import { Education } from "./_components/Education";
import { Experience } from "./_components/Experience";
import { HowIThink } from "./_components/HowIThink";
import { SectionHeading } from "./_components/Row";
import { Teaching } from "./_components/Teaching";

const description =
  "Systems designer from a bio-med background. Twelve products from zero to one, fourteen BCIT cohorts mentored, based in Vancouver. The person behind the work.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...socialCard({
    title: `About — ${SITE.name}`,
    description,
  }),
};

/**
 * SITE-17: the story, in about.md's order: Intro, How I think, Experience,
 * Teaching, Education. Off the clock and the close stay as they were until
 * SITE-18 lands Tools, Testimonials and the new close.
 */
export default function AboutPage() {
  return (
    <>
      <main
        id="main"
        className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
      >
        <AboutIntro />
        <HowIThink />
        <Experience />
        <Teaching />
        <Education />
        <section aria-labelledby="off-heading" className="mt-16 md:mt-24">
          <SectionHeading id="off-heading">Off the clock</SectionHeading>
          <div className="mt-8 max-w-[640px] space-y-5">
            {offTheClock.map((para, i) => (
              <p
                key={i}
                className="text-(length:--text-body) leading-[1.6] text-(--color-body)"
              >
                {para}
              </p>
            ))}
          </div>
        </section>
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
