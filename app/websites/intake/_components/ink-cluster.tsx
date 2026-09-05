import type { ReactNode } from "react";

/**
 * A hairline-separated group whose intro renders at full ink.
 *
 * **This is the only ink treatment on the coded track, and it is granted once**
 * (D-PORT-10). The durable track grants ink to exactly one step for exactly one
 * reason — "How you work" is the step that stops us putting something untrue on
 * a client's site — and this is the coded track's equivalent, sitting on step 4
 * for every kind that is asking people for money, membership, or trust.
 *
 * Ink is not for emphasis and it is not for length. `lib/types/intake.ts` says
 * so about the step registry's `emphasis` flag, and the same rule binds here:
 * a step is long, or a question is important, and neither earns this. What
 * earns it is being the thing that prevents a false claim.
 *
 * **The register is deliberately warm.** No word inside this wrapper's content
 * is "legal", "compliance", "liability", or "risk". A founder in the middle of
 * a raise should read the cluster and feel looked after rather than audited,
 * which is why the intro says what the questions are *for* before it asks any
 * of them.
 */
export function InkCluster({
  mono,
  intro,
  children,
}: {
  /** The wide-tracked mono label above the group. */
  mono: string;
  /** Rendered at `--color-ink`, not `--color-dim`. That is the whole point. */
  intro: string;
  children: ReactNode;
}) {
  const id = "ink-cluster-label";

  return (
    <section
      aria-labelledby={id}
      className="mb-7 border-t border-(--color-faint) pt-7"
    >
      <h2
        id={id}
        className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)"
      >
        {mono}
      </h2>

      <p className="mt-3 mb-6 max-w-[52ch] font-body text-[16px] font-light leading-[1.6] text-(--color-ink)">
        {intro}
      </p>

      {children}
    </section>
  );
}
