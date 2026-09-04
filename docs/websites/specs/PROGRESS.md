# PORT — Progress (the record of state)

The **only** authoritative answer to "is this Complete." A downstream ticket is not started until every entry in its `Depends on` is ticked here. "Basically done" is not a status.

**Migrations 0010 and 0011 are applied on staging** (confirmed 2026-09-04: `engagements.track`, `intake_files.transcript`, and `intake_files.transcript_status` all exist, journal entry dated 2026-09-03). The earlier note here said both were pending Taylor's run against the hosted databases; that is stale for staging. **Production is unchecked** — a `db:migrate` on this machine resolves to staging (local borrows staging credentials), so nothing here says anything about the live tier. PORT-20 still needs `OPENAI_API_KEY` set; without it a recording still records, uploads, and reaches the intake document as audio — it just arrives with the old "transcribe this" heading.

**Outstanding for the coded track's money paths:** `showcase_animations` (and any other add-on row) has no minted Stripe price on the sandbox tier, so the mid-intake add-on Checkout cannot be created there. `yarn stripe:catalogue --apply` per tier, then paste the ids into `scripts/seed-products.ts` and `yarn db:seed` — the same PORT-3 action that has been outstanding since 2026-08-26.

| Ticket | Title | Depends on | Status | Date |
| ------ | ----- | ---------- | ------ | ---- |
| PORT-1 | Track foundation: key, migration, registries, seams | — | Complete (migration pending Taylor's run) | 2026-08-26 |
| PORT-2 | Public entry: routes, start form, state router, shells | PORT-1 | Complete | 2026-08-26 |
| PORT-3 | Pay screen: catalogue, plan choice, add-ons, promo | PORT-2 | Complete (Stripe prices pending Taylor) | 2026-08-26 |
| PORT-4 | Precedented steps: about · audience · words · media · access | PORT-2 | Complete | 2026-08-26 |
| PORT-5 | Entry machinery: per-entry uploads; experience + work steps | PORT-2 | Complete (storage path unverified) | 2026-08-26 |
| PORT-6 | "Sort this for me" extraction | PORT-5 | Complete | 2026-08-26 |
| PORT-7 | Taste: example gallery + favourites rank | PORT-2 | Complete (stub example set) | 2026-08-26 |
| PORT-8 | Output document, done wiring, email variants | PORT-3, PORT-4, PORT-5, PORT-7 | Complete (email delivery unverified) | 2026-08-26 |
| PORT-9 | Post-intake charges (Taylor-initiated) | PORT-3 | Complete (no live Stripe run) | 2026-08-26 |
| PORT-10 | Business primer: one document dump, proposals across the intake | PORT-6, ADM-2 | Complete (live eval clean) | 2026-09-01 |
| PORT-H1 | Hotfix: no client's name in shipped copy (step 6 person-voice) | — | Complete | 2026-09-01 |
| PORT-11 | Kind: start-form picker, `siteKind` in answers, resolver rewire, pack registry widened | PORT-1, PORT-2 | Complete | 2026-09-01 |
| PORT-12 | Copy packs: practice · entity · venture · service strings, lists, labels | PORT-11 | Complete | 2026-09-01 |
| PORT-13 | Step 1 by kind: kind line, entity name, stage, team roster with headshots | PORT-11, PORT-12 | Complete | 2026-09-01 |
| PORT-14 | Step 4 by kind: offer/piece/service entries, ask block, ink claims cluster, document sections + flags | PORT-11, PORT-12, PORT-13 | Complete | 2026-09-01 |
| PORT-15 | The pack-driven steps 2·3·5·6·7·8·9: strings and lists from the pack; documents drop; tools group; the place | PORT-11, PORT-12, PORT-H1 | Complete | 2026-09-01 |
| PORT-16 | Taste sets by pack; uncurated-absent state; stub deleted | PORT-11 | Complete | 2026-09-01 |
| PORT-17 | Extraction modes: people · offerings · pieces · services; pack-aware experience prompt | PORT-6, PORT-13, PORT-14 | Complete (live eval not run) | 2026-09-01 |
| PORT-18 | Global ingestion step before "About you"; portfolio sub-types; fast-way copy | PORT-10, PORT-17, ADM-4 | Complete (all five slices; live eval clean; not exercised against a real engagement — no database in the session) | 2026-09-03 |
| PORT-21 | Files and links: documents read at upload, links fetched by the model's web fetch, both as sources for PORT-18's run | PORT-18, PORT-20 (migration `0011` **still to run**) | Complete (three live evals clean; not exercised against a real engagement; `fflate` awaiting ratification) | 2026-09-03 |
| PORT-19 | Questions pass two: Taylor's 2026-09-03 review — project videos, home block, five-pick, copy | PORT-14, PORT-15, PORT-18 (slice 1) | Complete | 2026-09-03 |
| PORT-20 | Voice recording in the browser + automatic transcription (OpenAI) | PORT-19 | Complete (migration `0011` pending Taylor's run; microphone path and Safari unverified) | 2026-09-03 |
| PORT-22 | Taste contract: taxonomy, site shape, pick shape, retired keys kept, legacy favourites derived | PORT-16, PORT-19 | Complete | 2026-09-04 |
| PORT-23 | The taste step rebuilt: grouped gallery, pick block, your picks, the count, references, brain dump | PORT-22 | Complete | 2026-09-04 |
| PORT-24 | See more: the gallery overlay, the sandboxed live frame, paging | PORT-23 | Complete | 2026-09-04 |
| PORT-25 | Find more like it: style brief, server-side web search, result links, Add to my sites | PORT-22, PORT-23 | Complete (Add-to-my-sites unverified in a browser — no `INTAKE_LINK_KEY` to mint a token) | 2026-09-04 |
| PORT-26 | Motion add-on notice and the one client-initiated single-item Checkout | PORT-23, PORT-3, PORT-9 | Complete (Checkout session creation unverified — no minted Stripe price on this tier) | 2026-09-04 |
| PORT-27 | Capture tooling for curation (`yarn capture:example`) | PORT-22 | Complete | 2026-09-04 |

## Checklist (mirrors `00-build-order.md`)

- [x] PORT-1 · Track foundation
- [x] PORT-2 · Public entry
- [x] PORT-3 · Pay screen
- [x] PORT-4 · Precedented steps
- [x] PORT-5 · Entry machinery
- [x] PORT-6 · Extraction
- [x] PORT-7 · Taste
- [x] PORT-8 · Output + emails
- [x] PORT-9 · Post-intake charges
- [x] PORT-10 · Business primer
- [x] PORT-H1 · Hotfix: person-voice interpolation
- [x] PORT-11 · Kind
- [x] PORT-12 · Copy packs
- [x] PORT-13 · Step 1 by kind
- [x] PORT-14 · Step 4 by kind
- [x] PORT-15 · The pack-driven steps
- [x] PORT-16 · Taste sets by pack
- [x] PORT-17 · Extraction modes
- [x] PORT-18 · Global ingestion step
- [x] PORT-21 · Files and links
- [x] PORT-19 · Questions pass two (Taylor's 2026-09-03 review)
- [x] PORT-20 · Voice recording + transcription
- [x] PORT-22 · Taste contract
- [x] PORT-23 · The taste step rebuilt
- [x] PORT-24 · See more overlay
- [x] PORT-25 · Find more like it
- [x] PORT-26 · Motion add-on
- [x] PORT-27 · Capture tooling
