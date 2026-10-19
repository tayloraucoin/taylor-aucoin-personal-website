import { ExampleRow } from "@/app/websites/_components/ExampleRow";
import type { MediaItem, WorkRow } from "@/content/work";
import desktopHome from "@/public/websites/clean-coast/desktop-home.jpg";
import desktopServices from "@/public/websites/clean-coast/desktop-services.jpg";
import mobileHome from "@/public/websites/clean-coast/mobile-home.jpg";
import { guardHarness } from "../analytics/guard";

/**
 * Test-only: `/websites`' example row on synthetic rows, so the lightbox, the
 * absent lines and the empty gallery are proven before a real row has images
 * (SITE-25). Images already under `public/`, names invented. 404 on a
 * production deployment.
 */
const desktop: MediaItem = { src: desktopHome, alt: "Fixture desktop shot" };
const phone: MediaItem = { src: mobileHome, alt: "Fixture phone shot" };
const second: MediaItem = { src: desktopServices, alt: "Fixture second shot" };

const base: Omit<WorkRow, "id" | "title"> = {
  discipline: "websites",
  type: "client",
  tagline: "Fixture line on the site",
  role: "Coded website",
  period: "2026",
  sortDate: "2026-01",
  gallery: [desktop, phone, second],
  published: true,
  example: { desktop, phone },
};

const rows: WorkRow[] = [
  {
    ...base,
    id: "full",
    title: "Fixture Studio",
    liveUrl: "https://fixture.invalid",
    example: {
      desktop,
      phone,
      testimonial: {
        quote: "Fixture quote.",
        name: "Fixture Client",
        role: "Director",
      },
    },
  },
  { ...base, id: "bare", title: "Fixture Bare" },
  { ...base, id: "empty", title: "Fixture Empty", gallery: [] },
];

export default function ExampleRowHarness() {
  guardHarness();
  return (
    <main id="main" className="mx-auto max-w-[1192px] px-[22px] md:px-14">
      <h1 className="sr-only">Example row harness</h1>
      <ul>
        {rows.map((row) => (
          <ExampleRow key={row.id} row={row} />
        ))}
      </ul>
    </main>
  );
}
