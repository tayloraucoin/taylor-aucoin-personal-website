import Link from "next/link";

export type CapabilityChipProof = {
  label: string;
  href?: string;
  external?: boolean;
};

/** One chip's plain data: no rating ever reaches the client (D-SITE-65). */
export type CapabilityChipItem = {
  slug: string;
  name: string;
  title: string;
  tech: string;
  approach: string;
  proof: CapabilityChipProof[];
};

/**
 * The open chip's card body (D-SITE-46, 145, 187): the title, the tech line
 * in Fragment Mono, the approach, a hairline, then where it was done. Proof
 * names take foreground weight 500 with the gold underline; each keeps its
 * comma when the line wraps.
 */
export function CapabilityCard({
  item,
  doneAt,
}: {
  item: CapabilityChipItem;
  /** The line with `{proof}` where the names go. */
  doneAt: string;
}) {
  const [before, after] = doneAt.split("{proof}");
  return (
    <>
      <h3 className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink) md:pr-56">
        {item.title}
      </h3>
      <p className="mt-2 font-code text-(length:--text-code) text-(--color-dim)">
        {item.tech}
      </p>
      <p className="mt-5 max-w-[65ch] text-(length:--text-body) leading-[1.7] text-(--color-body)">
        {item.approach}
      </p>
      <p className="mt-6 border-t border-(--color-line-soft) pt-5 text-(length:--text-small) leading-[1.6] text-(--color-body)">
        {before}
        {item.proof.map((p, i) => (
          <span key={p.label} className="whitespace-nowrap">
            <ProofName proof={p} />
            {i < item.proof.length - 1 ? ", " : ""}
          </span>
        ))}
        {after}
      </p>
    </>
  );
}

const NAME =
  "font-medium text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4";

function ProofName({ proof }: { proof: CapabilityChipProof }) {
  if (!proof.href) return <span className={NAME}>{proof.label}</span>;
  const cls = `${NAME} transition-colors duration-(--dur-fast) hover:text-(--color-body)`;
  if (proof.external)
    return (
      <a
        href={proof.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {proof.label}
      </a>
    );
  return (
    <Link href={proof.href} className={cls}>
      {proof.label}
    </Link>
  );
}
