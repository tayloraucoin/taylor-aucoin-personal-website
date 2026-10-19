import type { Metadata } from "next";
import { PageClose } from "@/components/site/PageClose";
import { capabilities } from "@/content/capabilities";
import { availability, closing } from "@/content/services";
import { socialCard } from "@/lib/metadata";
import { readPageState, type PageSearchParams } from "@/lib/page-state";
import { CapabilityTabs } from "./_components/CapabilityTabs";
import { parseTab, type TabbedChipItem } from "./_components/tabs";
import { capabilitiesPage as words } from "./_components/words";

export const metadata: Metadata = {
  title: words.title,
  description: words.description,
  ...socialCard({ title: words.socialTitle, description: words.description }),
};

/** capabilities.md's States, on real content, outside production only. */
const STATES = [
  "tab",
  "filtered",
  "filter-empty",
  "card-open",
  "card-open-four-proofs",
] as const;

/**
 * The chips in Taylor's comfort order, stripped to plain props here on the
 * server so no rating reaches the client (D-SITE-65). A capability with no
 * chip name or no proof never shows (D-SITE-15, 142).
 */
function chipItems(): TabbedChipItem[] {
  return capabilities
    .filter((c) => c.chip && c.comfort !== undefined && c.proof?.length)
    .sort((a, b) => b.comfort! - a.comfort!)
    .map((c) => ({
      slug: c.slug,
      name: c.chip!,
      title: c.title,
      tech: c.tech,
      approach: c.approach,
      tabs: c.tabs,
      offer: c.offer,
      keywords: c.keywords,
      proof: c.proof!.map(({ label, href, external }) => ({
        label,
        ...(href ? { href } : {}),
        ...(external ? { external } : {}),
      })),
    }));
}

/**
 * `/capabilities` (SITE-26): every problem Taylor takes on as chips under
 * five discipline tabs under a filter, each opening in place on its proof,
 * then the call. `?tab=` and `?q=` are read per request; an unknown tab is
 * All, a blank query is none.
 */
export default async function CapabilitiesPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const state = await readPageState(searchParams, STATES);

  const tab = state === "tab" ? "ai-data" : parseTab(params.tab);
  const rawQ = Array.isArray(params.q) ? params.q[0] : params.q;
  const q =
    state === "filtered"
      ? "realtime"
      : state === "filter-empty"
        ? "kubernetes"
        : (rawQ ?? "");
  const open =
    state === "card-open"
      ? "search-discovery"
      : state === "card-open-four-proofs"
        ? "interface-design"
        : null;

  return (
    <>
      <main
        id="main"
        className="relative mx-auto w-full max-w-[1192px] px-[22px] pt-16 pb-16 md:px-14 md:pt-28 md:pb-24"
      >
        <h1 className="font-display text-[length:clamp(48px,8vw,var(--text-display))] leading-[1.02] font-semibold tracking-(--tracking-display) text-(--color-ink)">
          {words.h1}
        </h1>
        <p className="mt-6 max-w-[620px] text-(length:--text-body) leading-[1.7] text-(--color-body)">
          {words.framing}
        </p>
        <div className="mt-10 md:mt-14">
          <CapabilityTabs
            key={`${tab}-${q}-${open}`}
            items={chipItems()}
            initialTab={tab}
            initialQuery={q}
            initialOpen={open}
          />
        </div>
      </main>
      <PageClose
        line={closing}
        availability={availability}
        surface="capabilities"
        lineSize="h3"
      />
    </>
  );
}
