import { SITE } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-(--color-faint) pt-6 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim)">
      <span>tayloraucoin.com</span>
      <span className="flex gap-2">
        <a
          href={`mailto:${SITE.email}`}
          className="text-(--color-body) transition-colors hover:text-(--color-c2)"
        >
          Email
        </a>
        <span aria-hidden>·</span>
        <a
          href={SITE.github}
          className="text-(--color-body) transition-colors hover:text-(--color-c2)"
        >
          GitHub
        </a>
        <span aria-hidden>·</span>
        <a
          href={SITE.linkedin}
          className="text-(--color-body) transition-colors hover:text-(--color-c2)"
        >
          LinkedIn
        </a>
      </span>
    </footer>
  );
}
