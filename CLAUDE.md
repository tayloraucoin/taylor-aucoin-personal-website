# CLAUDE.md — tayloraucoin.com

You are implementing Taylor Aucoin's personal site. This file is the contract.

## The one rule

**If a design decision is not specified in `docs/DESIGN-SYSTEM.md` or `docs/SITE-SPEC.md`, stop and ask. Do not invent.**

The visual direction took many rounds of iteration with a human who rejected a lot. Defaults are not neutral here — reaching for a Tailwind default, a bento grid, or a stock blue-violet gradient is a regression, not a shortcut. When unspecified, ask.

Before you touch anything visual, read `docs/TASTE-PROFILE.md`. It records what Taylor rejected and why. That history is the spec as much as the tokens are.

## Stack

- **Next.js 15**, App Router, TypeScript strict
- **Tailwind CSS v4** — CSS-first `@theme` in `app/globals.css`. No `tailwind.config.js`.
- **Motion** (`motion/react`) for orchestration only. CSS for anything ambient.
- **No component library.** No shadcn, no Aceternity, no Magic UI. We borrow _techniques_ from that world; we do not ship its look. Everything is bespoke.
- Content is typed TS in `content/`. No CMS.
- Deploy: Vercel. Domain: `tayloraucoin.com`.

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # must pass before any PR
npm run lint
npx tsc --noEmit # strict — must be clean
```

## Non-negotiable invariants

These are laws. They were each learned by breaking them.

1. **Never put a gradient behind body copy.** Gradients live in borders, accents, buttons, and the background field — never under text. The original "moving border" bled through a glass card and made a beautiful, unreadable aurora. The border is a **masked ring**, and it stays one.
2. **The interface always wins over the atmosphere.** Hovering any interactive element (button, card, row, stat, link) fades the background field's cursor-glow to zero. A CTA must always be the brightest thing on screen.
3. **Gradient is rationed.** It appears on: the primary CTA, the card ring, the eyebrow rule, stat numbers, row indices, the field. It does **not** appear on Taylor's name, headings, or paragraphs. Gradient-on-the-name reads as amateur — his words.
4. **45°, never 90°.** The root field's circuit traces use 45° chamfered routing (how real PCBs route). Right-angle corners were tried and read as "janky."
5. **Never restart an animation on hover.** Changing `animation-duration` restarts the keyframe. Speed changes are lerped in JS. See `GradientRing.tsx`.
6. **Never snap a fade.** Cursor-glow gain is eased in and out. Instant cutoffs feel broken.
7. **`prefers-reduced-motion` is respected everywhere.** The field freezes to a static frame; rings stop; transitions collapse.
8. **LCP must not wait on the canvas.** The field mounts after paint and fades in. Hero text renders server-side.

## Known traps (these bugs already happened once)

**Tailwind v4 CSS-var syntax.** `text-[--color-c2]` is Tailwind **v3** idiom — v4 drops it silently and the class becomes a no-op (gold renders as inherited body color, hairlines inherit text color, radii collapse to 0, and nothing errors). The v4 syntax is `text-(--color-c2)`. This shipped broken across the whole site once and was invisible until a human asked why nothing was gold. Never write `-[--` in a class.

**`next/image` + `width:auto` renders the image at a fraction of its size.** With
`sizes="100vw"` the browser picks the largest srcset candidate (`3840w`), but the
optimizer never upscales past the source — so a 1536px capture arrives as a
1536px file while the srcset still claims 3840w. The browser reads that as a 3x
image and lays it out at a third of its size. A full-viewport diagram rendered
514px wide with nothing in the console. CSS `aspect-ratio` does not rescue it
either: it only derives a *missing* dimension, so it cannot shrink width when
max-height is the binding constraint. Anywhere an image must fit a box, pass an
**explicit pixel width/height** — see `MediaLightbox.tsx`, which computes the
fitted size from the intrinsic dimensions. Sizing with `w-full` (as the strip
thumbnails do) is immune; only `w-auto` exposes this.

`@property --angle` must be declared **`inherits: true`**. `GradientRing` writes `--angle` to the element in JS, but the conic-gradient lives on the `::before` pseudo-element. With `inherits: false`, the pseudo never sees the value and the ring silently freezes at 0deg. It looks like nothing is wrong. It is wrong.

## Do not

- Do not add a bento grid.
- Do not add a light mode.
- Do not use Inter.
- Do not make the background "more exciting." It is deliberately quiet at ~11% so text stays readable.
- Do not add a blog, a newsletter, or a "now" page. Those routes are reserved but out of scope for v1.
- Do not put DJ / music / festival content anywhere. Explicitly excluded for v1.
- Do not write copy in a startup-marketing voice. See `docs/TASTE-PROFILE.md` § voice.

## Working method

Work **one ticket at a time** from `docs/TICKETS.md`. Do not batch. After each ticket: `npm run build && npx tsc --noEmit`, then stop and report.

Copy in the repo today is placeholder. Taylor is writing the real copy himself. Do not "improve" it unprompted.
