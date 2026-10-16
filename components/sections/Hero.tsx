import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { availability } from "@/content/services";
import { SITE } from "@/lib/config";

export default function Hero() {
  return (
    <section className="relative">
      <div className="mb-6 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>
          {SITE.location} · {SITE.role}
        </span>
        <span
          aria-hidden
          className="order-first h-px w-6 shrink-0 bg-(--color-rule)"
        />
      </div>

      {/* Plain ink. NO gradient on the name — it reads amateur. Gradient is rationed. */}
      <h1 className="mb-5 font-display text-[clamp(40px,5.6vw,68px)] font-medium leading-[1.02] tracking-[-.032em] text-(--color-ink)">
        {SITE.name}
      </h1>

      {/* Taylor writes hero copy in SITE.tagline (lib/config.ts). */}
      <p className="mb-4 max-w-[48ch] text-base font-light leading-[1.66] text-(--color-body)">
        {SITE.role} and technical founder. {SITE.tagline}
      </p>

      {/* HOME-02 — same availability line as the services hero. One truth, two pages. */}
      <p className="mb-9 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        <span className="text-(--color-c2)">Available now</span>
        {" — "}
        {availability}
      </p>

      {/* Two paths: the sell (primary) and the proof (ghost) — most visitors
          come to see the work. Résumé lives in the header; booking is the
          services page's job. */}
      <div className="flex flex-wrap gap-3">
        <GradientButton href="/services">Work with me →</GradientButton>
        <GhostButton href="#work">Selected work</GhostButton>
      </div>
    </section>
  );
}
