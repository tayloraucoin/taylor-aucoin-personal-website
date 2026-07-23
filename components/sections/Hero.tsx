import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
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
          className="h-px max-w-[220px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
          }}
        />
      </div>

      {/* Plain ink. NO gradient on the name — it reads amateur. Gradient is rationed. */}
      <h1 className="mb-5 font-display text-[clamp(40px,5.6vw,68px)] font-medium leading-[1.02] tracking-[-.032em] text-(--color-ink)">
        {SITE.name}
      </h1>

      {/* Taylor writes hero copy in SITE.tagline (lib/config.ts). */}
      <p className="mb-9 max-w-[48ch] text-base font-light leading-[1.66] text-(--color-body)">
        {SITE.role} and technical founder. {SITE.tagline}
      </p>

      <div className="flex flex-wrap gap-3">
        <GradientButton href="#work">Selected work →</GradientButton>
        <GhostButton href={SITE.resume}>Résumé</GhostButton>
      </div>
    </section>
  );
}
