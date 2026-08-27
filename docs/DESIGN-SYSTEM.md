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

| Token            | Hex       | Role                                                          |
| ---------------- | --------- | ------------------------------------------------------------- |
| `--color-action` | `#6D5CC0` | **Primary action fill.** Violet-600. The admin CRM's solid buttons. |

**`--color-c1` is structure and must never carry text.** It is the trace, ring,
and gradient-cold-end violet, tuned to sit *near* the ground — which is exactly
what makes it fail as a text or fill colour. White on `c1` measures **3.44:1**,
and it was the fill for all 13 solid buttons in the admin CRM. White on
`--color-action` (violet-600) is **5.33:1**. If a violet ever needs to carry
small text directly, violet-400 is the floor (7.1:1); see the ramp below.

### Text

Recalibrated per **D-CON-1** (below). Body and dim each lifted one night-ramp
step; hues unchanged, both grounds unchanged.

| Token                | Hex                     | Use                                                        |
| -------------------- | ----------------------- | ---------------------------------------------------------- |
| `--color-ink`        | `#F1EFFA`               | Headings, primary text (≈ night-100)                       |
| `--color-body`       | `#B0ADCD`               | Paragraphs — night-400. Was `#9C99BC`                      |
| `--color-dim`        | `#9C99BC`               | Labels, metadata, mono eyebrows — night-500. Was `#7E7CA0` |
| `--color-role-label` | `#7F7DA1`               | Selected Work role line — solid. Was dim at 55% α (2.2:1)  |
| `--color-proof-label`| `#B48934`               | Proof / attribution labels — gold-600. Was gold at 55% α (3.8:1) |
| `--color-faint`      | `rgba(200,190,240,.11)` | Hairlines, dividers                                        |

**`--color-proof-label` is the non-interactive twin of `--color-c2`.** Proof
and attribution labels come in pairs: where one has an `href` it renders in
`--color-c2` with a trailing arrow; where it does not, it renders in
`--color-proof-label`. Same gold family, visibly recessive, 5.9–6.1:1 measured
in place. The distinction is real information — clickable vs not — and it must
be carried by *hue depth*, not by dropping alpha below the floor. Consumed at
`CapabilityGrid.tsx` (×2) and `TestimonialCard.tsx`.

### Surfaces

| Token                | Value                                                            |
| -------------------- | ---------------------------------------------------------------- |
| `--color-card`       | `rgba(9,12,34,.90)` — near-opaque. Required for text legibility. |
| `--color-card-hover` | `rgba(14,17,44,.94)`                                             |

**Contrast floors (D-CON-1):** measured on the worst real ground — composited
over `ground-b`, and through the hero's gold glow (effective ground ≈
`#1D1C25`) for anything that sits there. `--color-body` holds **≥ 7:1 (AAA)**
everywhere (8.41:1 on ground-b, 7.79:1 in the glow). `--color-dim` holds
**≥ 6:1 on clean ground** and ≥ 4.5:1 inside the glow (6.18:1). Text at 4.5:1
exactly is not "passing" here — 9–10px wide-tracked caps over grain need
margin. Any new text color must be checked against these floors, on the
gradient, before it ships. **Quiet is bought with size, weight, and tracking —
never with alpha below the floor.**

### Ramps — 100–800, base at 500

Four families derived from the palette's own hexes (OKLCH; hue held per
family, lightness spaced from the 500 anchor, chroma easing toward the
extremes). **Only the night family is declared in `@theme`** — it is the text
spine. Gold/violet/cream steps are documentation: add one to `@theme` when a
component actually consumes it, not before. Ratios are on `ground-a` /
`ground-b` / white.

**night** — base 500 = `#9C99BC` (the pre-D-CON-1 body). Declared in `@theme`.

| Step | Hex       | on grounds       | Notes                                            |
| ---- | --------- | ---------------- | ------------------------------------------------ |
| 100  | `#EEEDFA` | 16.9 / 15.7      | ≈ `--color-ink` within a hair                    |
| 200  | `#D9D7EC` | 13.9 / 12.9      | ≈ paper hairline `#E3E1EC` (D-DOC-1)             |
| 300  | `#C4C2DD` | 11.3 / 10.5      |                                                  |
| 400  | `#B0ADCD` | 9.0 / 8.4        | **= `--color-body`**                             |
| 500  | `#9C99BC` | 7.2 / 6.7        | **= `--color-dim`**                              |
| 600  | `#6F6C8B` | 3.9 / 3.6        | ≈ paper dim `#6B6889` (D-DOC-1). Not text on dark |
| 700  | `#45425C` | 2.0 / 1.9        | ≈ paper body `#3F3C5C` (D-DOC-1)                 |
| 800  | `#1F1C2F` | 1.2 / 1.1        | Surface/tint depth only                          |

**gold** — base 500 = `#E8B961` (`--color-c2`, unchanged).

| Step | Hex       | on grounds  | on white | Notes                                        |
| ---- | --------- | ----------- | -------- | -------------------------------------------- |
| 100  | `#FDECD0` | 16.8 / 15.7 | 1.2      |                                              |
| 200  | `#F9DFB2` | 15.1 / 14.1 | 1.3      |                                              |
| 300  | `#F6D293` | 13.6 / 12.6 | 1.4      |                                              |
| 400  | `#F0C578` | 12.1 / 11.2 | 1.6      |                                              |
| 500  | `#E8B961` | 10.7 / 10.0 | 1.8      | The gold. Never text on white (D-DOC-1)      |
| 600  | `#B48934` | 6.1 / 5.7   | 3.2      | **= `--color-proof-label`.** Also the hover-dark for gold fills |
| 700  | `#815D07` | 3.3 / 3.0   | 6.0      | **First gold legal as text on white**        |
| 800  | `#4D3601` | 1.7 / 1.6   | 11.4     | Shadow/tint only                             |

