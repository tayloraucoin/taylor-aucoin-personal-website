import type { Metadata } from "next";
import RootField from "@/components/field/RootField";
import Footer from "@/components/sections/Footer";
import Faq from "@/components/ui/Faq";
import LabelRows from "@/components/ui/LabelRows";
import SectionLabel from "@/components/ui/SectionLabel";
import Changes from "@/components/websites/Changes";
import Pricing from "@/components/websites/Pricing";
import Process from "@/components/websites/Process";
import StartCta from "@/components/websites/StartCta";
import WebsitesClose from "@/components/websites/WebsitesClose";
import WebsitesHero from "@/components/websites/WebsitesHero";
import CodedCase from "@/components/websites/coded/CodedCase";
import Ownership from "@/components/websites/coded/Ownership";
import {
  addOns,
  changesClosing,
  closing,
  ctaLabel,
  deliverables,
  faq,
  hero,
  heroNote,
  heroStats,
  pricing,
  processSteps,
  startHref,
  upFront,
} from "@/content/websites-coded";
import { codedCase } from "@/content/websites-coded-case";
import { BOOKING_URL } from "@/lib/config";
import { socialCard } from "@/lib/metadata";

/**
 * `/websites/coded` — bespoke sites in real code, for people whose work is the
 * thing that sells them.
 *
 * THE CENTRAL DESIGN FACT: on the platform page, the system is the proof — a
 * tradesperson reads "brand extraction → primer → verification" and hears
 * competence. Here, the page's own craft is the proof. A filmmaker deciding
 * whether Taylor can make something beautiful is judging the page they are
 * standing on. That raises the stakes on restraint rather than on ornament. The
 * gradient budget is unchanged from the platform page and is not an invitation:
 * one ring, on the price card, and nothing else.
 *
 * Sibling of `/websites/platform` by construction. Every section here is the
 * same component that page uses, passed this track's content — one hero, one
 * process list, one price card, one changes block. Forking any of them would
 * cost the thing the two pages most need, which is reading as one person's work.
 *
 * WHAT DIFFERS FROM THE PLATFORM PAGE, and why:
 *
 *   Ownership is a section rather than a paragraph beside the price. On this
 *   track "you keep everything" is literal, and it is the single answer to both
 *   anchors this buyer arrives holding ($20/month templates, $5,000 agencies).
 *
 *   Taste extraction (step 02) carries the depth the platform page spends on
 *   its build step. It is where this buyer decides whether a system exists.
 *
 *   The stack is named. Platform-name-last is the other track's law, protecting
 *   a sales motion that closes on a call. Here the tooling is part of what gets
 *   handed over, so hiding it would be hiding the deliverable.
 *
 *   No AI-employees section. The guide to editing the site is that story here.
 *
 * NOT INDEXED, and linked only from the chooser at `/websites`. Same reasoning
 * as its sibling: until this line earns money, nobody evaluating Taylor for a
 * senior/staff role should stumble into it.
 *
 * CTAs point at the real questionnaire (`showcaseIntakeRoutes.start`, built in
 * a parallel thread) as of 2026-08-26, matching the platform page's law:
 * starting is primary, booking a call is the ghost. Every CTA briefly pointed
 * at a call instead, while the intake did not yet exist — see
 * `content/websites-coded.ts`'s `startHref`/`ctaLabel` comment for that history.
 *
 * Full rationale: docs/websites/CODED-PAGE-SPEC.md
 */
const description =
  "Portfolio sites for creative work, built in code you own. $2,000 flat, first look in three days, and hosting that costs nothing to run.";

/**
 * The social card matters more on this track than on any other page of the
 * site. This URL is distributed by Taylor DMing it to a creative, so the unfurl
 * in that DM is the entire first impression, arriving before the page does.
 * `noindex` does not suppress it: Slack, iMessage, and WhatsApp fetch Open
 * Graph regardless. Inheriting the root layout's card would introduce Taylor to
 * a filmmaker as a senior/staff product engineer seeking employment, which
 * sells the wrong thing and exposes the job search to a client.
 */
export const metadata: Metadata = {
  title: "Websites for creative work",
  description,
  robots: { index: false, follow: false },
  ...socialCard({ title: "Websites for creative work", description }),
};

export default function CodedWebsitesPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      <RootField />

      <WebsitesHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        sub={hero.sub}
        stats={heroStats}
        ctaHref={startHref}
        ctaLabel={ctaLabel}
        secondary={{ href: BOOKING_URL, label: "Book a call first" }}
        note={heroNote}
        caseLink={
          codedCase.published
            ? { href: "#case-study", label: `${codedCase.client} →` }
            : null
        }
      />

      {/* Composed inline rather than through the platform page's `Deliverables`
          wrapper, which exists only to bind that track's content to these two
          elements. Reaching through a wrapper to pass content past it would add
          a seam for nothing. */}
      <section className="mt-16">
        <SectionLabel>What you get</SectionLabel>
        <div className="mt-2">
          <LabelRows rows={deliverables} />
        </div>
      </section>

      <Process steps={processSteps} />

      <Ownership />

      <CodedCase />

      {/* ownership={null} — it is a section above rather than a column here. */}
      <Pricing pricing={pricing} addOns={addOns} ownership={null} />

      <StartCta
        href={startHref}
        label={ctaLabel}
        line="That's the whole offer. Starting takes a few details, then you choose how to pay, and you can stop and come back whenever you like."
      />

      <Changes closing={changesClosing} />

      <section className="mt-16">
        <SectionLabel>Worth saying up front</SectionLabel>
        <div className="mt-2">
          <LabelRows rows={upFront} />
        </div>
      </section>

      <section className="mt-16">
        <SectionLabel>Questions</SectionLabel>
        <Faq items={faq} />
      </section>

      <WebsitesClose
        line={closing.line}
        entity={closing.entity}
        ctaHref={startHref}
        ctaLabel={ctaLabel}
        secondary={{ href: BOOKING_URL, label: "Book a call first" }}
      />

      <Footer />
    </main>
  );
}
