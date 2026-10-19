import { priceAnchor, roles } from "@/content/services";
import { H2 } from "./shared";

/** Five seats of one job (D-SITE-125); the price line stands once, under them. */
export function Roles() {
  return (
    <section aria-labelledby="roles-heading" className="mt-16 md:mt-24">
      <H2 id="roles-heading">Roles</H2>
      <ul>
        {roles.map((r) => (
          <li
            key={r.name}
            className="grid gap-x-8 gap-y-2 border-b border-(--color-line-soft) py-6 md:grid-cols-[240px_240px_1fr]"
          >
            <h3 className="font-display text-(length:--text-lede) leading-[1.25] font-medium text-(--color-ink)">
              {r.name}
            </h3>
            <p className="text-(length:--text-meta) text-(--color-dim) md:pt-1">
              {r.terms}
            </p>
            <div className="max-w-[640px]">
              <p className="text-(length:--text-body) leading-[1.5] text-(--color-ink)">
                {r.bestFor}
              </p>
              <p className="mt-2 text-(length:--text-small) leading-[1.6] text-(--color-dim)">
                {r.includes.join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-[56ch] text-(length:--text-small) leading-[1.6] text-(--color-body)">
        {priceAnchor}
      </p>
    </section>
  );
}
