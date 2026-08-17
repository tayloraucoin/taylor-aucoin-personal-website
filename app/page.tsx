import RootField from "@/components/field/RootField";
import BioRow from "@/components/sections/BioRow";
import Capabilities from "@/components/sections/Capabilities";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import Signal from "@/components/sections/Signal";
import Specialties from "@/components/sections/Specialties";
import Testimonials from "@/components/sections/Testimonials";
import { PHOTO } from "@/lib/config";

export default function Home() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-16">
      {/* The field runs the full page height, not just the hero. */}
      <RootField />
      <Hero />
      <Capabilities />
      <Specialties />
      {/* Renders nothing until quotes are approved (or in dev). */}
      <Testimonials />
      <SelectedWork />
      <Signal />
      {/* HOME-04 — the bio row joins once the photo exists (PRE-04). */}
      {PHOTO && <BioRow />}
      <Footer />
    </main>
  );
}
