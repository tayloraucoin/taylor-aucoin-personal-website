import { isWorkPublished } from "@/lib/config";

/**
 * The published case-study slugs, slug-only, so the analytics registry (which
 * client leaves import) never pulls `content/work`'s copy and images into every
 * page's bundle. This restates the slugs once; a unit test holds it equal to
 * `content/work`'s published studies.
 */
export const PUBLISHED_SLUGS: readonly string[] = [
  "family-office-platform",
  "conscious-connections",
  "everbook",
  "roomvy",
  "agora",
  "calculate-qxmd",
].filter(isWorkPublished);
