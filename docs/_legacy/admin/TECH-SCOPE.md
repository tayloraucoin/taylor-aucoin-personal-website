# Admin tech scope — ADM track

Author: Mason. Architecture pass for the admin shell restructure and the intake
question review surface. Placement map (§3) is the placement law for every ADM
ticket. Decisions log to `specs/TECHNICAL-DECISIONS.md` as `M-ADM-n`.

---

## 1. What is actually being built

Two things, and they share nothing but a route prefix:

1. **A nav restructure.** Presentational. Reversible in an afternoon. Zero data,
   zero schema, zero authorization change.
2. **A read-only mount of the production intake questionnaire inside `/admin`.**
   This one is not trivial, because the questionnaire's components are wired to
   a live engagement and a no-loss autosave contract, and the preview must be
   provably incapable of writing anything.

Sizing follows: ADM-1 gets speed, ADM-2 gets scrutiny.

## 2. Ground truth (consumed, never rebuilt)

- `lib/intake/tracks.ts` — the one resolver for step identity across tracks.
  `stepsFor`, `stepCountFor`, `fieldKeysFor`, `labelFor`, `copyPackFor`.
  Nothing in this track may import `steps.ts` or `showcase-steps.ts` directly;
  that rule predates us and it is the reason a second track was cheap.
- `app/websites/intake/_components/steps/*` (9) and
  `app/websites/coded/intake/_components/steps/*` (9) — the questions. These
  are the source of truth for question copy and they are not to be duplicated,
  paraphrased, or re-declared in a manifest.
- `app/admin/_components/ui/sheet.tsx` — the vendored Radix overlay.
- `lib/routes.ts` — every admin path.
- `server/services/admin-auth.ts` — `requireAdmin`.

## 3. Placement map

| Path                                                        | What                                                       | New |
| ----------------------------------------------------------- | ---------------------------------------------------------- | --- |
| `app/admin/_components/admin-shell.tsx`                      | Rewritten: rail + content pane, no top bar                 |     |
| `app/admin/_components/admin-nav.ts`                         | `NAV_SECTIONS` constant (mirrors CC `constants.ts`)        | new |
| `app/admin/_components/admin-sidebar.tsx`                    | The rail itself; owns active-path resolution               | new |
| `app/admin/_components/admin-nav-section.tsx`                | One collapsible section                                    | new |
| `app/admin/_components/admin-mobile-bar.tsx`                 | `< lg` top bar + sheet trigger                             | new |
| `app/admin/_components/admin-page-header.tsx`                | Title / description / actions (mirrors CC `AdminPageHeader`)| new |
| `app/admin/(protected)/intake/questions/page.tsx`            | Server page; resolves track + flavour from search params   | new |
| `app/admin/(protected)/intake/questions/_components/question-preview.tsx` | Client; renders the step stack             | new |
| `app/admin/(protected)/intake/questions/_components/preview-controls.tsx` | Client; track + copy-pack switch           | new |
| `components/intake/preview-mode.tsx`                         | `PreviewModeProvider` + `useIsPreview()`                   | new |
| `lib/routes.ts`                                              | `adminRoutes.intake`, `adminRoutes.intakeQuestions`        |     |

`components/intake/` is the home for the preview context because it has two
consumers in two app trees (`app/websites/**` reads it, `app/admin/**` provides
it) and it carries JSX — `lib/` on this repo is `.ts` only and stays that way.
Two-plus consumers means extract; this is the extraction.

## 4. The nav constant

One exported array, the shape CC uses minus the icon field (D-ADM-1):

```ts
type AdminNavItem = { title: string; href: string };
type AdminNavSection = { label: string; items: AdminNavItem[] };
```

Every `href` comes from `adminRoutes`. No route string is written inline in the
nav constant — the same law `lib/routes.ts` already states for the intake tree.

Active resolution is `pathname === href || pathname.startsWith(href + "/")`.
This is CC's `isPathActive` and it is a correctness fix, not a copy: today's
shell uses bare `startsWith(item.href)`, which marks `/admin/leads` active on
a hypothetical `/admin/leads-archive`. Note it in `DEVIATIONS.md` when it lands.

