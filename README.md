# tayloraucoin.com

Personal site. Next.js 15 · TypeScript · Tailwind v4.

## Run it

```bash
npm install
npm run dev
```

## Read these first, in this order

| File                    | What it is                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`             | The contract. Stack, invariants, the one rule. Claude Code loads this automatically.                                                                              |
| `docs/TASTE-PROFILE.md` | **Read this before touching anything visual.** Everything Taylor said, liked, and rejected, and why. The rejection history is as much the spec as the tokens are. |
| `docs/DESIGN-SYSTEM.md` | Tokens, type, motion, the two signature components.                                                                                                               |
| `docs/SITE-SPEC.md`     | Routes, sections, states, a11y and perf floors.                                                                                                                   |
| `docs/TICKETS.md`       | Ordered work. One at a time.                                                                                                                                      |

## How to drive Claude Code through this

Open Claude Code in the repo root. `CLAUDE.md` loads automatically. Then work **one ticket at a time**:

```
Implement WORK-03 from docs/TICKETS.md.
```

Not _"build me a website."_ The tickets exist because the failure mode of an agent on a design-heavy build is silent drift — it hits an unspecified state, reaches for a Tailwind default, and thirty files later the site looks like every other site.

**The rule that prevents that** is in `CLAUDE.md`:

> If a design decision is not specified in `docs/DESIGN-SYSTEM.md` or `docs/SITE-SPEC.md`, stop and ask. Do not invent.

Tickets marked `[SCAFFOLDED]` already have working code. Verify and wire them — do not rewrite them. `RootField.tsx` and `GradientRing.tsx` encode decisions that took many iterations and at least one invisible bug to get right.

## What you actually have to do (not Claude Code)

1. **Write the copy.** Everything in `content/work.ts` and the section components is `PLACEHOLDER`. This is deliberate — you said you'd write it in Cursor. Do that.
2. **Answer the media question.** Do you have screenshots for Conscious Connections, Everbook, Agora, and QxMD? The case template works without them, but if you have them, `content/work.ts` is the only file that changes.
3. **Fill the `decisions` array for each case study.** This is the highest-leverage writing on the entire site. It's the one thing a hiring manager cannot get from your résumé. If the design ships and the decisions are thin, the design has actively hurt you.
4. Drop `taylor-aucoin-resume.pdf` in `/public`. Fill in the real email/GitHub/LinkedIn in `lib/config.ts`.

## Switching the palette

Palette **D · Gilt** is live. The runner-up, **E · Reliquary** (gold + purple on Night Owl navy), is documented in `docs/DESIGN-SYSTEM.md`.

Every color in the site resolves to a token in the `@theme` block of `app/globals.css`. Switching palettes is **five values in one file**. Nothing else changes. That was the point.

## The knobs

`lib/config.ts`:

```ts
SHOW_PADS = true; // vias at branch terminals — flip to compare
RING_BASE = 0.55; // ring rotation, deg/frame, idle
RING_HOVER = 1.7; // ring rotation, deg/frame, hovered
GLOW_FADE = 0.055; // cursor-glow ease — lower = slower fade
SEED_DENSITY = 150; // px of page height per root trunk — higher = sparser
```
