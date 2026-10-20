import { isWorkPublished } from "@/lib/config";
import { agora } from "./agora";
import { calculateQxmd } from "./calculate-qxmd";
import { consciousConnections } from "./conscious-connections";
import { everbook } from "./everbook";
import { familyOfficePlatform } from "./family-office-platform";
import { roomvy } from "./roomvy";
import type { CaseStudy } from "./types";

export { workRows } from "./rows";

export type {
  AiSat,
  AtAGlanceRow,
  Beats,
  BriefContent,
  BrokeCategory,
  BrokeContent,
  BulletGroup,
  BuiltCard,
  BuiltContent,
  BuiltFormat,
  Discipline,
  Fact,
  CaseLink,
  CaseStudy,
  Decision,
  MediaGroup,
  MediaItem,
  OutcomeContent,
  ProcessContent,
  ProcessSection,
  WorkRow,
  WorkType,
} from "./types";

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
