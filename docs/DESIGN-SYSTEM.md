# Design system — tayloraucoin.com

Palette **D · Gilt**. Dark blue-purple ground, gold and warm-white as the light.

Every value below is a CSS custom property declared in `app/globals.css` under Tailwind v4's `@theme`. **Nothing hardcodes a hex.** Swapping the entire palette is a one-file change.

---

## 1. Color

### Ground

| Token              | Hex       | Use                        |
| ------------------ | --------- | -------------------------- |
| `--color-ground-a` | `#060B1E` | Page top — deep blue       |
| `--color-ground-b` | `#151033` | Page bottom — purple drift |

The page background is a 172° linear gradient from `ground-a` to `ground-b`, with two radial glows over it (see §5).

### Accents

| Token        | Hex       | Role                                                                      |
| ------------ | --------- | ------------------------------------------------------------------------- |
| `--color-c1` | `#8B7BE8` | **Structure.** Violet. Circuit traces, the cold end of every gradient.    |
| `--color-c2` | `#E8B961` | **Gold.** The primary accent. Roots, CTAs, ring, numbers.                 |
| `--color-c3` | `#FFF6E3` | **Light.** Warm white. The hot end of gradients. Never used as body text. |

The house gradient is `linear-gradient(102deg, c2, c3)` for surfaces, and a conic sweep `c1 → c2 → c3` for rings.

### Text

| Token           | Hex                     | Use                             |
| --------------- | ----------------------- | ------------------------------- |
| `--color-ink`   | `#F1EFFA`               | Headings, primary text          |
| `--color-body`  | `#9C99BC`               | Paragraphs                      |
| `--color-dim`   | `#7E7CA0`               | Labels, metadata, mono eyebrows |
| `--color-faint` | `rgba(200,190,240,.11)` | Hairlines, dividers             |

### Surfaces

| Token                | Value                                                            |
| -------------------- | ---------------------------------------------------------------- |
| `--color-card`       | `rgba(9,12,34,.90)` — near-opaque. Required for text legibility. |
| `--color-card-hover` | `rgba(14,17,44,.94)`                                             |

**Contrast floor:** `--color-body` on `--color-card` must clear 4.5:1. It does. Any new text color must be checked before it ships.

### Runner-up palette (E · Reliquary)

Kept for reference. To switch, replace the three accent values and the two grounds:
`ground-a #011627 · ground-b #120E2E · c1 #A76EE8 · c2 #C792EA · c3 #E8B961`

---

## 2. Typography

Three families, three jobs. Loaded via `next/font/google`, self-hosted, `display: swap`.

| Role        | Family         | Weights       | Where                                                   |
| ----------- | -------------- | ------------- | ------------------------------------------------------- |
| **Display** | Space Grotesk  | 400, 500      | `h1`–`h3`, card headings, work row titles, stat numbers |
| **Body**    | Manrope        | 300, 400, 500 | Paragraphs, prose                                       |
| **Utility** | JetBrains Mono | 400, 500      | Eyebrows, section labels, metadata, buttons, footer     |

**Inter is banned.** It is the default and it reads as the default.

### The mono trick

All-caps, wide-tracked mono (`letter-spacing: .28em`) is doing the **"ancient / inscribed"** work in this design. That is how we get the _ancient futures_ register **without a single serif**. It is load-bearing. Do not replace mono labels with a sans.

### Scale

| Element              | Size                       | Weight | Tracking  | Leading |
| -------------------- | -------------------------- | ------ | --------- | ------- |
| `h1`                 | `clamp(40px, 5.6vw, 68px)` | 500    | `-.032em` | 1.02    |
| `h2` / section head  | 28px                       | 500    | `-.02em`  | 1.15    |
| Work row title       | 24px                       | 400    | `-.015em` | 1.2     |
| Card heading         | 18px                       | 500    | `-.012em` | 1.3     |
| Body                 | 16px                       | 300    | 0         | 1.66    |
| Card body            | 13.5px                     | 300    | 0         | 1.64    |
| Section label (mono) | 10px                       | 400    | `.28em`   | —       |
| Eyebrow (mono)       | 10px                       | 400    | `.30em`   | —       |
| Card tag (mono)      | 9px                        | 400    | `.24em`   | —       |
| Button (mono)        | 11px                       | 500    | `.10em`   | —       |

Body copy max width: **48ch**. Card copy: **44ch**.

---

## 3. Geometry

- **Radius: `3px`.** Everywhere. Sharp, not rounded. This is a deliberate signal — soft corners read consumer, and this is not a consumer site.
- Hairlines: `1px solid var(--color-faint)`.
- Ring: `1.5px`.
- Section rhythm: `64px` between major sections. `26px` after a section label.
- Page padding: `64px 56px` desktop, `40px 22px` mobile.
- Max content width: `1080px`.

