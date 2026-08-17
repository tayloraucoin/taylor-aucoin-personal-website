import type { Metadata } from "next";
import CapabilityGrid from "@/components/capabilities/CapabilityGrid";
import RootField from "@/components/field/RootField";
import Footer from "@/components/sections/Footer";
import ClosingCta from "@/components/services/ClosingCta";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";

const description =
  "Problems I comfortably take on — payments, AI features, design, data pipelines, realtime voice, consolidation — with the approach and the work behind each.";

export const metadata: Metadata = {
  title: "Capabilities",
  description,
  ...socialCard({
    title: `Capabilities — ${SITE.name}`,
    description,
  }),
};

export default function CapabilitiesPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      {/* The field runs the full page height, same as home. */}
      <RootField />

      <div className="mb-6 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>{SITE.location} · What I take on</span>
        <span
          aria-hidden
          className="h-px max-w-[220px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
          }}
        />
      </div>

      <h1 className="mb-8 font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-.03em] text-(--color-ink)">
        Capabilities
      </h1>

      <CapabilityGrid />
      <ClosingCta />
      <Footer />
    </main>
  );
}
