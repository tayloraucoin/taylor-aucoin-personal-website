import { hostingTerms, ownership } from "@/content/websites-coded";
import { Section } from "./Section";

const SPLIT = "Which means:";

/**
 * What you actually own: Body, the ownership line at Headline, Body, then the
 * Vercel note at Meta. The line is `ownership`'s own words split at "Which
 * means:"; the split is layout, not new copy (websites-coded-words.md).
 */
export function Ownership() {
  const at = ownership.before.indexOf(SPLIT);
  const first =
    at >= 0 ? ownership.before.slice(0, at).trim() : ownership.before;
  const lead = at >= 0 ? ownership.before.slice(at) : "";
  const body = "text-(length:--text-body) leading-[1.7] text-(--color-body)";

  return (
    <Section id="ownership" heading="What you actually own">
      <div className="mt-6 max-w-[680px]">
        <p className={body}>{first}</p>
        <p className="mt-8 font-display text-[clamp(22px,2.4vw,24px)] leading-[1.3] font-medium tracking-(--tracking-h3) text-(--color-ink)">
          {lead}
          {ownership.emphasis}
        </p>
        <p className={`mt-8 ${body}`}>{ownership.after.trim()}</p>
        <p className="mt-8 max-w-[640px] text-(length:--text-meta) leading-[1.75] text-(--color-dim)">
          {hostingTerms.body}
        </p>
      </div>
    </Section>
  );
}
