# ADM — deviations

One dated line per divergence from spec. A stranger should reconstruct what
happened in ten seconds. Append-only.

Format: `YYYY-MM-DD · TICKET · what the spec said → what shipped · why`

---

2026-09-01 · ADM-1 · spec said "reuse the vendored sheet" → the sheet was extended with a `side: "left" | "right"` prop, a `SheetTrigger` export, and two `sheet-slide-*-left` keyframes in `globals.css` · a caller cannot override the baked-in `right-0` from outside — two classes of equal specificity in one rule, decided by Tailwind's emit order. The file's own note asks to be extended when a second use case arrives. The existing lead drawer defaults to `right` and is unchanged.

2026-09-01 · ADM-1 · spec's Acceptance 3 originally shipped `Questions` as a live link to a route ADM-2 builds → it ships as a dimmed label instead · D-ADM-7 reinstated the `ready: false` pattern for Finances, and once it exists the flagged "link to a 404" concern has a better answer. ADM-2 flips one boolean.

2026-09-01 · ADM-1 · the rail's `<nav>` is `overflow-y-auto` expanded but `overflow-visible` collapsed · the scroller clipped the collapsed section flyouts, which are the only thing the collapsed rail exists to show. Collapsed the rail is four icons and has nothing to scroll. Anything added to the collapsed rail must respect that it cannot scroll.

2026-09-01 · ADM-1 · `specs/README.md` said "no new dependency" → `lucide-react@0.553.0` added, pinned, matching CC's version · Taylor ratified icons in the rail (D-ADM-1) and the non-negotiable was amended in the same pass. Icons are `/admin`-only; the public site is untouched.

2026-09-01 · ADM-2 · spec strongly preferred "an early return to a sibling hook" for the preview seam → shipped as a single `io` object (`LIVE_IO` / `PREVIEW_IO`) selected on one line · an early return would call a different set of hooks on the same component, which the rules of hooks forbid and `eslint-plugin-react-hooks` rejects; suppressing that lint to get a prettier seam would trade a real guarantee for a cosmetic one. The property the spec wanted is preserved and arguably stronger: the hook body no longer names `saveStep`, `readLocal`, `writeLocal` or `clearLocal` at all, so a future write has to reach through `io`.

2026-09-01 · ADM-2 · spec said the previewing hook should pin `state` to `idle` → `attempt()` returns early on `preview` to achieve that · noted in the code as cosmetic rather than load-bearing: `PREVIEW_IO` already makes every line below it a no-op. The early return only stops the save indicator announcing a save that did not happen.

2026-09-01 · ADM-2 · Acceptance 6 asked for a real engagement autosaving end to end → verified as far as the seam, not to the database · no Supabase credentials are available in this environment. What was run: the same step component, same script, with and without the provider. Live (no provider) fired `POST /admin/seamcheck?live=1 → 200` (the `saveStep` server action) and wrote `ta-intake:seamchec:business` with the typed values. Preview fired no POST and wrote nothing. Persistence past the action boundary is unchanged code and was not exercised.

2026-09-01 · ADM-2 · `StepHeading` is not reused in the stack · it is an `h1` that focuses itself on mount; nine of them would fight for focus and break the heading order Acceptance 11 requires. The preview writes its own `h2` in the same visual register, as the spec's technical notes anticipated.

