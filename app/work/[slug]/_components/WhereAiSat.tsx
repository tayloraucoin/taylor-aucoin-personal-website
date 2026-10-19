import type { CaseStudy } from "@/content/work";
import { Block } from "./blocks";

const LISTS = [
  { key: "product", label: "In the product" },
  { key: "build", label: "In the build" },
  { key: "checked", label: "What I checked" },
] as const;

/**
 * Where AI sat (D-SITE-85, 233): home's three-list look, shown only when the
 * study has the lists; absence is `no-ai` and leaves no trace.
 */
export function WhereAiSat({ aiSat }: { aiSat: CaseStudy["aiSat"] }) {
  if (!aiSat) return null;
  return (
    <Block title="Where AI sat">
      <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
        {LISTS.map(({ key, label }) => (
          <div key={key}>
            <h3 className="text-(length:--text-label) font-medium tracking-(--tracking-label) text-(--color-dim) uppercase">
              {label}
            </h3>
            <ul className="mt-3 space-y-2">
              {aiSat[key].map((item) => (
                <li
                  key={item}
                  className="text-(length:--text-small) leading-[1.6] text-(--color-body)"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Block>
  );
}
