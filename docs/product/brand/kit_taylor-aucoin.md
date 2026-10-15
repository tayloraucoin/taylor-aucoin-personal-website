# Taylor Aucoin — brand kit

> Brand thread 3 of 3 · Part 2, as confirmed · 2026-10-14 · Plumb (colour, type), Gloss (naming), Turner (this file)
> Every hex and ratio in this file is generated from the same computed data as the contrast table, so values match by construction. Nothing here is a website redesign; it's the kit the site will be built from.

## 0. How to read this kit

- **Two colour directions are live: A · Black tie and B · Patina.** Taylor will run both in the repo and choose on the real site. Everything except the accent is shared.
- **Pillars** (pillars.md): Structured (dominant) · Crafted · Attuned. Every choice below names its pillar.
- **Essence:** The whole product, thought through.

## 1. Colour

### The rule in one line

Carbon carries everything. **A** spends gold only on details (ring, rule, focus, marks), the way gold is worn on black. **B** uses patina as the action and link colour. Lamplight is atmosphere only.

### Carbon (shared neutral) — leans warm

Built from the real dark ground (900) to the real light ground and dark-mode text (50). Hue drifts 85° → 75°, chroma ≤ 0.010: near-neutral with a warm cast, not beige. *Pillar: Structured.*

| Step | Hex | OKLCH (L C h) | Note |
|---|---|---|---|
| 50 | `#FBFAF7` | 0.985 0.004 85.0 | Light ground; dark-mode text |
| 100 | `#F4F1ED` | 0.960 0.006 83.9 | Light section tint |
| 200 | `#D1CDC7` | 0.850 0.010 82.8 | Dark secondary text; light hairline |
| 300 | `#B4B1AA` | 0.760 0.010 81.7 | Dark muted text |
| 400 | `#95928C` | 0.660 0.009 80.6 |  |
| 500 | `#74716C` | 0.550 0.008 79.4 | Strong border, both themes |
| 600 | `#4F4D48` | 0.420 0.008 78.3 | Light muted text |
| 700 | `#302D2A` | 0.300 0.007 77.2 | Light secondary text; dark hairline |
| 800 | `#1B1916` | 0.215 0.006 76.1 | Dark raised surface |
| 900 | `#100E0B` | 0.165 0.006 75.0 | Dark ground; light text |

Light-theme raised surfaces are pure white, `#FFFFFF`.

### Gold (Direction A) — anchored at its natural step, 300

*Pillar: Crafted.* Detail only.

| Step | Hex | OKLCH (L C h) | Note |
|---|---|---|---|
| 50 | `#FFF6E6` | 0.975 0.023 81.4 | chroma reduced to stay in sRGB |
| 100 | `#FCEBCC` | 0.945 0.045 81.4 |  |
| 200 | `#F4D49D` | 0.885 0.080 81.4 | Ring end (A light) |
| 300 | `#E8B961` | 0.810 0.119 81.4 | **The gold.** A: marks, ring, rule, focus (dark) |
| 400 | `#CC9C3B` | 0.720 0.125 81.4 |  |
| 500 | `#AC8128` | 0.630 0.115 81.4 |  |
| 600 | `#8C681C` | 0.540 0.100 81.4 | A light: marks and focus |
| 700 | `#6D5011` | 0.450 0.085 81.4 |  |
| 800 | `#4F3909` | 0.360 0.068 81.4 |  |
| 900 | `#332405` | 0.270 0.050 81.4 |  |

### Patina (Direction B) — anchored at its natural step, 400

*Pillar: Structured.* Formerly "verdigris"; the name is retired.

| Step | Hex | OKLCH (L C h) | Note |
|---|---|---|---|
| 50 | `#EEFAF8` | 0.975 0.012 185.0 |  |
| 100 | `#D8EFEC` | 0.935 0.025 185.0 |  |
| 200 | `#B6E0DA` | 0.875 0.045 185.0 |  |
| 300 | `#92CDC4` | 0.805 0.062 185.0 | B dark: button hover |
| 400 | `#71BBB1` | 0.741 0.076 184.8 | **The patina.** B dark: button, links, marks, focus |
| 500 | `#529B92` | 0.640 0.075 185.0 |  |
| 600 | `#3E7F77` | 0.550 0.068 185.0 | B light: marks and focus |
| 700 | `#2D635C` | 0.460 0.058 185.0 | B light: button, links |
| 800 | `#1E4843` | 0.370 0.048 185.0 | B light: button hover |
| 900 | `#0E2C29` | 0.270 0.036 185.0 |  |

