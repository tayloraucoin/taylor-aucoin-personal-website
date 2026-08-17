import type { Metadata } from "next";
import RootField from "@/components/field/RootField";
import ClosingCta from "@/components/services/ClosingCta";
import Faq from "@/components/services/Faq";
import HowIWork from "@/components/services/HowIWork";
import HowToStart from "@/components/services/HowToStart";
import OfferCards from "@/components/services/OfferCards";
import ProblemGrid from "@/components/services/ProblemGrid";
import ProofStrip from "@/components/services/ProofStrip";
import ServicesHero from "@/components/services/ServicesHero";
import Footer from "@/components/sections/Footer";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";

const description =
  "Contract senior/staff product engineer and fractional CTO, remote from Vancouver. Fixed-scope 0→1 builds, embedded senior throughput, technical partnership.";

export const metadata: Metadata = {
  title: "Work with me",
  description,
  ...socialCard({
    title: `Work with me — ${SITE.name}`,
    description,
  }),
};

export default function ServicesPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      {/* The field runs the full page height, same as home. */}
      <RootField />
      <ServicesHero />
      <OfferCards />
      <ProblemGrid />
      <HowIWork />
      <HowToStart />
      <ProofStrip />
      <Faq />
      <ClosingCta />
      <Footer />
    </main>
  );
}
