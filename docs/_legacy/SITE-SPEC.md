# Site spec — tayloraucoin.com

## Purpose

A hiring manager lands here from a job application. They have **under sixty seconds**. The site must, in that window: establish seniority, prove range, and make the work openable.

Everything else is subordinate to that.

---

## Routes

| Route                    | Type                                                                     | Status |
| ------------------------ | ------------------------------------------------------------------------ | ------ |
| `/`                      | Home. Hero → Capabilities → Selected work → Signal → Footer              | **v1** |
| `/work/[slug]`           | Full case study page. Real URL, SEO-indexed, shareable.                  | **v1** |
| `/@modal/(.)work/[slug]` | The same case study **intercepted** as an overlay when clicked from `/`. | **v1** |
| `/stack`                 | Full skills taxonomy, eight categories. Content in `content/stack.ts`.   | **v1** |
| `/@modal/(.)stack`       | The same page **intercepted** as an overlay from the home stack line.    | **v1** |
| `/ventures`              | Reserved. Not built.                                                     | v2     |
| `/writing`               | Reserved. Not built.                                                     | v2     |
| `/media`                 | Reserved. Not built (podcast).                                           | v2     |

### Why intercepting routes

Taylor's favourite work pattern (from `saidalachgar.dev`) is a clickable row that opens a full-screen panel. Naively that's a client-side modal with no URL — which means you can't paste it into a job application.

Next.js **parallel + intercepting routes** give both: clicking a row from `/` opens the elegant overlay with no page load, _and_ the URL becomes `/work/conscious-connections`. Paste it, refresh it, or land on it cold and you get the full page. This is the senior version of the pattern and it is the reason the pattern was chosen.

Implementation:

- `app/layout.tsx` renders `{children}` and `{modal}`
- `app/@modal/default.tsx` → `return null`
- `app/@modal/(.)work/[slug]/page.tsx` → `<CaseOverlay>`
- `app/work/[slug]/page.tsx` → full page
- Both render the shared `<CaseBody>`

Overlay closes on: backdrop click, `Escape`, close button. All call `router.back()`.

---

## Home sections, in order

### 1. Hero

- Mono eyebrow: `Vancouver · Senior product engineer`, with a gold hairline trailing off to the right
- `h1`: **Taylor Aucoin** — plain `--color-ink`. **No gradient.**
- Sub: one paragraph, max 48ch
- Two CTAs: primary `Selected work →`, ghost `Résumé`

### 2. Capabilities

Two `GradientRing` cards. This is the section Taylor wanted after seeing `danielsantos.co`'s "what I can do for you" — but tuned for a hiring manager, not a client.

`01 / Architecture` · `02 / Product`. Copy is placeholder; Taylor is writing it.

Below the cards: a **core-stack line** — one mono, wide-tracked, dim line in the same register as Selected Work's "Also built ·" line (`10px`, uppercase, `.18em`, `--color-dim`), items separated by `·`, prefixed `Core stack ·`. Curated to ~14 items, defined in `lib/config.ts` as `CORE_STACK`; Taylor owns the final cut. **Not** chips, **not** logos, **not** a grid, **no** toggle.

The line ends with a gold `Full stack →` link to `/stack` — the complete eight-category taxonomy (content in `content/stack.ts`). From `/` it opens as the same intercepted overlay as the case studies (shared shell: `components/ui/Overlay.tsx`); pasted or refreshed it is a full page. Categories render as **`GradientRing` cards** (the Capabilities idiom, two-column): gold mono category label, items joined by `·` in body type. Items flagged `core` in `content/stack.ts` render **bold + ink** — they are the `CORE_STACK` curation — and a mono legend under the `h1` reads `Bold · core stack`.

The impressive specifics (RLS at 150+ tables, 200+ model schemas, the Keras recommender, etc.) should **also** land inside case-study **Decisions** sections as proof — the `/stack` page states them; the case studies substantiate them.

### 3. Selected work

Section label, then four rows:

| #   | Project               | Meta                             |
| --- | --------------------- | -------------------------------- |
| 01  | Conscious Connections | AI · Next.js · Supabase          |
| 02  | Everbook              | Realtime voice AI · Founding eng |
| 03  | Agora                 | Recommender · pgvector · Shopify |
| 04  | Calculate by QxMD     | Healthtech · Clinical tools      |

Each row: index (mono, gold) · title (display) · meta (mono, dim) · arrow (fades in on hover). Hover slides the row right 16px and sweeps a gold gradient L→R behind it. Click → case study.

### 4. Signal

Section label, then a four-cell stat grid with hairline separators: `9.5` years shipping · `9` products in prod · `14` cohorts mentored · `0→1` founding engineer.

### 5. Footer

`tayloraucoin.com` on the left; Email · GitHub · LinkedIn on the right. Mono, wide-tracked, dim.

---

## Case study template

**Built to work without imagery.** Taylor has not confirmed he has screenshots. Designing around assets that may not exist is how a portfolio ends up embarrassing.

So the case study leads with **thinking**, and treats media as optional enrichment:

1. **Header** — project, role, dates, stack chips
2. **The constraint** — what made this hard. Not "the client wanted a website."
3. **What I built** — 2–3 paragraphs
4. **Decisions** — a list of `{ decision, alternative, why }`. **This is the section that gets someone hired.** It is the only thing on the page that a hiring manager can't get from a résumé.
5. **What broke** — one honest thing. Optional, and worth more than it costs.
6. **Outcome** — numbers if they exist, plain language if they don't
7. **Media** — optional array. If empty, the layout closes cleanly. If populated, it renders as a full-bleed strip.

The type carries this. If media arrives later, `content/work.ts` is the only file that changes.

---

## Responsive

| Breakpoint | Behaviour                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `< 760px`  | Capability cards stack. Stats go 2×2. Padding drops to `40px 22px`. Field seeds reduce (fewer trunks, less CPU). |
| `< 480px`  | Work row meta hides. Arrow always visible.                                                                       |

Touch: no hover states. Cards show their hover background permanently at 40% strength; the field's cursor-glow is disabled entirely.

---

## Accessibility floor

Non-negotiable, and not announced on the page.

- Visible keyboard focus on every interactive element — a 2px gold ring, `:focus-visible` only
- Work rows are `<a>`, not `<div onClick>`
- The overlay is a proper dialog: focus trap, `Escape` closes, focus returns to the originating row
- The canvas is `aria-hidden`
- `prefers-reduced-motion` → static field, no ring rotation, no transitions
- Body text clears 4.5:1 against the card. Verify any new color before shipping it.

## Performance floor

- **LCP is the `h1`.** It renders server-side. The canvas mounts after paint and fades in over 800ms.
- Field: build the tree once on mount and on resize (debounced 200ms). Never rebuild per frame.
- Off-screen: pause the rAF loop when the field's container leaves the viewport (`IntersectionObserver`).
- Lighthouse target: 95+ performance on mobile. If the field can't clear that, the field gets cheaper — not the target.
- Fonts: `next/font`, self-hosted, subset, `display: swap`.

## SEO

- Per-case-study `generateMetadata` — title, description, OG image
- OG images generated via `next/og` in the site's own palette
- `robots.ts`, `sitemap.ts`
- Structured data: `Person` on `/`, `CreativeWork` on each case study