**violet** — base 500 = `#8B7BE8` (`--color-c1`, unchanged). Structure-only
today; if violet ever speaks, **400 is the floor for small text on the ground**
(7.1:1); 500 is legal for normal-size only (5.3:1).

| Step | Hex       | on grounds  | Notes |
| ---- | --------- | ----------- | ----- |
| 100  | `#EAE9FF` | 16.4 / 15.3 |       |
| 200  | `#D0CDFF` | 12.9 / 12.0 |       |
| 300  | `#B8B1FE` | 10.0 / 9.3  |       |
| 400  | `#A195F8` | 7.6 / 7.1   | Floor for small violet text |
| 500  | `#8B7BE8` | 5.7 / 5.3   | `--color-c1` — structure only |
| 600  | `#6D5CC0` | 3.7 / 3.4   | **= `--color-action`** — as a *fill* under white text (5.33:1), never as text |
| 700  | `#504096` | 2.3 / 2.2   |       |
| 800  | `#35276A` | 1.5 / 1.4   |       |

**cream** — base 500 = `#FFF6E3` (`--color-c3`, unchanged). Honest asterisk:
100–400 are functionally indistinguishable from 500 (the base is already
L 0.975) and exist for scale symmetry only. The useful arm is 600–800 — warm
neutrals for paper surfaces and print tints.

| Step | Hex       | Notes                     |
| ---- | --------- | ------------------------- |
| 100–400 | `#FFFBF5`–`#FFF7E8` | Do not reach for these |
| 500  | `#FFF6E3` | The light                 |
| 600  | `#C2BAA9` | 10.1 / 9.4 on grounds     |
| 700  | `#888173` | 5.1 / 4.7 on grounds      |
| 800  | `#524D42` | 8.4:1 on white            |

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

## D-DOC-1 · Palette D on paper (documents: invoices, PDFs)

Ratified 2026-08-21 (Taylor: brand styles, white background). The light
variant of Palette D for client-facing business documents — invoice emails
and PDF attachments. **This supersedes the cream/rust of `how_we_work.pdf`,
which predates this system and is not part of Palette D.**

Tokens live in `lib/invoices/paper.ts` (`PAPER`), derived from this file's
palette rather than invented: `--color-ground-a` promoted from background to
ink; the violet-gray text ramp flipped for white; gold unchanged.

| Token | Value | Role |
|---|---|---|
| `paper` | `#ffffff` | The page. White on purpose — prints honestly |
| `tint` | `#f7f6fa` | The one surface (meta blocks); ground-a at ~3% |
| `ink` | `#060b1e` | Headings, amounts, totals — `--color-ground-a` |
| `body` | `#3f3c5c` | Prose — light counterpart of `--color-body` |
| `dim` | `#6b6889` | Labels, footer — counterpart of `--color-dim`, AA-corrected |
| `hairline` | `#e3e1ec` | Rules — counterpart of `--color-faint` |
| `gold` | `#e8b961` | `--color-c2`, unchanged. **Never text on paper** (~1.9:1 on white). Rules, chip fills, button fills with ink text — same law as the site CTA |

Same three families (Space Grotesk / Manrope / JetBrains Mono; vendored
subset TTFs in `server/assets/fonts/` for the PDF path), same mono grammar
(eyebrow masthead with the gold hairline trailing right), same 3px radius.
Renderers: `server/services/invoice-pdf.tsx` (PDF) and
`renderInvoiceEmailHtml` in `server/services/invoices.ts` (email) — both
consume `lib/invoices/document.ts`, neither carries its own hex.

## D-CON-1 · Contrast recalibration (the mid-tone lift)

Ratified 2026-08-26 (Taylor: "I like it," full audit + assessment approved).
Full rationale, measured matrix, and side-by-side previews: the "Gilt,
recalibrated" audit artifact
(https://claude.ai/code/artifact/429cb466-de8c-48cb-820e-b3ec59b4e8b0).

The finding: the strong pairs were genuinely strong (ink 16–17:1, gold 10+:1,
CTA 10.96:1) but three mid-tone text tokens carried the felt softness —
`role-label` at 2.2:1 (blocking), `dim` at 4.24:1 inside the hero's gold glow
(below AA exactly where the eyebrow sits), and 300-weight `body` dipping under
AAA on the purple end of the page.

The decision: **hold both grounds exactly where they are; lift the text
tokens.** Darkening `ground-b` as far as taste allows buys body copy +0.38 and
spends the purple drift; lifting the tokens one night-ramp step buys +1.7,
survives the glow zones, and leaves the atmosphere untouched. The old body
color did not retire — it stepped down one role and became the new dim, so hue
continuity is free. Ink, gold, violet, cream, both grounds, the glows, the
grain, and every existing law are unchanged.

Open until CON-02 QA: full step (shipped) vs half step (body `#A09DC0`, dim
`#9391B6` — same hues, half the lift), to be judged on the live site, not on
swatches. The half-step values are recorded in the `@theme` comment for a
two-line revert.