### Lamplight (shared atmosphere)

`#E1CEB0` (OKLCH 0.860 0.045 80). *Pillar: Attuned.* Used only as the warm radial glow (`rgba(225,206,176,.10)` on dark, `.22` on light) and as the middle stop of the dark-theme ring. Never behind body text. A fractal-noise grain at 0.10 opacity sits over the dark ground only.

### Theme tokens

**A · Black tie, dark**

| Role | Token | Hex |
|---|---|---|
| Page ground | carbon-900 | `#100E0B` |
| Raised surface (cards) | carbon-800 | `#1B1916` |
| Text | carbon-50 | `#FBFAF7` |
| Secondary text | carbon-200 | `#D1CDC7` |
| Muted text (meta, labels) | carbon-300 | `#B4B1AA` |
| Primary button fill | carbon-50 | `#FBFAF7` |
| Primary button hover | carbon-100 | `#F4F1ED` |
| Primary button text | carbon-900 | `#100E0B` |
| Marks: link underline, arrows, active states | gold-300 | `#E8B961` |
| Focus ring (2px, offset 2px) | gold-300 | `#E8B961` |
| Strong border (inputs, ghost button) | carbon-500 | `#74716C` |
| Hairline (decorative) | carbon-700 | `#302D2A` |
| Moving ring (cold → warm → light) | gold-300 → lamplight → carbon-50 | `#E8B961` → `#E1CEB0` → `#FBFAF7` |

**A · Black tie, light**

| Role | Token | Hex |
|---|---|---|
| Page ground | carbon-50 | `#FBFAF7` |
| Raised surface (cards) | white | `#FFFFFF` |
| Section tint | carbon-100 | `#F4F1ED` |
| Text | carbon-900 | `#100E0B` |
| Secondary text | carbon-700 | `#302D2A` |
| Muted text (meta, labels) | carbon-600 | `#4F4D48` |
| Primary button fill | carbon-900 | `#100E0B` |
| Primary button hover | carbon-700 | `#302D2A` |
| Primary button text | carbon-50 | `#FBFAF7` |
| Marks: link underline, arrows, active states | gold-600 | `#8C681C` |
| Focus ring (2px, offset 2px) | gold-600 | `#8C681C` |
| Strong border (inputs, ghost button) | carbon-500 | `#74716C` |
| Hairline (decorative) | carbon-200 | `#D1CDC7` |
| Accent rule (decorative) | gold-300 | `#E8B961` |
| Moving ring (cold → warm → light) | gold-600 → gold-300 → gold-200 | `#8C681C` → `#E8B961` → `#F4D49D` |

**B · Patina, dark**

| Role | Token | Hex |
|---|---|---|
| Page ground | carbon-900 | `#100E0B` |
| Raised surface (cards) | carbon-800 | `#1B1916` |
| Text | carbon-50 | `#FBFAF7` |
| Secondary text | carbon-200 | `#D1CDC7` |
| Muted text (meta, labels) | carbon-300 | `#B4B1AA` |
| Primary button fill | patina-400 | `#71BBB1` |
| Primary button hover | patina-300 | `#92CDC4` |
| Primary button text | carbon-900 | `#100E0B` |
| Accent text (links, eyebrow) | patina-400 | `#71BBB1` |
| Marks: link underline, arrows, active states | patina-400 | `#71BBB1` |
| Focus ring (2px, offset 2px) | patina-400 | `#71BBB1` |
| Strong border (inputs, ghost button) | carbon-500 | `#74716C` |
| Hairline (decorative) | carbon-700 | `#302D2A` |
| Moving ring (cold → warm → light) | patina-400 → lamplight → carbon-50 | `#71BBB1` → `#E1CEB0` → `#FBFAF7` |

**B · Patina, light**

