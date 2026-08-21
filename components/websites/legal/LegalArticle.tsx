import type { LegalDoc } from "@/content/legal";
import { Em, LegalList, LegalSection, P } from "./prose";

/**
 * Renders a legal document from its typed content. One renderer for both
 * documents and both surfaces (the standalone page and the pay-screen
 * dialog), so the client can never be shown a different text than the page
 * publishes — same content module, same markup.
 */
export default function LegalArticle({ doc }: { doc: LegalDoc }) {
  return (
    <article>
      <header>
        <h1 className="font-display text-[clamp(26px,5vw,34px)] font-medium leading-[1.12] tracking-[-.02em] text-(--color-ink)">
          {doc.title}
        </h1>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[.22em] text-(--color-dim)">
          Effective {doc.effective} · Version {doc.version}
        </p>
        <p className="mt-5 max-w-[52ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
          {doc.intro}
        </p>
      </header>

      <div className="mt-10">
        {doc.sections.map((section, i) => (
          <LegalSection
            key={section.title}
            index={String(i + 1).padStart(2, "0")}
            title={section.title}
          >
            {section.blocks.map((block, j) =>
              "p" in block ? (
                <P key={j}>{block.p}</P>
              ) : (
                <LegalList key={j} items={block.list} />
              ),
            )}
          </LegalSection>
        ))}
      </div>

      <footer className="mt-12 border-t border-(--color-faint) pt-5">
        <P>
          <Em>Agora Network Technologies Inc.</Em> · British Columbia, Canada
        </P>
      </footer>
    </article>
  );
}
