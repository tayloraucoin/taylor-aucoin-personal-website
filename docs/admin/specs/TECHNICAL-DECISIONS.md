# ADM — technical decisions (M-ADM)

Architectural choices made during the ADM track, where a real alternative
existed. Append-only. Cite by ID from tickets and code comments.

| ID      | Decision                                                                                                                              | Ticket | Status  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| M-ADM-1 | Preview mode is a React context defaulting to off, read by `use-step-autosave` / `file-drop` / `extraction-block`. Rejected: sentinel token, prop-threading through 18 components, a question manifest. Rationale in `../TECH-SCOPE.md` §5. | ADM-2  | Adopted |
| M-ADM-2 | `components/intake/preview-mode.tsx` is the home: two consumers in two app trees, and it carries JSX, which `lib/` on this repo does not. | ADM-2  | Adopted |
| M-ADM-3 | Active-path match becomes `pathname === href \|\| pathname.startsWith(href + "/")`, replacing bare `startsWith`. Correctness fix carried from CC's `isPathActive`. | ADM-1  | Adopted |
| M-ADM-4 | `lucide-react` added (`yarn add --exact`) as the repo's first icon dependency, scoped to `/admin` by convention. Rejected: hand-rolled SVG set — cheaper on bundle, but 14 hand-drawn glyphs is a maintenance surface and CC's set is the convention being adopted deliberately. | ADM-1 | Adopted |
| M-ADM-5 | The nav constant regains a `ready: boolean` field. `false` renders a dimmed `<span>`, never a link. Restores the pattern the pre-ADM shell carried; required by Finances shipping named-but-unbuilt (D-ADM-7). | ADM-1 | Adopted |
