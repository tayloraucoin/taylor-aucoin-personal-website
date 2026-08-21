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
 * `/websites` — the local-business website service.
 *
 * NOT LINKED FROM ANYWHERE, AND NOT INDEXED. Taylor's call: until this line
 * earns money, nobody evaluating him for a senior/staff role should stumble
 * into it. Direct URL is the entire distribution model — it is what goes on a
 * business card and in a text after a cold call — so `noindex` costs nothing
 * and a stray search result would cost the thing above. If you add a
 * `sitemap.ts` later, exclude this route by hand.
 *
 * The intake questionnaire nests underneath at `/websites/intake`, so a client
 * who trims the URL back lands here rather than on a 404. Nesting is not
 * linking: the page deliberately does not surface the questionnaire, because
 * the sales motion is call → quote → questionnaire and a self-serve start
 * button next to a $600 deposit invites strangers into a flow built for people
 * Taylor has already spoken to.
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
