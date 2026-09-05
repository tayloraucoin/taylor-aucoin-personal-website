import type { ShowcaseFlavour } from "@/lib/intake/showcase-copy";

/**
 * The taste gallery's vocabulary and admin-facing shapes, transport-unbound.
 *
 * Split out of `server/services/example-sites.ts` because the editor is a
 * client component and needs the pack list as a *value* — importing it from the
 * service dragged `server-only`, Drizzle, and the database client into the
 * browser bundle, which the build refused. It was right to.
 *
 * Nothing here touches the database, the framework, or a transport. That is the
 * property that lets both sides of the boundary read it, and the one to
 * preserve: a query, a Drizzle type, or a `next/*` import in this file puts the
 * boundary back.
 */

export const EXAMPLE_PACKS = [
  "film",
  "generic",
  "practice",
  "entity",
  "venture",
  "service",
] as const satisfies readonly ShowcaseFlavour[];

export type ExamplePack = (typeof EXAMPLE_PACKS)[number];

export type ExampleSiteStatus = "draft" | "published" | "archived";

export type DraftCapture = {
  id: string;
  position: number;
  storagePath: string;
  src: string;
  mimeType: string;
  /** True for `video/*`: the admin renders a `<video>`, not an `<img>`. */
  isVideo: boolean;
  width: number;
  height: number;
  alt: string;
};

/** Everything a site needs to exist, submitted in one go. */
export type NewExampleSiteInput = {
  url: string;
  name: string;
  role: string;
  group: string | null;
  ground: string | null;
  motion: string | null;
  density: string | null;
  build: string | null;
  styles: string[];
  embed: boolean;
  checkedOn: string;
  packs: ExamplePack[];
};

/**
 * One row, as the admin sees it — never handed to a client-facing surface.
 *
 * The nullable judgements are the shape of a draft. A client meets the
 * `ExampleSite` contract instead, built only from published rows and validated
 * on the way out, so a half-tagged draft cannot reach a gallery structurally
 * rather than by promise (M-PORT-42).
 */
export type ExampleSiteDraft = {
  id: string;
  slug: string;
  /** True once published: the slug is a client's stored answer (M-PORT-44). */
  slugLocked: boolean;
  status: ExampleSiteStatus;
  name: string;
  role: string;
  url: string;
  host: string;
  group: string | null;
  ground: string | null;
  motion: string | null;
  density: string | null;
  build: string | null;
  styles: string[];
  embed: boolean;
  checkedOn: string;
  packs: ExamplePack[];
  captures: DraftCapture[];
  /** Empty means publishable. The gate's copy, computed once, server-side. */
  blockers: string[];
  /** Worth saying, never a reason to refuse — a cropped hero, and the like. */
  notes: string[];
  createdAt: Date;
};

export type PackSummary = {
  pack: ExamplePack;
  shownToClients: boolean;
  publishedCount: number;
  groupsFilled: number;
  /** What the overview prints. Computed once so no surface re-derives it. */
  state: "shown" | "switch-off" | "nothing-published";
};

export type PackCoverage = {
  groups: { key: string; count: number }[];
  ground: Record<string, number>;
  motion: Record<string, number>;
  density: Record<string, number>;
};

export type PasteResult = {
  created: { slug: string; host: string }[];
  duplicates: { host: string; slug: string }[];
  failed: { line: string; reason: string }[];
};
