# Handoff — build the portfolio intake track

**From:** Vesper + Mason (scoping thread) · **To:** Vesper + Mason (build thread)

You are receiving three things: this primer, `docs/websites/portfolio-intake-questions-v2.md` (the content spec — every screen, question, and line of copy for the new track), and the repo itself. The v2 doc is Vesper-approved copy: implement it verbatim, except at the marked *(flexes by discipline)* points and the `[PROPOSED]` items listed under Open items. This primer carries everything the scoping thread decided that is not yet recorded in any repo doc. Record it properly as you build — a decision that exists only in this handoff does not exist.

## What this is

Taylor is adding a second website-build offering. The existing one: Metro Vancouver service-business sites built on Durable, sold at `/websites`, $1,200 flat, with a nine-step intake at `/websites/intake` that is the best thing in the codebase — you are extending it, not replacing it. The new track: bespoke portfolio sites for creatives, built in real code by Claude Code, $2,000 base ($1,000 deposit / $1,000 balance, or $1,900 paid in full at 5% off). First client is Kryshan Randel — filmmaker, director/camera/editor/teacher — at $1,600 via the existing promo-code mechanism. Delivered client sites are static Next.js + TypeScript on Vercel, content as typed TS, **no database and no Supabase** unless a specific feature forces it (that is context for the output document's prompts, not this build).

## Read before touching anything

- `CLAUDE.md` — the one rule: a design decision not specified in the docs means stop and ask. It is not decoration; the visual direction survived many human rejections.
- `docs/intake/PRIMER.md`, `docs/intake/INTAKE-UX-SPEC.md` (§13 decision log), `docs/intake/TECH-SCOPE.md`, `docs/intake/intake-form-build-spec.md`, `docs/intake/specs/DEVIATIONS.md` and `TECHNICAL-DECISIONS.md` — the existing intake's laws and their reasons.
- `docs/websites/WEBSITES-PAGE-SPEC.md` §7 — the route-nesting rationale (a trimmed URL lands on an explainer, never a 404).
- `docs/DESIGN-SYSTEM.md` and `docs/TASTE-PROFILE.md` before any visual work.

## The existing machine (reuse all of it)

- Routes: `app/websites/intake/page.tsx` (public start form) → `[token]/page.tsx` (state router: pay | confirming | welcome | resume | done) → `[token]/[step]/page.tsx` → `[token]/done/page.tsx`. The layout drops all site chrome.
- Step registry: `lib/intake/steps.ts` — one home for step identity; routing, progress, resume, skipped-items, and the output generator all read it.
- Field primitives: `app/websites/intake/_components/answer-inputs.tsx` — `TextAnswer`, `LongAnswer`, `ChoiceAnswer` (with `exclusiveValue`), plus `RepeatableBlock` and `FileDrop`.
- Persistence: debounced autosave → server action → `saveStepAnswers()` in `server/services/submission.ts` → JSONB merge **in Postgres** (`answers || …::jsonb`). Malformed fields are dropped individually; a save never fails whole.
- Validation: `lib/validators/intake.ts` — Zod as shape guards, never gates. Types in `lib/types/intake.ts`.
- Files: Supabase Storage via `app/api/intake/upload/route.ts`; `MAX_UPLOAD_BYTES = 50MB`; size is the only thing that may reject a file — never format, never count.
- Payment: `server/services/deposit.ts` + Stripe Checkout; only the signature-verified webhook (`app/api/webhooks/stripe/route.ts`) marks paid. Catalogue in `scripts/seed-products.ts` with `offeredAtCheckout`; promo codes exist.
- Completion: `renderIntakeMarkdown()` in `server/services/output.ts` → Resend emails. Reminders cron with a hard ceiling of three.

## Binding laws that carry to the new track

1. Every field optional, always (D-INT-4). Skipping is a first-class path; skipped items surface on the done screen.
2. Answers are one JSONB document — adding a question never requires a migration.
3. Never an account-password field, anywhere. The v2 doc's per-project "share password" field is the deliberate, documented exception: Vimeo link passwords are share artifacts, not credentials — say so in a doc comment.
4. The gradient ring appears exactly once in the flow: the voice-note card (D-INT-3).
5. No step sub-paginates (D-INT-5). The new flow is also nine steps; keep the welcome copy's promise true.
6. No answer value is ever logged.
7. The intake surface stays chrome-suppressed and noindex.

## Decisions ratified in the scoping thread — record these as you build

1. **One machine, category cartridge.** The portfolio track parameterizes the existing system rather than forking it. What varies per website type: the step registry contents, the example-site set, and flavoured microcopy. What must not fork: persistence, autosave, upload, payment, token security, completion. Whether you parameterize `INTAKE_STEPS` by track key or stand up a parallel registry is yours to decide — but step identity keeps exactly one home, and the existing Durable track must be byte-for-byte unaffected.
2. **Internal naming.** In this codebase "portfolio site" already means tayloraucoin.com itself (see the comments around `legalRoutes` and `content/legal.ts`). Public URLs may say `portfolio`; pick an internal track key that doesn't collide, and record the choice.
3. **Scope of this build:** the intake track only. The `/websites` chooser page and the portfolio marketing page are a later goal — do not build them. The start form gains the category and discipline questions per the v2 doc.
4. **Payment.** New product rows: portfolio deposit $1,000, portfolio balance $1,000, pay-in-full $1,900 **as its own product row** (not a runtime discount — simpler and auditable), plus the add-ons in the v2 doc. Kryshan's $1,600 rides the promo mechanism. Step 8's extra-page pricing needs a post-intake payment path (payment link or re-entry to checkout scoped to `extra_page` quantity) — the copy promises confirm-before-charge, so the mechanism must make auto-charging impossible.
5. **Discipline cartridge.** The start form's "What's the work?" answer selects the example-site set and the flavoured copy variants marked in the v2 doc. Film ships first; generic fallbacks are specified inline. Unflavoured disciplines get the generic copy, never a broken slot.
6. **New primitives to build:**
   - *Favourites gallery* (taste step): per-card favourite toggle + reveal-on-tap note, then a drag-to-rank shortlist with notes held open for editing. No rating sliders — the favourites flow replaced them deliberately.
   - *"Sort this for me"* (steps 3 and 4): one server endpoint, Claude Sonnet (`claude-sonnet-5`), blob in → structured entries out, **prefilling the repeatable blocks client-side only**. Nothing reaches the answers document until the user has seen and kept it. Rate-limit per token. On failure: keep the blob in the box, offer retry or manual entry — the blob is never lost.
   - *Per-project images*: `RepeatableBlock` currently handles text fields only; it needs file-upload support inside entries, reusing the existing upload path and its 50MB size-only law. No cap on project count or images.
7. **Example sites are typed TS content** (e.g. `content/intake-examples/<discipline>.ts`): name, URL, screenshot assets, 12–24 per discipline. Taylor curates and captures; the copy deliberately never names a count. Curation guidance for him: span axes deliberately — dark/light, video-first/grid-first, animated/still, personality-forward/work-only — so the favourites pattern triangulates a style vector.

## Open items — `[PROPOSED]`, never silently invent

- Admin panel at $500 — proposed, needs Taylor's sign-off before the checkout row goes live.
- Care plan at $100/mo — proposed.
- Five included pages — proposed; project detail pages excluded from the count by copy.
- The "coming soon" disabled category rows publicly signal expansion — Taylor may drop them.
- The internal track key (see decision 2).
- Example-set curation is Taylor's task, not yours; build against a stub set and say so.

If any of these blocks you, take a reversible default, label it `[PROPOSED — needs sign-off]`, and record it. Silent invention is the one sin this documentation-managed repo cannot recover from.

## Vesper's implementation notes

- The v2 doc's copy is in-register and approved — verbatim, including placeholders and blur-validation strings. Taylor holds a human-hand copy standard (the site was once flagged as reading AI-written); do not "improve" copy, and flag anything that drifts generic.
- New components ship with full state matrices: default, hover, focus-visible, disabled, error, loading, empty. Specifically: the extraction's pending state is calm and specific (no spinner theatrics), its failure state is useful and keeps the blob; the favourites toggle and drag-rank are keyboard-operable; drag-rank respects `prefers-reduced-motion`; gallery screenshots lazy-load so the step doesn't pay for 24 sites up front.
- The surface is "Quiet Gilt" — the intake layout's restraint is the design. One ring, one moment. Nothing on the taste step may out-shine the CTA.

## Working method

- Spec-first, matching the repo's culture: author the track's spec slices and a build order under `docs/` (mirror `docs/intake/specs/` — numbered slices, `DEVIATIONS.md`, `TECHNICAL-DECISIONS.md`) before writing code. Then one ticket at a time.
- Yarn 4 only — never npm. After each slice: `yarn build`, `npx tsc --noEmit`, `yarn lint`, run and reported.
- Append-only records for every departure from this handoff or the v2 doc, one line a stranger could reconstruct in ten seconds.

Frame the placement before the code, keep the Durable track untouched, and hand back work Taylor can verify without asking a question.
