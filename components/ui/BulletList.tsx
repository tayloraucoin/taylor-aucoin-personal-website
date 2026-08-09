/**
 * Shared bullet list — used by Brief, Process, and Outcome on the case
 * template. Sharp 3px square marker in --color-dim instead of a disc (gold
 * is never used as a bullet marker); labels never inline with body text.
 * The marker + text are separate flex children, so wrapped lines hang-indent
 * to the first line's text start automatically.
 */
export default function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[48ch] space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-(--color-dim)"
          />
          <span className="text-[15px] font-light leading-[1.6] text-(--color-body)">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
