import SectionLabel from "@/components/ui/SectionLabel";

/**
 * v3 — flat cards. Same label/body register as the Capabilities cards
 * above, but --color-spec-bg / --color-spec-border read flatter than
 * --color-card on purpose: no ring, no hover, no shadow, no transition.
 * Static content — must never gate the root field's cursor-glow.
 */
const specialties = [
  {
    label: "Commerce & checkout",
    body: "Carts, payments, taxes, refunds, bookings, post-purchase. Built across Agora, Roomvy, Everbook's print orders, and a retreat booking platform.",
  },
  {
    label: "Data & state architecture",
    body: "Schemas designed for the use cases they'll actually meet, and state handled deliberately at every layer — component, store, query cache, CDN, database, read replica.",
  },
  {
    label: "Rendering performance",
    body: "React and Next.js at the level where it matters — server components, caching strategy, bundle discipline.",
  },
  {
    label: "Search & discovery",
    body: "Elasticsearch, recommendation engines, enrichment pipelines.",
  },
  {
    label: "Specification",
    body: "Tutorial-grade tickets — every layer of a feature mapped end to end, upfront. Writing a spec that precise is coding the feature through another person.",
  },
  {
    label: "Correctness",
    body: "Typed contracts, integration tests, preview environments — knowing it works before the customer does.",
  },
];

export default function Specialties() {
  return (
    <section className="mt-16">
      <SectionLabel>Specialties</SectionLabel>
      <div className="mt-[26px] grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
        {specialties.map((s) => (
          <div
            key={s.label}
            className="rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-6"
          >
            <span className="mb-2.5 block font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
              {s.label}
            </span>
            <p className="text-[13.5px] font-light leading-[1.64] text-(--color-body)">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