---

## 4. Motion

| Token        | Value                      | Use                            |
| ------------ | -------------------------- | ------------------------------ |
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | Everything that moves in space |
| `--dur-fast` | `300ms`                    | Buttons, small hovers          |
| `--dur-base` | `450ms`                    | Card hover, row expand         |
| `--dur-slow` | `550ms`                    | Row gradient sweep             |

### Rules

- **Speed changes are lerped in JS, never done by swapping `animation-duration`.** Swapping duration restarts the keyframe. This bug shipped once. See `GradientRing.tsx`.
- **All fades ease.** No instant on/off. The field's cursor-glow gain lerps at `0.055` per frame.
- `prefers-reduced-motion: reduce` → the field renders one static frame, rings hold at their initial angle, all transitions collapse to 0ms.
- Motion intensity target: **6/10.** Ambient breathing + crafted reveals. Nothing bouncy, nothing playful.

---

## 5. Atmosphere

Two radial glows over the ground gradient. **Keep them low.** They were originally at ~30% and produced an unreadable aurora.

```css
radial-gradient(105% 55% at 84% 8%,  rgba(232,185,97,.10) 0%, transparent 55%),
radial-gradient(70% 40% at 4% 62%,   rgba(140,120,230,.09) 0%, transparent 60%)
```

Plus an SVG fractal-noise grain overlay at `opacity: .12`. The grain is what stops the gradients from banding.

---

## 6. Signature component — the root field

`components/field/RootField.tsx`. Canvas 2D. **Not WebGL, not Three.js.**

The one idea the whole site is built on: **a root system that becomes a circuit.**

- Trunks seed from the left edge (one per `SEED_DENSITY` px of page height) and from the bottom-left.
- They **branch recursively**, tapering in width and length with depth — like real roots.
- A `tech(x)` factor ramps from 0 to 1 across the horizontal axis. As it rises:
  - Branch angles **snap toward 45° multiples**.
  - Segment rendering switches from a **quadratic curve** (organic) to a **chamfered polyline with a rounded corner** (PCB trace).
  - Angular jitter and branch spread decay.
- Terminals in the tech zone get **vias** — a ring plus a solid center dot. Toggle with `SHOW_PADS`.
- Pulses travel along shallow segments in `c3`. Slow, sparse.
- Cursor proximity brightens nearby segments — **gated by `gain`**, which fades to 0 whenever the cursor is over any interactive element.

**45°, never 90°.** Real PCB traces route at 45°. Right angles were tried and read as janky.

### Tunables (props, defaults in `lib/config.ts`)

```ts
SHOW_PADS = true; // vias at branch terminals
RING_BASE = 0.55; // deg/frame, ring idle
RING_HOVER = 1.7; // deg/frame, ring hovered
GLOW_FADE = 0.055; // cursor-glow ease; lower = slower
SEED_DENSITY = 150; // px of page height per root trunk
```

---

## 7. Signature component — the gradient ring

`components/ui/GradientRing.tsx`. The "moving border" Taylor named unprompted, twice.

A conic gradient **masked to the border only**:

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}
```

> **`inherits: true` is mandatory.** The component writes `--angle` to the element in JS; the gradient lives on `::before`. With `inherits: false` the pseudo-element never sees the value and the ring silently freezes at 0deg. This bug shipped once and was invisible in screenshots.

```css
.ring::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  pointer-events: none;
  background: conic-gradient(
    from var(--angle),
    transparent 0deg,
    var(--color-c1) 50deg,
    var(--color-c2) 100deg,
    var(--color-c3) 145deg,
    transparent 215deg
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
}
```

The mask is what makes the gradient exist **only in the 1.5px edge**. Without it, the gradient fills the box, the glass blur pulls it through, and you get the aurora bug.

Rotation is driven by `requestAnimationFrame` writing `--angle`. Hover lerps speed `RING_BASE → RING_HOVER` at `0.05`/frame.

---

## 8. Component states

| Component           | Idle                                     | Hover                                                                          |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| **Primary CTA**     | gold→white gradient fill, ink-dark text  | `translateY(-1px)`, gold glow shadow                                           |
| **Ghost CTA**       | translucent card bg, faint border        | gold border, brighter text, more opaque bg                                     |
| **Capability card** | card bg, ring at 82% opacity, base speed | bg warms toward gold, `translateY(-2px)`, gold shadow, ring 100% + accelerates |
| **Work row**        | hairline bottom border                   | `padding-left: 16px`, gold gradient sweeps L→R at 16% opacity, arrow fades in  |
| **Stat cell**       | translucent                              | slightly more opaque                                                           |

**Every one of these fades the field's cursor-glow to zero while hovered.**