| Role | Token | Hex |
|---|---|---|
| Page ground | carbon-50 | `#FBFAF7` |
| Raised surface (cards) | white | `#FFFFFF` |
| Section tint | carbon-100 | `#F4F1ED` |
| Text | carbon-900 | `#100E0B` |
| Secondary text | carbon-700 | `#302D2A` |
| Muted text (meta, labels) | carbon-600 | `#4F4D48` |
| Primary button fill | patina-700 | `#2D635C` |
| Primary button hover | patina-800 | `#1E4843` |
| Primary button text | carbon-50 | `#FBFAF7` |
| Accent text (links, eyebrow) | patina-700 | `#2D635C` |
| Marks: link underline, arrows, active states | patina-600 | `#3E7F77` |
| Focus ring (2px, offset 2px) | patina-600 | `#3E7F77` |
| Strong border (inputs, ghost button) | carbon-500 | `#74716C` |
| Hairline (decorative) | carbon-200 | `#D1CDC7` |
| Moving ring (cold → warm → light) | patina-600 → patina-400 → patina-200 | `#3E7F77` → `#71BBB1` → `#B6E0DA` |

### Colour laws

1. **Gold is never text on a light ground**, and never a large fill, a shiny metallic gradient, or on Taylor's name (A).
2. **The primary button is the same value in every state of a theme.** No brown variants.
3. **Links are underlined** (1px, 3px offset) in both directions, so colour is never the only cue. A: text-coloured with a gold underline. B: patina text, underlined.
4. **The focus ring is 2px solid, offset 2px from the control**, so it's measured against the ground, never against a button fill.
5. **No status roles yet** (success, warning, destructive). When one is added, destructive is red-hued, differs from the accent in lightness, and carries an icon.
6. **Quiet is bought with size, weight and tracking, never with alpha below the contrast floor.**

## 2. Contrast

Method, computed 2026-10-14:
- **Gate:** WCAG 2.x ratio. Text needs 4.5:1. The focus ring, borders and meaningful marks need 3:1.
- **Colour-vision check:** each pair is re-computed after Machado et al. (2009) protan and deutan simulation at severity 1.0, in linear RGB. A pair passes only if it passes in all three.
- **APCA Lc:** advisory only. The WCAG 3 Working Draft of 10 Sept 2026 states its contrast algorithm is yet to be determined.
- **Flags:** *verified* = passes in all three computations. *unverified* = passes in code, but a light accent on a dark ground still needs an on-screen eye check (saturated accents can look lighter than they measure). *exempt* = decorative, no requirement; the ratio is recorded anyway.
- **Not in the table:** button fills against the page. Per W3C's Understanding SC 1.4.11, a control with a visible text label needs no 3:1 boundary; its focus indicator does, and that's in the table.

**73 required pairs: 63 verified, 10 unverified (pass in code, eye check pending), 0 failing. Plus 6 decorative pairs recorded as exempt.**

