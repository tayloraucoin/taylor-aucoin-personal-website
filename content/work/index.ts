import { agora } from "./agora";
import { calculateQxmd } from "./calculate-qxmd";
import { consciousConnections } from "./conscious-connections";
import { everbook } from "./everbook";
import { familyOfficePlatform } from "./family-office-platform";
import { roomvy } from "./roomvy";
import { isWorkPublished } from "@/lib/config";
import type { CaseStudy } from "./types";

export type { CaseLink, CaseStudy, Decision, Media } from "./types";

/** Display order. Reorder imports here when slot order changes. */
export const work: CaseStudy[] = [
  familyOfficePlatform,
  consciousConnections,
  everbook,
  roomvy,
  agora,
  calculateQxmd,
];

/** Home + routes — filtered by `WORK_PUBLISHED` in `lib/config.ts`. */
export const publishedWork = work.filter((w) => isWorkPublished(w.slug));

export const bySlug = (slug: string) => {
  const c = work.find((w) => w.slug === slug);
  if (!c || !isWorkPublished(c.slug)) return undefined;
  return c;
};
