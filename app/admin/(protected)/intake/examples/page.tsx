import Link from "next/link";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { loadPackSummaries } from "@/server/services/example-sites";
import {
  packAudience,
  packLabel,
} from "./_components/pack-words";

export const dynamic = "force-dynamic";

/**
 * Six sets, and whether a client can meet any of them.
 *
 * **This screen is where D-PORT-12 stops being a rule in a document and becomes
 * something you can see.** The single most-cited ruling on the taste step exists
 * because six invented sites shipped to clients for a week; the answer to "is
 * anything live right now" should take one glance, from the place the decision
 * is made.
 *
 * The status phrase is the only gold on the page. Gold is punctuation, and here
 * it says exactly one thing: a client can see this.
 */
export default async function ExampleSitesPage() {
  await requireAdmin();

  const packs = await loadPackSummaries();
  const total = packs.reduce((sum, pack) => sum + pack.publishedCount, 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          Example sites
        </h1>
        <p className="text-sm text-(--color-body)">
          {/* [COPY — draft] */}
          Six sets. A client meets one, chosen from what they told us their site
          is for.
        </p>
      </header>

      <ul className="flex flex-col border-t border-(--color-faint)">
        {packs.map((pack) => (
          <li key={pack.pack} className="border-b border-(--color-faint)">
            <Link
              href={adminRoutes.intakeExamplePack(pack.pack)}
              className="flex min-h-[44px] flex-wrap items-center gap-x-4 gap-y-1 border-l-2 border-transparent px-3 py-3 hover:border-(--color-c2) hover:bg-(--color-tint)/60"
            >
              <span className="flex min-w-[16rem] flex-col gap-0.5">
                <span className="font-(family-name:--font-mono) text-[10px] tracking-[.30em] text-(--color-dim) uppercase">
                  {packLabel(pack.pack)}
                </span>
                <span className="text-sm text-(--color-body)">
                  {packAudience(pack.pack)}
                </span>
              </span>

              <span className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
                {/*
                  The published count is absent at zero rather than printed as
                  "0 published" — the same law the client's gallery follows. The
                  tool obeys its own rule.
                */}
                {pack.publishedCount > 0 ? (
                  <span className="text-xs text-(--color-body)">
                    {pack.publishedCount} published · {pack.groupsFilled} of 6
                    groups
                  </span>
                ) : null}

                <span
                  className={`text-xs ${
                    pack.state === "shown"
                      ? "text-(--color-c2)"
                      : "text-(--color-dim)"
                  }`}
                >
                  {/* [COPY — draft] */}
                  {pack.state === "shown"
                    ? "Shown to clients"
                    : pack.state === "switch-off"
                      ? "Not shown — switch is off"
                      : "Not shown — nothing published yet"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={adminRoutes.intakeExamplePack("all")}
        className="text-sm text-(--color-body) underline underline-offset-4 hover:text-(--color-ink)"
      >
        {/* [COPY — draft] */}
        The whole library{total > 0 ? ` — ${total} published` : ""}
      </Link>
    </div>
  );
}
