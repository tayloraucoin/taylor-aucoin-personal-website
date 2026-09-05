import Link from "next/link";
import { notFound } from "next/navigation";
import { TASTE_ABSENT_LINE } from "@/app/websites/coded/intake/_components/steps/step-taste";
import { EXAMPLE_PACKS, type ExamplePack } from "@/lib/intake/example-packs";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  coverageOf,
  loadExampleSet,
  loadExampleSites,
  loadPackSummaries,
} from "@/server/services/example-sites";
import { AddSite } from "../../_components/add-site";
import { CoverageStrip } from "../../_components/coverage-strip";
import { GalleryPreview } from "../../_components/gallery-preview";
import { packAudience, packLabel } from "../../_components/pack-words";
import { PackSwitch } from "../../_components/pack-switch";
import { SiteDrawer } from "../../_components/site-drawer";
import { SiteEditor } from "../../_components/site-editor";
import { SiteTable } from "../../_components/site-table";

export const dynamic = "force-dynamic";

/**
 * One set: the work, then the instrument.
 *
 * The work comes first — the sites, and the way to add one. The coverage strip
 * moved below them, because it answers "what am I missing" and that question
 * only exists once there is something to be missing from. It used to open the
 * page with six zeros above an empty list, which read as a broken screen.
 */
export default async function ExamplePackPage({
  params,
  searchParams,
}: {
  params: Promise<{ pack: string }>;
  searchParams: Promise<{ site?: string; preview?: string }>;
}) {
  await requireAdmin();

  const { pack } = await params;
  const { site: openSlug, preview } = await searchParams;

  const isAll = pack === "all";
  if (!isAll && !EXAMPLE_PACKS.includes(pack as ExamplePack)) notFound();

  const [sites, summaries] = await Promise.all([
    loadExampleSites(isAll ? "all" : (pack as ExamplePack)),
    loadPackSummaries(),
  ]);

  const summary = isAll ? null : summaries.find((e) => e.pack === pack)!;
  const published = sites.filter((s) => s.status === "published");
  const open = openSlug ? sites.find((s) => s.slug === openSlug) : undefined;

  // Resolved exactly as a client's would be, so a pack whose switch is off
  // previews as the absent state — the thing most worth seeing before you
  // turn it on.
  const previewSet =
    preview !== undefined && !isAll
      ? await loadExampleSet(pack as ExamplePack)
      : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Link
          href={adminRoutes.intakeExamples}
          className="w-fit text-xs text-(--color-dim) hover:text-(--color-ink)"
        >
          ← Example sites
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
            {isAll ? "The whole library" : packLabel(pack as ExamplePack)}
          </h1>
          <p className="text-sm text-(--color-body)">
            {isAll
              ? `${sites.length} ${sites.length === 1 ? "site" : "sites"}, across every set.`
              : packAudience(pack as ExamplePack)}
          </p>
        </div>

        {summary ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <PackSwitch
              pack={summary.pack}
              shown={summary.shownToClients}
              publishedCount={summary.publishedCount}
              label={packLabel(summary.pack)}
              absentLine={TASTE_ABSENT_LINE}
            />
            <Link
              href={`?preview=1`}
              scroll={false}
              className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-4 py-2 text-sm text-(--color-body) hover:bg-(--color-card-hover)"
            >
              {/* [COPY — draft] */}
              Preview the gallery
            </Link>
          </div>
        ) : null}
      </header>

      <AddSite pack={pack} />

      <SiteTable sites={sites} />

      {isAll ? null : (
        <CoverageStrip
          coverage={coverageOf(sites)}
          publishedCount={published.length}
        />
      )}

      {open ? (
        <SiteDrawer title={open.name || open.slug}>
          <SiteEditor site={open} />
        </SiteDrawer>
      ) : null}

      {previewSet ? (
        <SiteDrawer title={`${packLabel(pack as ExamplePack)} — as a client sees it`}>
          <GalleryPreview set={previewSet} absentLine={TASTE_ABSENT_LINE} />
        </SiteDrawer>
      ) : null}
    </div>
  );
}