| Theme | Foreground on background | Hex pair | Need | WCAG 2.x | Protan / deutan | APCA Lc (advisory) | Flag |
|---|---|---|---|---|---|---|---|
| A dark | text on ground | `#FBFAF7` / `#100E0B` | 4.5:1 | 18.46:1 | 18.49 / 18.49 | -104.2 | verified |
| A dark | text2 on ground | `#D1CDC7` / `#100E0B` | 4.5:1 | 12.18:1 | 12.14 / 12.26 | -76.2 | verified |
| A dark | muted on ground | `#B4B1AA` / `#100E0B` | 4.5:1 | 9.0:1 | 8.99 / 9.09 | -59.8 | verified |
| A dark | mark on ground | `#E8B961` / `#100E0B` | 3.0:1 | 10.59:1 | 9.82 / 11.11 | — | unverified (eye check, rule 8) |
| A dark | focus on ground | `#E8B961` / `#100E0B` | 3.0:1 | 10.59:1 | 9.82 / 11.11 | — | unverified (eye check, rule 8) |
| A dark | border strong on ground | `#74716C` / `#100E0B` | 3.0:1 | 3.97:1 | 3.95 / 4.0 | — | verified |
| A dark | text on surface | `#FBFAF7` / `#1B1916` | 4.5:1 | 16.8:1 | 16.84 / 16.84 | -103.3 | verified |
| A dark | text2 on surface | `#D1CDC7` / `#1B1916` | 4.5:1 | 11.08:1 | 11.06 / 11.16 | -75.3 | verified |
| A dark | muted on surface | `#B4B1AA` / `#1B1916` | 4.5:1 | 8.19:1 | 8.19 / 8.28 | -58.9 | verified |
| A dark | mark on surface | `#E8B961` / `#1B1916` | 3.0:1 | 9.64:1 | 8.94 / 10.12 | — | unverified (eye check, rule 8) |
| A dark | focus on surface | `#E8B961` / `#1B1916` | 3.0:1 | 9.64:1 | 8.94 / 10.12 | — | unverified (eye check, rule 8) |
| A dark | border strong on surface | `#74716C` / `#1B1916` | 3.0:1 | 3.61:1 | 3.59 / 3.64 | — | verified |
| A dark | on fill on fill | `#100E0B` / `#FBFAF7` | 4.5:1 | 18.46:1 | 18.49 / 18.49 | 102.6 | verified |
| A dark | on fill on fill_hover | `#100E0B` / `#F4F1ED` | 4.5:1 | 17.12:1 | 17.08 / 17.22 | 97.5 | verified |
| A light | text on ground | `#100E0B` / `#FBFAF7` | 4.5:1 | 18.46:1 | 18.49 / 18.49 | 102.6 | verified |
| A light | text2 on ground | `#302D2A` / `#FBFAF7` | 4.5:1 | 13.11:1 | 13.19 / 13.02 | 97.3 | verified |
| A light | muted on ground | `#4F4D48` / `#FBFAF7` | 4.5:1 | 8.09:1 | 8.12 / 8.09 | 86.1 | verified |
| A light | mark on ground | `#8C681C` / `#FBFAF7` | 3.0:1 | 4.89:1 | 5.28 / 4.65 | — | verified |
| A light | focus on ground | `#8C681C` / `#FBFAF7` | 3.0:1 | 4.89:1 | 5.28 / 4.65 | — | verified |
| A light | border strong on ground | `#74716C` / `#FBFAF7` | 3.0:1 | 4.66:1 | 4.69 / 4.62 | — | verified |
| A light | text on surface | `#100E0B` / `#FFFFFF` | 4.5:1 | 19.27:1 | 19.3 / 19.3 | 105.6 | verified |
| A light | text2 on surface | `#302D2A` / `#FFFFFF` | 4.5:1 | 13.69:1 | 13.77 / 13.59 | 100.2 | verified |
| A light | muted on surface | `#4F4D48` / `#FFFFFF` | 4.5:1 | 8.44:1 | 8.47 / 8.44 | 89.1 | verified |
| A light | mark on surface | `#8C681C` / `#FFFFFF` | 3.0:1 | 5.11:1 | 5.51 / 4.85 | — | verified |
| A light | focus on surface | `#8C681C` / `#FFFFFF` | 3.0:1 | 5.11:1 | 5.51 / 4.85 | — | verified |
| A light | border strong on surface | `#74716C` / `#FFFFFF` | 3.0:1 | 4.86:1 | 4.89 / 4.82 | — | verified |
| A light | text on section | `#100E0B` / `#F4F1ED` | 4.5:1 | 17.12:1 | 17.08 / 17.22 | 97.5 | verified |
| A light | text2 on section | `#302D2A` / `#F4F1ED` | 4.5:1 | 12.16:1 | 12.18 / 12.13 | 92.1 | verified |
| A light | muted on section | `#4F4D48` / `#F4F1ED` | 4.5:1 | 7.5:1 | 7.49 / 7.53 | 81.0 | verified |
| A light | mark on section | `#8C681C` / `#F4F1ED` | 3.0:1 | 4.54:1 | 4.88 / 4.33 | — | verified |
| A light | focus on section | `#8C681C` / `#F4F1ED` | 3.0:1 | 4.54:1 | 4.88 / 4.33 | — | verified |
| A light | border strong on section | `#74716C` / `#F4F1ED` | 3.0:1 | 4.32:1 | 4.33 / 4.3 | — | verified |
| A light | on fill on fill | `#FBFAF7` / `#100E0B` | 4.5:1 | 18.46:1 | 18.49 / 18.49 | -104.2 | verified |
| A light | on fill on fill_hover | `#FBFAF7` / `#302D2A` | 4.5:1 | 13.11:1 | 13.19 / 13.02 | -100.0 | verified |
| B dark | text on ground | `#FBFAF7` / `#100E0B` | 4.5:1 | 18.46:1 | 18.49 / 18.49 | -104.2 | verified |
| B dark | text2 on ground | `#D1CDC7` / `#100E0B` | 4.5:1 | 12.18:1 | 12.14 / 12.26 | -76.2 | verified |
| B dark | muted on ground | `#B4B1AA` / `#100E0B` | 4.5:1 | 9.0:1 | 8.99 / 9.09 | -59.8 | verified |
| B dark | accent text on ground | `#71BBB1` / `#100E0B` | 4.5:1 | 8.67:1 | 9.21 / 8.31 | -58.1 | unverified (eye check, rule 8) |
| B dark | mark on ground | `#71BBB1` / `#100E0B` | 3.0:1 | 8.67:1 | 9.21 / 8.31 | — | unverified (eye check, rule 8) |
| B dark | focus on ground | `#71BBB1` / `#100E0B` | 3.0:1 | 8.67:1 | 9.21 / 8.31 | — | unverified (eye check, rule 8) |
| B dark | border strong on ground | `#74716C` / `#100E0B` | 3.0:1 | 3.97:1 | 3.95 / 4.0 | — | verified |
| B dark | text on surface | `#FBFAF7` / `#1B1916` | 4.5:1 | 16.8:1 | 16.84 / 16.84 | -103.3 | verified |
| B dark | text2 on surface | `#D1CDC7` / `#1B1916` | 4.5:1 | 11.08:1 | 11.06 / 11.16 | -75.3 | verified |
| B dark | muted on surface | `#B4B1AA` / `#1B1916` | 4.5:1 | 8.19:1 | 8.19 / 8.28 | -58.9 | verified |
| B dark | accent text on surface | `#71BBB1` / `#1B1916` | 4.5:1 | 7.89:1 | 8.39 / 7.56 | -57.2 | unverified (eye check, rule 8) |
| B dark | mark on surface | `#71BBB1` / `#1B1916` | 3.0:1 | 7.89:1 | 8.39 / 7.56 | — | unverified (eye check, rule 8) |
| B dark | focus on surface | `#71BBB1` / `#1B1916` | 3.0:1 | 7.89:1 | 8.39 / 7.56 | — | unverified (eye check, rule 8) |
| B dark | border strong on surface | `#74716C` / `#1B1916` | 3.0:1 | 3.61:1 | 3.59 / 3.64 | — | verified |
| B dark | on fill on fill | `#100E0B` / `#71BBB1` | 4.5:1 | 8.67:1 | 9.21 / 8.31 | 59.8 | verified |
| B dark | on fill on fill_hover | `#100E0B` / `#92CDC4` | 4.5:1 | 10.78:1 | 11.31 / 10.4 | 70.4 | verified |
| B light | text on ground | `#100E0B` / `#FBFAF7` | 4.5:1 | 18.46:1 | 18.49 / 18.49 | 102.6 | verified |
| B light | text2 on ground | `#302D2A` / `#FBFAF7` | 4.5:1 | 13.11:1 | 13.19 / 13.02 | 97.3 | verified |
| B light | muted on ground | `#4F4D48` / `#FBFAF7` | 4.5:1 | 8.09:1 | 8.12 / 8.09 | 86.1 | verified |
| B light | accent text on ground | `#2D635C` / `#FBFAF7` | 4.5:1 | 6.59:1 | 6.21 / 6.9 | 80.6 | verified |
| B light | mark on ground | `#3E7F77` / `#FBFAF7` | 3.0:1 | 4.46:1 | 4.17 / 4.67 | — | verified |
| B light | focus on ground | `#3E7F77` / `#FBFAF7` | 3.0:1 | 4.46:1 | 4.17 / 4.67 | — | verified |
| B light | border strong on ground | `#74716C` / `#FBFAF7` | 3.0:1 | 4.66:1 | 4.69 / 4.62 | — | verified |
| B light | text on surface | `#100E0B` / `#FFFFFF` | 4.5:1 | 19.27:1 | 19.3 / 19.3 | 105.6 | verified |
| B light | text2 on surface | `#302D2A` / `#FFFFFF` | 4.5:1 | 13.69:1 | 13.77 / 13.59 | 100.2 | verified |
| B light | muted on surface | `#4F4D48` / `#FFFFFF` | 4.5:1 | 8.44:1 | 8.47 / 8.44 | 89.1 | verified |
| B light | accent text on surface | `#2D635C` / `#FFFFFF` | 4.5:1 | 6.88:1 | 6.48 / 7.2 | 83.6 | verified |
| B light | mark on surface | `#3E7F77` / `#FFFFFF` | 3.0:1 | 4.66:1 | 4.35 / 4.87 | — | verified |
| B light | focus on surface | `#3E7F77` / `#FFFFFF` | 3.0:1 | 4.66:1 | 4.35 / 4.87 | — | verified |
| B light | border strong on surface | `#74716C` / `#FFFFFF` | 3.0:1 | 4.86:1 | 4.89 / 4.82 | — | verified |
| B light | text on section | `#100E0B` / `#F4F1ED` | 4.5:1 | 17.12:1 | 17.08 / 17.22 | 97.5 | verified |
| B light | text2 on section | `#302D2A` / `#F4F1ED` | 4.5:1 | 12.16:1 | 12.18 / 12.13 | 92.1 | verified |
| B light | muted on section | `#4F4D48` / `#F4F1ED` | 4.5:1 | 7.5:1 | 7.49 / 7.53 | 81.0 | verified |
| B light | accent text on section | `#2D635C` / `#F4F1ED` | 4.5:1 | 6.11:1 | 5.73 / 6.42 | 75.5 | verified |
| B light | mark on section | `#3E7F77` / `#F4F1ED` | 3.0:1 | 4.14:1 | 3.85 / 4.35 | — | verified |
| B light | focus on section | `#3E7F77` / `#F4F1ED` | 3.0:1 | 4.14:1 | 3.85 / 4.35 | — | verified |
| B light | border strong on section | `#74716C` / `#F4F1ED` | 3.0:1 | 4.32:1 | 4.33 / 4.3 | — | verified |
| B light | on fill on fill | `#FBFAF7` / `#2D635C` | 4.5:1 | 6.59:1 | 6.21 / 6.9 | -85.3 | verified |
| B light | on fill on fill_hover | `#FBFAF7` / `#1E4843` | 4.5:1 | 9.75:1 | 9.31 / 10.06 | -94.3 | verified |
| A dark | hairline on ground | `#302D2A` / `#100E0B` | — | 1.41:1 | 1.4 / 1.42 | — | exempt (decorative, no requirement) |
| A light | hairline on ground | `#D1CDC7` / `#FBFAF7` | — | 1.52:1 | 1.52 / 1.51 | — | exempt (decorative, no requirement) |
| A light | rule (gold-300) on ground | `#E8B961` / `#FBFAF7` | — | 1.74:1 | 1.88 / 1.66 | — | exempt (decorative, no requirement) |
| B dark | hairline on ground | `#302D2A` / `#100E0B` | — | 1.41:1 | 1.4 / 1.42 | — | exempt (decorative, no requirement) |
| B light | hairline on ground | `#D1CDC7` / `#FBFAF7` | — | 1.52:1 | 1.52 / 1.51 | — | exempt (decorative, no requirement) |
| B light | ring mid (patina-400) on ground | `#71BBB1` / `#FBFAF7` | — | 2.13:1 | 2.01 / 2.23 | — | exempt (decorative, no requirement) |

