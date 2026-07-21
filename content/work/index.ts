import { agora } from "./agora";
import { calculateQxmd } from "./calculate-qxmd";
import { consciousConnections } from "./conscious-connections";
import { everbook } from "./everbook";
import { familyOfficePlatform } from "./family-office-platform";
import { roomvy } from "./roomvy";
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

export const bySlug = (slug: string) => work.find((w) => w.slug === slug);
