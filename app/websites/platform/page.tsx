import type { Metadata } from "next";
import RootField from "@/components/field/RootField";
import Footer from "@/components/sections/Footer";
import Faq from "@/components/ui/Faq";
import SectionLabel from "@/components/ui/SectionLabel";
import AiEmployees from "@/components/websites/AiEmployees";
import Changes from "@/components/websites/Changes";
import CleanCoastCase from "@/components/websites/CleanCoastCase";
import Deliverables from "@/components/websites/Deliverables";
import Pricing from "@/components/websites/Pricing";
import Process from "@/components/websites/Process";
import StartCta from "@/components/websites/StartCta";
import UpFront from "@/components/websites/UpFront";
import WebsitesClose from "@/components/websites/WebsitesClose";
import WebsitesHero from "@/components/websites/WebsitesHero";
import { faq } from "@/content/websites";

/**
 * `/websites/platform` — the local-business website service.
 *
 * MOVED HERE FROM `/websites`, which is now the chooser between this track and
 * the coded track. The page's content did not change in the move and must not:
 * it is shipped, revised twice against Taylor's feedback, and scanned. See
 * docs/websites/PORTFOLIO-MARKETING-EXECUTION-SCOPE.md R-2.
 *
 * The slug names the deliverable rather than the buyer. Taylor's ruling: some
 * professions could plausibly buy either track, so what the door has to name is
 * what you get handed at the end. This one is a site on a managed platform,
 * self-serve after handoff.
 *
 * NOT LINKED FROM ANYWHERE EXCEPT THE CHOOSER, AND NOT INDEXED. Taylor's call:
 * until this line earns money, nobody evaluating him for a senior/staff role
 * should stumble into it. A handed-out URL is the entire distribution model, so
 * `noindex` costs nothing and a stray search result would cost the thing above.
 * If you add a `sitemap.ts` later, exclude this route by hand.
 *
 * The intake questionnaire did NOT move with the page. It stays at
 * `/websites/intake` so no live resume link breaks and no cookie scope shifts
 * under a client mid-form. The cost is that trimming that URL back now lands on
 * the chooser instead of here, which is one extra click Taylor has explicitly
 * accepted.
 *
 * Same page furniture as /services — field, width, rhythm, header, footer. It
 * has to read as part of this site rather than a landing page bolted onto it;
 * that is the whole positioning.
 *
 * Full rationale: docs/websites/WEBSITES-PAGE-SPEC.md
 */
const description =
  "Websites for local businesses in Metro Vancouver. $1,200 flat, live in about a week, and you own the domain, the hosting, and the customer list.";

export const metadata: Metadata = {
  title: "Websites for local businesses",
  description,
  robots: { index: false, follow: false },
};

export default function WebsitesPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      <RootField />
      <WebsitesHero />
      <Deliverables />
      <Process />
      <AiEmployees />
      <CleanCoastCase />
      <Pricing />
      <StartCta line="That's the whole offer. Starting takes a few details, and you can stop and come back whenever you like." />
      <Changes />
      <UpFront />
      <section className="mt-16">
        <SectionLabel>Questions</SectionLabel>
        <Faq items={faq} />
      </section>
      <WebsitesClose />
      <Footer />
    </main>
  );
}
