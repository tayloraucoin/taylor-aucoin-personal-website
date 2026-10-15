# v3 — Contract Sales Site (sprint of Mon Aug 17, 2026)

**Goal:** the site converts a warm-network visitor into a booked call.
**Definition of done:** Services page live · testimonials placed (or placeholder-free layout ready) · Cal.com CTA in nav + hero + services page · capability grid live · CC case study published · testimonial requests sent.
**Timebox:** ~8 hours. Anything not in these tickets is out of scope.

Work **one ticket at a time**, same contract as `docs/TICKETS.md`: after each ticket `npm run build && npx tsc --noEmit`, then stop and report. All CLAUDE.md invariants apply — this sprint adds pages; it does not change the design system.

## Workstreams, in build order

| # | File | Prefix | Budget |
|---|------|--------|--------|
| 1 | [01-prework.md](01-prework.md) | PRE | 30 min — **Taylor only, no code. Do first: latency starts now.** |
| 2 | [02-services-page.md](02-services-page.md) | SVC | 3 hrs — highest-value artifact of the day |
| 3 | [03-capability-grid.md](03-capability-grid.md) | GRID | 2 hrs |
| 4 | [04-homepage.md](04-homepage.md) | HOME | 1 hr |
| 5 | [05-case-reframes.md](05-case-reframes.md) | CASE | 1 hr |
| 6 | [06-cc-case-study.md](06-cc-case-study.md) | CC | 45 min |
| 7 | [08-testimonials.md](08-testimonials.md) | TST | added mid-sprint — strip + tabs + /testimonials page |
| 8 | [07-qa-ship.md](07-qa-ship.md) | QA | 45 min — includes TST gate check (QA-08) |

## Cut order (if time runs out)

1. CC case study (CC-01)
2. Capability grid dialogs — ship cards without dialogs (GRID-03)
3. Case study reframes (CASE-*)

**Never cut** the services page or the Cal.com CTA.

## Do NOT do in this sprint

- Write articles.
- Split case studies into per-project entries (that's the A.Team format, not this site's).
- Redesign anything that already works.
- Add a blog engine, newsletter signup, or analytics dashboard.
- Start warm outreach — that's Thursday, after the site is done.
- Touch Conscious Connections product work beyond the case study.

## Copy ownership

Copy specs inside these tickets come from Taylor's sprint doc and are **decided direction, not final prose**. Where a ticket quotes copy ("e.g. …"), treat it as the draft to place; Taylor gives it a final read-aloud pass in QA-06. Do not improve copy beyond what a ticket specifies.