## 3. Type

Three faces, three jobs. All three are SIL Open Font License 1.1, confirmed in the google/fonts repository (`ofl/*/METADATA.pb`) and, for Instrument Sans, in the font file's own name table.

| Role | Face | Weights used | Variable axes | Why (pillar) | Why not the default |
|---|---|---|---|---|---|
| Titles | **Instrument Sans**, full width (wdth 100) | 500, 600 | wdth 75–100, wght 400–700 | Precise and calm with warm terminal details (Structured, Crafted) | Not Inter or Geist; no company's brand face |
| Body and interface | **Albert Sans** | 400, 500 | wght 100–900 | Light, clean reading (Attuned) | Chosen by eye over Schibsted, Atkinson and Host |
| Code and technical data only | **Fragment Mono** | 400 | static (Regular, Italic) | Grotesque skeleton matches the other two (Structured) | Not JetBrains or Geist Mono; never used for labels |

Fallback stacks: `"Instrument Sans", system-ui, sans-serif` · `"Albert Sans", system-ui, sans-serif` · `"Fragment Mono", ui-monospace, monospace`.

### Scale

| Role | Face | Size | Weight | Line height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Display (name, h1) | Instrument Sans | clamp(48px, 7vw, 76px) | 600 | 1.0 | −0.03em | Never a gradient |
| Headline (essence line) | Instrument Sans | clamp(24px, 3.2vw, 32px) | 500 | 1.15 | −0.015em | |
| Heading 2 (section) | Instrument Sans | 30px | 600 | 1.15 | −0.02em | |
| Heading 3 (case study) | Instrument Sans | 24px | 600 | 1.2 | −0.015em | |
| Heading 4 (card) | Instrument Sans | 20px | 600 | 1.25 | −0.01em | |
| Stat number | Instrument Sans | 44px | 600 | 1.0 | −0.03em | Tabular numerals |
| Lede | Albert Sans | 19px | 400 | 1.6 | 0 | Max 56ch |
| Body | Albert Sans | 17px (16px under 640px) | 400 | 1.7 | 0 | Max 65ch |
| Quote | Albert Sans | 20px | 400 | 1.55 | 0 | Max 54ch |
| Small body (cards) | Albert Sans | 15px | 400 | 1.6 | 0 | |
| Meta | Albert Sans | 13px | 400 | 1.5 | 0 | Muted |
| Label / eyebrow | Albert Sans | 12px | 500 | 1.4 | +0.2em | Uppercase, muted, with the accent rule before it. The smallest text in the system |
| Button | Albert Sans | 15px | 500 | 1 | 0 | Sentence case; names the consequence |
| Code block | Fragment Mono | 14px | 400 | 1.7 | 0 | Inline code at 0.88em |