2026-09-01 · post-ADM-2 (Taylor's review) · preview track labels "Website build" / "Portfolio build" → "Platform / durable" and "Coded / showcase" · both names are load-bearing in an admin tool and the coded track's internal key (`showcase`) is the one that catches people out. The client-facing `eyebrowFor` strings are approved copy and were deliberately NOT changed.

2026-09-01 · coded intake Step 1 · `leadRole` free text → single select over the roles entered above · a stored lead role absent from the typed roles stays on the option list, so editing a role's spelling cannot silently drop the answer. No schema change: `ChoiceAnswer` without `multiple` already stores a plain string.

2026-09-01 · coded intake Step 1 · added a live title preview under the roles block · ordering the line by lead role is the only place that answer has a visible consequence during intake. It is explicitly not a mockup of the site's type — the site does not exist yet.

2026-09-01 · coded intake Step 1 · `unions` → `credentials`, plus a new `affiliations` field · `unions` is retained in `showcase-intake.ts` and `showcase-answer-labels.ts` as deprecated and read-only. Dropping the key would silently delete the answer of any engagement that filled it before today. No input writes it any more.

2026-09-01 · coded intake Step 1 · `docs/websites/portfolio-intake-questions-v2.md` amended in place with dated amendment notes · that file declares itself the verbatim source for every showcase string, so changing the components without changing it would have had the next session "restore" the film-biased copy.

2026-09-01 · ADM-2 amended (Taylor) · the preview showed only the nine questionnaire steps → it now shows the whole flow in labelled bands: start form, deposit and add-ons, welcome, then the nine steps · the start form asks real questions before payment and the pay screen carries the upsell; reviewing the steps alone hid both, and hid the payment boundary.

2026-09-01 · ADM-2 amended (Taylor) · the non-negotiable "this page issues no query" is lifted for the product catalogue only · the pay section reads the real catalogue so it quotes what a client would be quoted. Inventing a price on a money screen was the alternative and was refused. The read is Taylor's own catalogue, never client data; a failed read renders an explanation rather than an empty section, so a missing pay screen can never read as "there is no payment step".

2026-09-01 · ADM-2 amended · the preview write-path audit grows from three callers to eight · added: `start-form`, `showcase-start-form` (minting an engagement), `pay-button`, `showcase-pay-button` (opening Stripe Checkout), `deposit-checkout`, `showcase-checkout` (promo validation). The two pay buttons are the single choke point for starting a Stripe session and are gated there.

2026-09-01 · coded intake start form · placeholder "Director and camera operator in Vancouver" → "Founder and product designer in Vancouver" · it sits on the public page before payment and was the first thing every non-film client read. `portfolio-intake-questions-v2.md` amended with it.

2026-09-01 · ADM-2 · heading outline in the stacked preview is flat, not nested: page `h1`, flow section `h2`, step `h2` · step components carry their own `h2` sub-headings and those are client-facing. Demoting step headings to `h3` would put an `h2` inside an `h3`, which is an inversion and worse than flatness. No level is skipped.

2026-09-01 · coded intake (Taylor's second review) · site kinds lose "(coming soon)" and `disabled`; "Something else" added with a conditional `siteKindsOther` input · new field plumbed through `startShowcaseIntakeInput`, `stepAboutSchema`, the start action, and the label map together, per the validator file's own law.

2026-09-01 · coded intake Step 4 · "Something else" added to how-the-work-is-organised; the pre-existing always-visible `organizationOther` ("Anything else?") is now conditional on it and relabelled "Tell us how" · a permanently open vague box under concrete choices reads as a second question. The field key is unchanged, so existing answers are unaffected.

2026-09-01 · coded intake · "Portfolio" removed from every string shared across categories — step 2/5/6 intros, step 7 logo help, step 8 contact help, page and layout titles · the coded track also serves consultants, speakers, and studios. The site-kind option labelled "Portfolio" is deliberately kept: there it names one category of five.

2026-09-01 · coded intake · `eyebrowFor` "Agora · Portfolio build" → "Agora · Custom build" · **[PROVISIONAL — Taylor]**. It appeared on every screen of the coded track including the pay and welcome screens a consultant sees. "Custom" is category-neutral; "Coded" is the public slug but reads as jargon to a client. One string to overrule.

2026-09-01 · PORT-10 scoped, not built · the business-primer AI touchpoint is written up as `docs/websites/specs/PORT-10-business-primer.md` for execution in a fresh thread, per Taylor. It reuses PORT-6's extraction service rather than forking it, and it will need adding to ADM-2's preview-gating audit list as a fourth step-body network caller.

2026-09-01 · ADM-2 · the catalogue `catch` swallowed the thrown error and substituted a generic sentence → it now prints the underlying message verbatim · `getBuildProduct` raises the exact remedy ("Run `yarn stripe:catalogue --apply` and `yarn db:seed`…") and discarding it left a reviewer with no cause and no fix. This screen is Taylor-only; there is no reader to protect from an error string.

2026-09-01 · catalogue · `seed-products.ts` overwrote `stripeProductId`/`stripePriceId` whenever the committed `STRIPE_CATALOGUE_IDS` map held a value, despite a comment claiming re-seeding must never wipe what `--apply` wrote → both now use `coalesce(existing, bootstrap)` · found via a dry run: `--apply` matches prices by nickname, five sandbox prices have drifted nicknames and would be archived and re-minted, and one of them (`price_1U6yhBRvld9FSVemUheh9bQU`, `stripe_setup`) is hardcoded in the map. A re-seed after an apply would have written that archived id back over the working one and broken that product's checkout. Committed map is now a bootstrap only; Stripe is the source of truth for ids.

2026-09-01 · catalogue · the coded track's Stripe objects were never minted at all · dry run against the sandbox shows five products absent: Portfolio website build, Portfolio admin panel, Logo or wordmark refresh, Extra page (portfolio), Booking setup. Not a run-order problem on its own — there was nothing to write ids from. `--apply` not run; awaiting Taylor.
