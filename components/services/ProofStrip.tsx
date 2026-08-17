import BioRow from "@/components/sections/BioRow";
import Signal from "@/components/sections/Signal";
import Testimonials from "@/components/sections/Testimonials";

/**
 * SVC-09. The Signal stat grid (same component as home — one source of
 * numbers), the testimonial strip (renders nothing until quotes land), and
 * the shared photo + bio row (photo conditional on PHOTO in lib/config.ts).
 */
export default function ProofStrip() {
  return (
    <>
      <Signal />
      <Testimonials />
      <BioRow />
    </>
  );
}