## 4. Logo (placeholders)

All logo files are **placeholders**: drafted to fill real slots, to be refined or replaced. Each SVG carries "(placeholder)" in its title.

| File | What it is |
|---|---|
| `wordmark-ink.svg` | "Taylor Aucoin," outlined from Instrument Sans 600, tracking −0.02em, with the font's own kerning, in carbon-900 |
| `wordmark-offwhite.svg` | The same, in carbon-50, for dark grounds |
| `monogram-a-dark.svg` / `monogram-a-light.svg` | TA (tracking −0.07em) above the gold-300 accent rule, on carbon-900 / carbon-50 |
| `monogram-b-dark.svg` / `monogram-b-light.svg` | The same with the patina rule (patina-400 on dark, patina-600 on light) |

- **The accent rule** (22% of tile width, 3.2% of tile height) is the brand's one recurring device: it also sits before every label.
- **Clear space:** at least the height of the T's crossbar-to-baseline gap on every side. [ASSUMPTION: to confirm on refinement]
- **Minimum sizes:** wordmark 96px wide; monogram 24px. At 16px the rule all but disappears, so the favicon will likely be TA alone. [open]
- **Never:** a gradient on the wordmark, gold-filled letters, or a rotated or outlined name.
- **Licence:** OFL 1.1 permits a logo made from the font's outlines.

