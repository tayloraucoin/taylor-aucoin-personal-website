import { HomeHero } from "@/app/_components/HomeHero";
import { ProofBar } from "@/app/_components/ProofBar";
import RootField from "@/components/field/RootField";
import Capabilities from "@/components/sections/Capabilities";
import SelectedWork from "@/components/sections/SelectedWork";
import Specialties from "@/components/sections/Specialties";
import Testimonials from "@/components/sections/Testimonials";

/**
 * Home in D-SITE-50's frame: hero, proof bar, then today's sections in the
 * slots their replacements take (pillars, Problems I take on, Selected work,
 * Testimonials). Each later home ticket swaps one in place.
 */
export default function Home() {
  return (
    <main
      id="main"
      className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
    >
      {/* The field runs the full page height, not just the hero. */}
      <RootField />
      <HomeHero />
      <ProofBar />
      <Capabilities />
      <Specialties />
      <SelectedWork />
      {/* Renders nothing when visibleTestimonials() is empty. */}
      <Testimonials />
    </main>
  );
}
