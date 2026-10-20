import { sitesHeading } from "@/content/websites-coded";
import { workRows, type WorkRow } from "@/content/work";
import { ExampleRow } from "./ExampleRow";
import { Section } from "./Section";

/** The published website rows, in the order `content/work/rows.ts` lists them. */
export function publishedWebsiteRows(
  rows: readonly WorkRow[] = workRows,
): WorkRow[] {
  return rows.filter((row) => row.discipline === "websites" && row.published);
}

/**
 * Sites I've built: one example row per published website row. Holistica
 * stays unpublished until it ships and Clean Coast is hidden (D-SITE-211,
 * 238); the section keeps its heading with one row (D-SITE-115).
 */
export function SitesBuilt() {
  return (
    <Section id="sites" heading={sitesHeading}>
      <ul className="mt-8 border-t border-(--color-line-soft)">
        {publishedWebsiteRows().map((row) => (
          <ExampleRow key={row.id} row={row} />
        ))}
      </ul>
    </Section>
  );
}
