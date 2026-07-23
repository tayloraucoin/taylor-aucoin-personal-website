import SectionLabel from "@/components/ui/SectionLabel";

const stats = [
  { v: "9.5", k: "Years shipping" },
  { v: "12", k: "0→1 builds" },
  { v: "13", k: "Cohorts mentored" },
  { v: "0→1", k: "Founding engineer" },
];

export default function Signal() {
  return (
    <section className="mt-16">
      <SectionLabel>Signal</SectionLabel>
      <div className="mt-6 grid grid-cols-2 gap-px border border-(--color-faint) bg-(--color-faint) md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.k}
            data-interactive
            className="bg-[rgb(9_12_34/.62)] px-5 py-6 backdrop-blur-[8px] transition-colors duration-(--dur-base) hover:bg-[rgb(16_19_48/.84)]"
          >
            <div className="font-display text-3xl font-medium tracking-[-.02em] text-(--color-c2)">
              {s.v}
            </div>
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
              {s.k}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