## 5. Imagery, headshot, motion

- **Imagery:** real artifacts only (product screens, paper design files, diagrams of decisions), flat on the ground with a 1px hairline and 3px radius. *Crafted, Structured.*
- **Headshot:** keep the current one (`public/images/me-headshot-1.png`) for now, graded to sit on carbon, slightly warm, never cut out or duotoned. On a reshoot: shoulders up, direct to camera, relaxed, one warm side light like lamplight in a dark room, plain dark background. *Attuned, Structured.*
- **Motion:** slow, eased, informative. *Structured but not rigid.*
  - Easing `cubic-bezier(.22,1,.36,1)`; durations 200ms (small hovers), 400ms (cards, rows), 600ms (reveals).
  - The masked moving ring: one turn per 9s at rest, about 3.5s on hover. Speed changes are interpolated in script, never by swapping `animation-duration` (which restarts the animation). The gradient lives only in the 1.5px masked edge, never behind content.
  - Reveals settle once; nothing loops for attention.
  - `prefers-reduced-motion: reduce` stops the ring and collapses transitions to 0ms.
- **Retired:** the root-to-circuit field from the old site. [ASSUMPTION: Taylor can bring it back]

## 6. Geometry

- Radius **3px** everywhere. Hairlines **1px**. Ring **1.5px**.
- Spacing on a 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Sections 64px apart (96px on wide screens).
- Body copy capped at 65ch.

## 7. Never-list

Beyond the usual AI-design tells (purple-to-blue gradients, glassmorphism, emoji, generic 3D blobs, Inter):

1. No gold in large fills, no shiny metallic gradients, no gold text on light grounds.
2. No gradient behind body text, and none on the name. Gradients live only in the ring and the atmosphere.
3. No stock photos, no AI-generated people or scenes, no robot, brain or glowing-circuit imagery.
4. No logo without permission, no metric without a source, no unnamed testimonial.
5. No bento grids, neon, glitch effects or scanlines.
6. No beige light theme, no condensed titles, no serif headlines.
7. No pill-shaped buttons or soft consumer corners.
8. No conscious-culture imagery in the professional brand; it stays undertone.

## 8. Translation table

