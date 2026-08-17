"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RootField, { type FieldControl } from "@/components/field/RootField";
import { BACKGROUND_CSS, paintBackground, paintGrain } from "./background";

/** LinkedIn cover image, logical size. */
const W = 1584;
const H = 396;
/** Export scale. LinkedIn re-encodes; 2× survives that legibly. */
const SCALE = 2;

const PREVIEW_STEPS = [1, 0.75, 0.5] as const;

export default function BannerExport() {
  const control = useRef<FieldControl | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [time, setTime] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const [preview, setPreview] = useState<number>(1);
  const [initial, setInitial] = useState<{
    paused: boolean;
    intensity: number;
  } | null>(null);

  // Query params, read once on mount: ?paused=1 &intensity=1.4 &preview=0.5
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = q.get("paused") === "1" || q.get("paused") === "true";
    const i = Number(q.get("intensity"));
    const pv = Number(q.get("preview"));
    const next = {
      paused: p,
      intensity: Number.isFinite(i) && i > 0 ? Math.min(i, 4) : 1,
    };
    setInitial(next);
    setPaused(next.paused);
    setIntensity(next.intensity);
    if (Number.isFinite(pv) && pv > 0.1 && pv <= 1) setPreview(pv);
  }, []);

  // The field mounts only once `initial` is known, so ?intensity= is the value
  // it seeds with rather than a visible jump on the first frame.
  useEffect(() => {
    if (!initial || !control.current) return;
    control.current.setPaused(initial.paused);
  }, [initial]);

  const applyIntensity = useCallback((v: number) => {
    const next = Math.max(0.2, Math.min(4, Math.round(v * 20) / 20));
    setIntensity(next);
    control.current?.setIntensity(next);
  }, []);

  const togglePause = useCallback(() => {
    const c = control.current;
    if (!c) return;
    const p = c.toggle();
    setPaused(p);
    if (p) setTime(c.getTime()); // land the scrub on the frame you just froze
  }, []);

  const reseed = useCallback(() => {
    control.current?.rebuild();
  }, []);

  /** Scrubbing implies you are choosing a frame, so it pauses. */
  const scrubTo = useCallback((v: number) => {
    const c = control.current;
    if (!c) return;
    if (!c.isPaused()) {
      c.setPaused(true);
      setPaused(true);
    }
    setTime(v);
    c.setTime(v);
  }, []);

  /** `open` shows the composite in a new tab instead of writing it — worth a
   *  look before you commit a file, since the export is composited fresh and
   *  is not a screenshot of what is on screen. `repo` POSTs it to the dev-only
   *  save route so it lands in `public/banner/` rather than Downloads. */
  const exportPng = useCallback((mode: "save" | "open" | "repo" = "save") => {
    const src = stageRef.current?.querySelector("canvas");
    if (!src) return;
    const out = document.createElement("canvas");
    out.width = W * SCALE;
    out.height = H * SCALE;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.scale(SCALE, SCALE);
    paintBackground(ctx, W, H);
    // The field's backing store is already W*SCALE × H*SCALE, so this lands
    // 1:1 on the output — no resample, no softening.
    ctx.drawImage(src, 0, 0, W, H);
    paintGrain(ctx);
    out.toBlob((blob) => {
      if (!blob) return;
      const filename = `banner-${W * SCALE}x${H * SCALE}.png`;
      if (mode === "repo") {
        fetch(`/banner-export/save?name=${filename}`, {
          method: "POST",
          body: blob,
        })
          .then((r) => r.json())
          .then((r) => setSaved(r.path ?? r.error ?? "failed"))
          .catch(() => setSaved("failed"));
        return;
      }
      const url = URL.createObjectURL(blob);
      if (mode === "open") {
        window.open(url, "_blank");
        return; // the new tab still needs the URL; let the page unload free it
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "p") {
        e.preventDefault();
        togglePause();
      } else if (k === "r") {
        reseed();
      } else if (k === "e") {
        exportPng(e.shiftKey ? "open" : "save");
      } else if (k === "[") {
        applyIntensity((control.current?.getIntensity() ?? intensity) - 0.1);
      } else if (k === "]") {
        applyIntensity((control.current?.getIntensity() ?? intensity) + 0.1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause, reseed, exportPng, applyIntensity, intensity]);

  return (
    <div className="min-h-dvh p-6">
      <div className="relative z-10 mb-5 flex flex-wrap items-center gap-2 font-mono text-xs text-(--color-dim)">
        <Btn onClick={togglePause}>
          {paused ? "▶ resume" : "⏸ pause"}{" "}
          <Key>space</Key>
        </Btn>
        <Btn onClick={reseed}>
          ⟳ reseed <Key>r</Key>
        </Btn>
        <Btn onClick={() => applyIntensity(intensity - 0.1)}>
          − <Key>[</Key>
        </Btn>
        <span className="tabular-nums text-(--color-c2)">
          intensity {intensity.toFixed(2)}
        </span>
        <Btn onClick={() => applyIntensity(intensity + 0.1)}>
          + <Key>]</Key>
        </Btn>
        <Btn onClick={() => scrubTo(0)}>⏮ t=0</Btn>
        <Btn onClick={() => exportPng("save")}>
          ↓ export {W * SCALE}×{H * SCALE} PNG <Key>e</Key>
        </Btn>
        <Btn onClick={() => exportPng("open")}>
          ↗ open <Key>shift+e</Key>
        </Btn>
        <Btn onClick={() => exportPng("repo")}>⇩ save to repo</Btn>
        {saved && <span className="text-(--color-c2)">{saved}</span>}
        <span className="ml-2">preview</span>
        {PREVIEW_STEPS.map((s) => (
          <Btn
            key={s}
            onClick={() => setPreview(s)}
            active={Math.abs(preview - s) < 0.001}
          >
            {Math.round(s * 100)}%
          </Btn>
        ))}
      </div>

      {/* Time scrub. The tree is built whole and synchronously, so this moves
          only the alpha breathing and the traveling pulse dots — there is no
          growth-in to scrub past. Dragging it pauses. */}
      <div className="relative z-10 mb-5 flex max-w-[760px] items-center gap-3 font-mono text-xs text-(--color-dim)">
        <span className="shrink-0">frame</span>
        <input
          type="range"
          min={0}
          max={40}
          step={0.02}
          value={time}
          onChange={(e) => scrubTo(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/12 accent-(--color-c2)"
          aria-label="Field clock"
        />
        <span className="w-20 shrink-0 tabular-nums text-(--color-c2)">
          t {time.toFixed(2)}
        </span>
      </div>

      {/* Scaled preview. The field is told its size explicitly because this
          wrapper is CSS-transformed — getBoundingClientRect() would report the
          scaled box and the canvas would build at the wrong resolution. */}
      <div
        style={{ width: W * preview, height: H * preview }}
        className="relative z-10 overflow-hidden"
      >
        <div
          ref={stageRef}
          className="relative overflow-hidden"
          style={{
            width: W,
            height: H,
            transform: `scale(${preview})`,
            transformOrigin: "top left",
            background: BACKGROUND_CSS,
          }}
        >
          {initial && (
            <RootField
              variant="banner"
              size={{ w: W, h: H }}
              dpr={SCALE}
              intensity={initial.intensity}
              interactive={false}
              controlRef={control}
            />
          )}
          {/* Where LinkedIn's avatar lands on desktop. Guide only — it is
              outside the exported canvas and never reaches the PNG. */}
          <div className="pointer-events-none absolute bottom-[-46px] left-[68px] h-[152px] w-[152px] rounded-full border border-dashed border-(--color-c2)/25" />
        </div>
      </div>

      <p className="relative z-10 mt-5 max-w-[62ch] font-mono text-xs leading-relaxed text-(--color-dim)">
        Temporary route. The network is generated whole on every reseed — what
        you see above is the settled state, not a frame partway through a growth
        animation. Use <span className="text-(--color-c2)">reseed</span> to draw
        a different layout and the{" "}
        <span className="text-(--color-c2)">frame</span> scrub to pick which vias
        are lit. Export composites fresh at {W * SCALE}×{H * SCALE} on solid{" "}
        <span className="text-(--color-c2)">--color-ground-a</span>, so the file
        is opaque and independent of this page&apos;s rendering. The dashed
        circle marks LinkedIn&apos;s avatar and is not exported.
      </p>
    </div>
  );
}

function Btn({
  children,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-(--radius) border px-2.5 py-1.5 transition-colors duration-(--dur-fast) ${
        active
          ? "border-(--color-c2)/60 text-(--color-c2)"
          : "border-white/12 text-(--color-body) hover:border-(--color-c2)/40 hover:text-(--color-ink)"
      }`}
    >
      {children}
    </button>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 text-(--color-dim) opacity-70">[{children}]</span>
  );
}