## 5. The preview seam — the one decision that matters

**Constraint:** mount 18 production step components in `/admin` without any of
them reaching the network, and without editing 18 files.

**The seam.** Every step component builds its own form by calling
`useStepAutosave` internally. That hook is therefore the only place the write
path can be intercepted, and intercepting it there covers all 18 for free.

Exactly three modules under the step bodies touch the network:

| Module                                                    | Reaches                          | Preview behavior                              |
| --------------------------------------------------------- | -------------------------------- | --------------------------------------------- |
| `app/websites/intake/_lib/use-step-autosave.ts`            | `saveStep` action, `localStorage`| Local `useState` only; `state` pinned `idle`  |
| `app/websites/intake/_components/file-drop.tsx`            | `/api/intake/upload`             | Input disabled; inert-state copy per UX §6     |
| `app/websites/coded/intake/_components/extraction-block.tsx`| `extract` action                | Trigger disabled; same inert treatment         |

That list is the audit. It was derived by grepping every `fetch(`, `_actions/`,
and `use server` importer under both `_components` trees; the remaining hits
(`pay-button`, `start-form`, `deposit-checkout`, `send-my-link-button`,
`record-step-reached`, `complete-on-arrival`, `showcase-*`) live in the intake
shell, not in a step body, and the preview never mounts the shell. **ADM-2 must
re-run that grep and state the result** — if a fourth caller has appeared, it is
handled or the ticket stops.

**Mechanism: React context, defaulting to off.**
`useIsPreview()` returns `false` with no provider. The provider is mounted only
by `app/admin/(protected)/intake/questions/**`. The client intake tree never
imports it, so the production write path is not merely disabled in preview — it
is unreachable from preview and unchanged everywhere else.

**Rejected alternatives** (log as `M-ADM-1`):

- *A sentinel token.* Cheapest edit, worst property: the safety of the no-loss
  contract would depend on a string comparison inside the hook that a future
  refactor can delete without failing a build. A missing provider fails open to
  the safe state; a mistyped sentinel fails open to writing.
- *Thread a `form` prop through every step component.* The honest seam, and
  the right one if we were writing this today. It is an 18-file edit to the most
  safety-critical surface in the repo in service of an internal review tool.
  Not now; revisit if a second preview consumer appears.
- *A question manifest in `content/` or `lib/intake/`.* Rejected outright. It
  puts question copy in two places, and the second place is the one nobody
  updates. Fidelity is the surface's entire value.

**Verification the ticket owes.** Not a claim — a run. Open a step in the
preview, type into a field, and confirm in the network panel that no request is
issued and `localStorage` gains no `ta-intake:` key. Then open a real intake
step and confirm autosave still saves. Both stated in the close-out.

## 6. Blast radius

| Change                              | Door       | Care                                    |
| ----------------------------------- | ---------- | --------------------------------------- |
| Nav restructure                      | Reversible | Ship it                                 |
| `adminRoutes` additions              | Reversible | Ship it                                 |
| Context branch in `use-step-autosave`| **One-way in spirit** | Mason reviews the diff. This hook is the no-loss promise. |
| Inert branch in `file-drop`          | Reversible | Review that the production path is untouched |
| Schema / migrations                  | **None**   | This track adds no table and no column  |

## 7. Non-negotiables

- No new dependency. The rail is hand-built from repo tokens; the overlay reuses
  the vendored sheet.
- No `-[--token]` Tailwind syntax anywhere (repo `CLAUDE.md` trap).
- `requireAdmin` still gates every surface via `(protected)/layout.tsx`; the
  preview adds no server action, so it adds no action-level auth surface.
- No answer content, token, or engagement id may reach the preview. It renders
  an empty questionnaire, and there is no engagement to read.
- No fabricated client data as preview prefill. Prefill props are empty strings.
  `docs/intake/ADMIN-HANDOFF.md` treats this as legal posture, not style.
- `prefers-reduced-motion` respected; the sitewide rule must not be escaped.
