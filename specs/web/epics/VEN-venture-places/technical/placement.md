---
epic: VEN
status: approved
---

# VEN — technical notes: placement

Placement is decided by one question: who imports this? (`docs/engineering/codebase-conventions.md` §1.) Nothing here is new as a kind of thing: every row extends a module that already holds facts of the same kind (verified, 2026-10-20). Each path is repo-relative, and the piece named first is the one that writes it.

## Registry, seam, copy

| What                                                                                                                                                                     | Path                                                                      | Consumer                                                                              | Why here                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VENTURE_TYPES`, `VentureType`, `ventureTypeFor(answers)`, `ventureTypeFrom(kind, raw)`, groups `raise` and `place`, `groupsFor(kind, ventureType)` (P1)                 | `lib/intake/showcase-kinds.ts`                                            | `lib/intake/tracks.ts` only                                                           | The one home for per-kind facts (M-ADM-7). The file's own rule: nothing else imports it                                          |
| Seam exports: `ventureTypeOf`, `ventureTypeFrom`, `ventureTypeChoices(pack)`, `showcaseVentureTypes`, two-argument `groupsFor`, `copyPackFor(flavour, ventureType)` (P1) | `lib/intake/tracks.ts`                                                    | steps, the step page, the start form, `output.ts`, admin, scripts                     | The sanctioned seam (M-PORT-1)                                                                                                   |
| The `place` overlay `VENTURE_PLACE`, `SUBTYPE_OVERLAYS`, `resolvePack(flavour, overlay?)` (P1); slot content (P2–P5)                                                     | `lib/intake/showcase-copy.ts`                                             | `tracks.ts`                                                                           | Taylor's copy pass edits one file. The overlay is keyed by a plain string, so copy never imports the registry                    |
| Step-schema keys, `EVENT_FIELDS` and `EVENT_FIELD_KEYS`, entry sub-keys, `startShowcaseIntakeInput.ventureType`                                                          | `lib/validators/showcase-intake.ts`                                       | the seam, `output.ts`, the start action, fixtures                                     | The schema is the save path's shape guard                                                                                        |
| Document labels for every new key, `decks` and `image_references`                                                                                                        | `lib/intake/showcase-answer-labels.ts`                                    | `labelFor`                                                                            | The `verify:tracks` label sweep                                                                                                  |
| Inventory sets, two-argument `KIND_GATED`, `askedOf(key, kind, ventureType)`, `ingestionFieldsFor(kind, ventureType = null)`                                             | `lib/intake/showcase-primer-fields.ts`                                    | `server/services/ingestion.ts`, `server/services/output.ts`, `scripts/eval-primer.ts` | Where criticality is decided, never by a model. `askedOf` gains its second consumer (output.ts) here rather than becoming a copy |
| Six style tags                                                                                                                                                           | `content/intake-examples/types.ts`, `content/intake-examples/taxonomy.ts` | `tagsFor`, the gallery admin                                                          | Taxonomy home. Tags are `text[]`, so no migration (M-PORT-42)                                                                    |

## Server

| What                                                                                                                                                   | Path                                                                                                                           | Consumer                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `funded` dropped from piece extraction                                                                                                                 | `server/services/extract.ts`                                                                                                   | ingestion                   |
| The sub-type passed into the run                                                                                                                       | `server/services/ingestion.ts` (`runIngestion(id, kind, ventureType, source)`), `app/websites/coded/intake/_actions/ingest.ts` | the ingest step             |
| Seeding `about.ventureType`                                                                                                                            | `app/websites/coded/intake/_actions/start.ts`                                                                                  | the start form              |
| Document changes: the decks section, the event gate, the derived audience, `funded` and ask sub-key labels, overlay spectrums, the Not-answered filter | `server/services/output.ts`                                                                                                    | render-intake, done, review |

## Components (all under `app/websites/coded/intake/_components/`, unless named)

| What                                                                                                                                | Path                                                |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Two-argument `KindTest`, `ventureType` prop on `ForKinds` and `ForKindsStub`, sub-type tags, pure `kindsMeeting(test)` (P1; Turner) | `for-kinds.tsx`                                     |
| Sub-type on the start form (hidden input, like `siteKind`), optional fixture `seed` prop                                            | `showcase-start-form.tsx`                           |
| Sub-type on About, and the place rows                                                                                               | `steps/step-about.tsx`                              |
| Overlay audiences (pack only, plus the `ventureType` prop)                                                                          | `steps/step-audience.tsx`                           |
| Place rows, Applying, claims rows; mounts the event section                                                                         | `steps/step-work.tsx`                               |
| The event section: 21 rows, one consumer, kept out of `step-work.tsx` so the step stays readable                                    | `event-section.tsx` (new, P3)                       |
| `funded` row                                                                                                                        | `piece-entry.tsx`                                   |
| Invest rows                                                                                                                         | `ask-entry.tsx`                                     |
| Image facts, image brief, references                                                                                                | `steps/step-media.tsx`                              |
| Decks: `DocumentDrop` gains `id`, `fieldKey` and `buttonLabel` props. One composition used twice, no new primitive                  | `document-drop.tsx`                                 |
| `raiseProgress` inside the availability reveal                                                                                      | `steps/step-site.tsx`                               |
| Overlay spectrums (the `ventureType` prop only)                                                                                     | `steps/step-taste.tsx`                              |
| `ventureType` and the `decks` / `image_references` uploads passed down                                                              | `app/websites/coded/intake/[token]/[step]/page.tsx` |
| Fixture-only tile seed (C12)                                                                                                        | `app/websites/intake/_components/file-drop.tsx`     |

## Fixtures and review surfaces

| What                                                                                                           | Path                                                                                                                         | Consumer                                                     | Why here                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| VEN fixture data and `VEN_STATE_KEYS`                                                                          | `components/intake/venture-fixtures.ts` (new, P1; each piece adds its states)                                                | the admin questions page and the harness view                | Two consumers in two app trees: the D-SITE-218 pattern beside `intake-fixtures.tsx` |
| Harness rendering of a VEN key: its one step in `StepShell`, seeded                                            | `components/intake/venture-state-view.tsx` (new), keys appended in `components/intake/intake-fixtures.tsx`                   | `app/test-harness/intake/page.tsx`, the admin client preview | The harness already renders steps this way (`case "step"`)                          |
| `subtype` and `state` params; seeding the stack                                                                | `app/admin/(protected)/intake/questions/page.tsx`, `_components/question-stack.tsx`                                          | Taylor's review                                              | D-VEN-2                                                                             |
| `subtype` carried in preview links and the export filename; the overlay as its own column in the pack appendix | `_components/preview-controls.tsx`, `_components/preview-link.tsx`, `_components/to-markdown.ts`, `_components/pack-diff.ts` | the same page                                                | Without them, the review cannot show the overlay                                    |

## Checks and tests

- `scripts/verify-track-cartridge.ts`: the cartridge checks (`test-shape.md`).
- `tests/unit/intake-venture-*.test.ts`: logic and the document.
- `tests/e2e/intake-venture.spec.ts`: rendering on the harness.
- `package.json` `verify`: C11.
