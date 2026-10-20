import type { Metadata } from "next";
import { Changes } from "@/app/websites/_components/Changes";
import { CodedClose } from "@/app/websites/_components/CodedClose";
import { CodedHero } from "@/app/websites/_components/CodedHero";
import { FaqList } from "@/app/websites/_components/FaqList";
import { LabelList } from "@/app/websites/_components/LabelList";
import { Ownership } from "@/app/websites/_components/Ownership";
import { PriceLedger } from "@/app/websites/_components/PriceLedger";
import { ProcessSteps } from "@/app/websites/_components/ProcessSteps";
import { Section } from "@/app/websites/_components/Section";
import { SitesBuilt } from "@/app/websites/_components/SitesBuilt";
import {
  deliverables,
  description,
  hero,
  upFront,
} from "@/content/websites-coded";
import { socialCard } from "@/lib/metadata";

/**
 * `/websites`: bespoke sites in real code, for people whose work is the thing
 * that sells them (D-SITE-111). The order is the brief's: ownership, then
 * price and time, then the sites built, then changes, the rest and the close
 * (websites-coded-build.md).
 *
 * Every section is this page's own, in `_components/`: the components it
 * shared with `/websites/platform` stay as they were so that page renders
 * byte for byte as before (D-SITE-209, its golden file).
 *
 * NOT INDEXED. Until this line earns money, nobody evaluating Taylor for a
 * senior/staff role should stumble into it. The social card still matters:
 * this URL is DMed to a creative, and the unfurl is the first impression
 * (D-SITE-214).
 *
 * `default` is the only state: the page ships with one example row, so
 * `one-example` is `default` (D-SITE-115, 211).
 */
export const metadata: Metadata = {
  title: hero.title,
  description,
  robots: { index: false, follow: false },
  ...socialCard({ title: hero.title, description }),
};

export default function WebsitesPage() {
  return (
    <main
      id="main"
      className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
    >
      <CodedHero />
      <Ownership />
      <PriceLedger />
      <SitesBuilt />
      <Changes />
      <Section id="what-you-get" heading="What you get">
        <LabelList rows={deliverables} />
      </Section>
      <ProcessSteps />
      <Section id="up-front" heading="Worth saying up front">
        <LabelList rows={upFront} />
      </Section>
      <FaqList />
      <CodedClose />
    </main>
  );
}
