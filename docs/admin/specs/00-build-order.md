# ADM — build order

Sequenced by dependency and blast radius. One ticket at a time. Nothing is cut
downstream until its upstream reads Complete in `PROGRESS.md`.

## Gate — before ADM-1 · CLEARED 2026-09-01

- [x] **D-ADM-1** — icons in the rail, via `lucide-react`. Recommendation
      overruled; consequences in `../ADMIN-UX-SPEC.md` §7.1.
- [x] **D-ADM-3** — `/admin` keeps its bounded Radix + lucide exception.
- [x] **D-ADM-4** — `Engagements` is promoted to its own section.
- [x] **D-ADM-2** — sections in flow order, items alphabetical within.
- [x] **D-ADM-7** — `ready: false` dimmed labels reinstated for Finances.
- [x] **D-ADM-8** — `public/icon.png` is the rail mark.

## Phase 1 — the shell

- [x] **ADM-1** — Admin shell: left rail, sections, mobile off-canvas
      Size M · Reversible · No data
      Unblocks: everything. Retires the "where does a new surface go" question.

## Phase 2 — the intake review

- [x] **ADM-2** — Intake question review: preview mode + the vertical stack
      Size L · **Mason reviews the `use-step-autosave` diff** · No data
      Depends on ADM-1 (needs the Intake section to hang off).

## Phase 4 — reading the questions

- [x] **ADM-4** — Document mode, the "Every kind" overview, and the pack diff
      Size L · **Mason reviews the `Reveal` / `ForKinds` interface branches and
      the `file-drop` id change** · No data
      Depends on ADM-2 (needs the route, the preview context, and the bands).
      Six commits, in order, in the ticket's §Data. Taylor ratified M-ADM-7
      (per-kind facts move into the kind registry) and the `file-drop` entry-key
      id fix, 2026-09-02.

## Phase 3 — deferred, not scheduled

- [ ] **ADM-3** — Question inventory table (keys, labels, types, drift check)
      Size S · Reversible · No data
      Depends on ADM-2. **Not in this sprint.** Written so it exists as a
      roadmap pin rather than as creep inside ADM-2. Taylor decides whether it
      ships at all after using ADM-2 for a week. **ADM-4 prints a field key
      beside every question, which is most of what this was for — decide
      whether this file survives once ADM-4 ships.**

## Not in this track (pins, so they have somewhere to go)

- **Intake engagements list / document viewer** — the real content of
  `docs/intake/ADMIN-HANDOFF.md`. A track of its own; do not let it leak into
  ADM-2 because both live under `/admin/intake`.
- **Database-backed questions.** Locked out (`README.md` § Locked scope).
- **Persisted rail collapse state.** Cosmetic; revisit if it annoys.
- ~~**Copy-as-Markdown from the document.**~~ **Delivered 2026-09-03** as a
  Download Markdown button, at Taylor's request. The fidelity concern that
  caused the deferral is closed by keeping the conversion a pure function of the
  rendered HTML, tested against a real render (see `DEVIATIONS.md`).

- **A `no-restricted-imports` rule** forbidding value imports of
  `lib/intake/{showcase-kinds,showcase-copy,showcase-steps,steps}` outside
  `lib/intake/`. The "only `tracks.ts` imports a registry" law is enforced by
  vigilance today; `showcase-start-form.tsx` already imports
  `SHOWCASE_DISCIPLINES` directly. Mason's call, own ticket.
