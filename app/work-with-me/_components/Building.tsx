import Link from "next/link";
import { building } from "@/content/services";
import { siteRoutes } from "@/lib/routes";
import { H2, LINK } from "./shared";

/** The smaller group below the roles: visibly lighter than Roles (D-SITE-125). */
export function Building() {
  return (
    <section aria-labelledby="building-heading" className="mt-16 md:mt-20">
      <H2 id="building-heading" small>
        Building, for clients [draft]
      </H2>
      <ul>
        {building.map((b) => (
          <li
            key={b.name}
            className="grid gap-x-8 gap-y-1 border-b border-(--color-line-soft) py-5 md:grid-cols-[240px_240px_1fr_160px]"
          >
            <h3 className="font-medium text-(--color-ink)">{b.name}</h3>
            <p className="text-(length:--text-meta) text-(--color-dim) tabular-nums md:pt-0.5">
              {b.price}
            </p>
            <p className="max-w-[44ch] text-(length:--text-small) leading-[1.6] text-(--color-body)">
              {b.line}
            </p>
            <div className="flex flex-wrap gap-x-6 md:flex-col md:items-end md:gap-x-0">
              {b.proof && (
                <Link href={b.proof.href} className={LINK}>
                  {b.proof.label}
                </Link>
              )}
              <Link href={siteRoutes.contact} className={LINK}>
                Send a note [draft]
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
