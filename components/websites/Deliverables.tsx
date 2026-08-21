import LabelRows from "@/components/ui/LabelRows";
import SectionLabel from "@/components/ui/SectionLabel";
import { deliverables } from "@/content/websites";

/**
 * The page's most brochure-shaped content, and the reason it isn't a six-cell
 * card grid: that shape is exactly the generic template rhythm this site's
 * drift test exists to catch. The inscription register carries it instead.
 */
export default function Deliverables() {
  return (
    <section className="mt-16">
      <SectionLabel>What you get</SectionLabel>
      <div className="mt-2">
        <LabelRows rows={deliverables} />
      </div>
    </section>
  );
}
