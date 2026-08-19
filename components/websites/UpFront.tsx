import LabelRows from "@/components/ui/LabelRows";
import SectionLabel from "@/components/ui/SectionLabel";
import { upFront } from "@/content/websites";

/**
 * Same row shape and the same gold lead as What you get. The leads were dim
 * at first, on the reasoning that a caveat in gold reads as a feature — but
 * it is the identical component sitting two sections below, so two colours
 * read as a bug rather than as a distinction. Taylor caught it. Consistency
 * of the component wins over the semantic hair-split.
 *
 * Publishing the limits — "I can't promise you'll rank #1 on Google. Nobody
 * honest can." — is what makes the promises on the rest of the page credible.
 */
export default function UpFront() {
  return (
    <section className="mt-16">
      <SectionLabel>Worth saying up front</SectionLabel>
      <div className="mt-2">
        <LabelRows rows={upFront} />
      </div>
    </section>
  );
}
