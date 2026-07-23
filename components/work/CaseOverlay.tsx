import type { CaseStudy } from "@/content/work";
import Overlay from "@/components/ui/Overlay";
import CaseBody from "./CaseBody";

/**
 * A case study inside the shared full-screen panel. The dialog shell itself
 * (slide-up, focus trap, Escape/backdrop close) lives in `components/ui/Overlay`
 * so /stack and the case studies stay identical in behavior.
 */
export default function CaseOverlay({ c }: { c: CaseStudy }) {
  return (
    <Overlay label={c.title}>
      <CaseBody c={c} />
    </Overlay>
  );
}
