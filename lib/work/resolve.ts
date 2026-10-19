import { work, type CaseStudy } from "@/content/work";
import { isWorkPublished } from "@/lib/config";

/**
 * The published study for a slug, or `null` for an unknown or unpublished one
 * (C-SITE-case-study-7). Both inputs are injectable so the unpublished branch
 * is testable without flipping `WORK_PUBLISHED`.
 */
export function resolveStudy(
  slug: string,
  studies: readonly CaseStudy[] = work,
  isPublished: (slug: string) => boolean = isWorkPublished,
): CaseStudy | null {
  const study = studies.find((s) => s.slug === slug);
  return study && isPublished(study.slug) ? study : null;
}