| System | Choice | Pillar |
|---|---|---|
| Neutrals | Carbon ramp, leaning warm, `#100E0B` to `#FBFAF7` | Structured |
| Accent, A · Black tie | Gold `#E8B961` as detail only: ring, rule, focus, marks | Crafted |
| Accent, B · Patina | Patina `#71BBB1` (dark) and `#2D635C` (light) for buttons, links and marks | Structured |
| Atmosphere | Lamplight `#E1CEB0` glow, low, never behind text | Attuned |
| Light theme | Off-white `#FBFAF7`, white cards | Structured |
| Titles | Instrument Sans 500–600, tight tracking | Structured, Crafted |
| Body and interface | Albert Sans 400–500, open line height | Attuned |
| Code | Fragment Mono 400, code and technical data only | Structured |
| Logo | Outlined wordmark; TA monogram with the accent rule (placeholders) | Crafted |
| Voice | Decisions with reasons, specifics, invitations; plain, first person (voice.md) | All three |
| Imagery | Real artifacts on the ground, hairline edge | Crafted |
| Headshot | Warm grade on carbon; one side light on a reshoot | Attuned |
| Motion | Slow masked ring, eased reveals, reduced motion honoured | Structured |
| Geometry | 3px radius, 1px hairlines, focus ring offset 2px | Structured |
| Accessibility floor | Text 4.5:1, marks 3:1, colour-blind checked | Attuned |

## 9. Tokens (CSS custom properties)

Generated from the same data as the tables above.

```css
:root[data-direction="a"] {
  --ground: #100E0B;
  --surface: #1B1916;
  --text: #FBFAF7;
  --text2: #D1CDC7;
  --muted: #B4B1AA;
  --fill: #FBFAF7;
  --fill-hover: #F4F1ED;
  --on-fill: #100E0B;
  --mark: #E8B961;
  --focus: #E8B961;
  --border-strong: #74716C;
  --hairline: #302D2A;
  --ring-a: #E8B961; --ring-b: #E1CEB0; --ring-c: #FBFAF7;
}

:root[data-direction="a"][data-theme="light"] {
  --ground: #FBFAF7;
  --surface: #FFFFFF;
  --section: #F4F1ED;
  --text: #100E0B;
  --text2: #302D2A;
  --muted: #4F4D48;
  --fill: #100E0B;
  --fill-hover: #302D2A;
  --on-fill: #FBFAF7;
  --mark: #8C681C;
  --focus: #8C681C;
  --border-strong: #74716C;
  --hairline: #D1CDC7;
  --rule: #E8B961;
  --ring-a: #8C681C; --ring-b: #E8B961; --ring-c: #F4D49D;
}

:root[data-direction="b"] {
  --ground: #100E0B;
  --surface: #1B1916;
  --text: #FBFAF7;
  --text2: #D1CDC7;
  --muted: #B4B1AA;
  --fill: #71BBB1;
  --fill-hover: #92CDC4;
  --on-fill: #100E0B;
  --accent-text: #71BBB1;
  --mark: #71BBB1;
  --focus: #71BBB1;
  --border-strong: #74716C;
  --hairline: #302D2A;
  --ring-a: #71BBB1; --ring-b: #E1CEB0; --ring-c: #FBFAF7;
}

:root[data-direction="b"][data-theme="light"] {
  --ground: #FBFAF7;
  --surface: #FFFFFF;
  --section: #F4F1ED;
  --text: #100E0B;
  --text2: #302D2A;
  --muted: #4F4D48;
  --fill: #2D635C;
  --fill-hover: #1E4843;
  --on-fill: #FBFAF7;
  --accent-text: #2D635C;
  --mark: #3E7F77;
  --focus: #3E7F77;
  --border-strong: #74716C;
  --hairline: #D1CDC7;
  --ring-a: #3E7F77; --ring-b: #71BBB1; --ring-c: #B6E0DA;
}
```

Type and geometry tokens (shared):

```css
:root {
  --font-title: "Instrument Sans", system-ui, sans-serif;
  --font-body: "Albert Sans", system-ui, sans-serif;
  --font-code: "Fragment Mono", ui-monospace, monospace;
  --radius: 3px;
  --hairline: 1px;
  --focus-width: 2px;
  --focus-offset: 2px;
  --ease: cubic-bezier(.22,1,.36,1);
  --dur-fast: 200ms;
  --dur-base: 400ms;
  --dur-slow: 600ms;
  --lamplight: #E1CEB0;
}
```
