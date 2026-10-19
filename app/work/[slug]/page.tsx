import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageClose } from "@/components/site/PageClose";
import { CaseStudyTestimonial } from "@/components/testimonials/CaseStudyTestimonial";
import { closingLine } from "@/content/about";
import { availability } from "@/content/services";
import { visibleTestimonials } from "@/content/testimonials";
import { publishedWork } from "@/content/work";
import { socialCard } from "@/lib/metadata";
import { readPageState, type PageSearchParams } from "@/lib/page-state";
import { siteRoutes } from "@/lib/routes";
import { resolveStudy } from "@/lib/work/resolve";
import { AtAGlance } from "./_components/AtAGlance";
import { Block } from "./_components/blocks";
import { Opening } from "./_components/Opening";
import {
  Brief,
  DecisionRows,
  Outcome,
  ProcessRows,
  WhatBroke,
} from "./_components/Sections";
import { WhatIBuilt } from "./_components/WhatIBuilt";
import { WhereAiSat } from "./_components/WhereAiSat";
import { applyCaseState, CASE_STATES } from "./_fixtures";

export function generateStaticParams() {
  return publishedWork.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = resolveStudy(slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.metaDescription,
    ...socialCard({
      title: `${c.title} — ${c.roleLabel}`,
      description: c.metaDescription,
      type: "article",
    }),
  };
}

/**
 * A case study in D-SITE-79's order (SITE-15). Each optional block renders
 * nothing when it is absent, so none leaves a heading, rule or gap (D-SITE-5).
 * Escape does nothing here: `PageDismiss` retired (D-SITE-195).
 */
export default async function CaseStudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: PageSearchParams;
}) {
  const { slug } = await params;
  const resolved = resolveStudy(slug);
  if (!resolved) notFound();
  const state = await readPageState(searchParams, CASE_STATES);
  const { study: c, testimonial: showTestimonial } = applyCaseState(
    resolved,
    state,
  );

  const testimonial = showTestimonial
    ? visibleTestimonials().find(
        (t) =>
          t.project?.href === siteRoutes.caseStudy(c.slug) && t.caseStudySpan,
      )
    : undefined;

  return (
    <main id="main" className="relative">
      <div className="mx-auto w-full max-w-[1192px] px-[22px] pt-8 pb-12 md:px-14 md:pt-12 md:pb-24">
        <Opening c={c} />
        <AtAGlance c={c} />
        <Brief brief={c.brief} />
        <WhatIBuilt c={c} />
        <ProcessRows process={c.process} />
        <DecisionRows decisions={c.decisions} />
        <WhatBroke broke={c.broke} />
        <Outcome c={c} />
        <WhereAiSat aiSat={c.aiSat} />
        {testimonial?.caseStudySpan && (
          <Block title="Testimonial">
            <CaseStudyTestimonial
              t={testimonial}
              span={testimonial.caseStudySpan}
            />
          </Block>
        )}
      </div>
      <PageClose
        line={closingLine}
        availability={availability}
        surface="case-study"
        slug={c.slug}
        resume
      />
    </main>
  );
}
