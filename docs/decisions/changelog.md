---
title: Changelog — amendments to the practice in tayloraucoin.com
description: Read before changing a practice file in this repo, to see what changed, when and why.
layer: decisions
status: adopted
date: 2026-10-14
last_reviewed: 2026-10-14
supersedes:
load_when:
---

# Changelog

## 2026-10-16 — SITE: the metric definitions file lives at the template's path

- `docs/measurement/metrics/definitions.md` is filled in place, as `definitions.template.md` names for a product repo: an exception to `.claude/rules/docs.md`'s "never inside `docs/`", because `specs/` has no folder for a definition that outlives its epic. SITE-3 writes SITE-M1 v1 there. Taylor, SITE Tickets gate.

## 2026-10-15 — TAY: the rebrand's brand layer (Carbon, Gold, Patina)

- `.claude/rules/house-design.md` amended (plan mode, Taylor approved): the brand kit in `docs/product/brand/` (the seven brand-thread files, filed byte for byte) replaces Palette D as the design source; light mode is lifted to the whole site; gradients are rationed to the ring and the atmosphere; the root field is retired behind `FIELD.ENABLED`. Both colour directions run until Taylor chooses on the real site.

## 2026-10-14 — TAY: tayloraucoin.com adopts the practice (migrate, far path, legacy mode)

- Layers 1 and 2 on `feature/pem-migration` from `main` at `44a749a`, toolkit `80699b2`: `toolkit.json`; the host's `docs/` to `docs/_legacy/`; the copied practice and tooling; the derived spine, path rules (with `house-design.md` carrying the old design law) and settings; `yarn verify` over lint, typecheck, a smoke test and `build:agent`, then the toolkit's checks. MIG-1 to MIG-17 and WEB-1 to WEB-21 drafted. Record 0001.
- The eight Stripe skills and `skills-lock.json` left the repo for Taylor's `~/.claude/skills/` (`yarn budget`'s skill-body row).
