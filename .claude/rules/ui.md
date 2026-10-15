---
paths:
  - "app/**"
  - "components/**"
  - "**/*.tsx"
---

# UI files

Before writing or reviewing UI, read, in order:

1. `docs/design/canon.md` — the universal floor (principles and the A-01–A-20 tells). The critic's rubric is `canon-rubric.md`; builders don't load it.
2. The product's design law. This repo has no design layer yet: until layer 3 part 9 writes it, the law is `.claude/rules/house-design.md` and the host's guides it names, `docs/_legacy/DESIGN-SYSTEM.md`, `docs/_legacy/SITE-SPEC.md` and `docs/_legacy/TASTE-PROFILE.md`.
3. The ticket's contract and the one UX surface it cites (`specs/<app>/ux/<area>/<surface>.md`), when they exist.

Then work only in the vocabulary in `AGENTS.md`: the repo's own components and tokens until layer 3 lands the preset and kit, every state of a new surface reachable by `?state=`. Motion follows canon C-P11.
