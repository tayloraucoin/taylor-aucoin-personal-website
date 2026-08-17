# CASE — Case study reframes — 1 hr

Rewrite **only the lead line** (`tagline` in `content/work/*.ts`) of each page around delivery speed, zero-defect, scope, and solo ownership. **Do not rewrite whole pages.**

Status check (as of Aug 17): four of five taglines already carry the reframe — verify and close those; Roomvy is the real edit.

- **CASE-01** ✅? Calculate/QxMD — lead with clinical calculators at point of care, Medscape embed, zero reported defects during tenure. Current tagline already does this — verify, and **add Chan's scale figure if it arrives** (PRE-02) as context, e.g. "a service used by physicians worldwide". If no reply, the zero-defect + Medscape story stands alone.

- **CASE-02** Roomvy — current tagline describes the product, not the proof. Reframe to lead with **solo build of the entire client-facing booking frontend, zero reported issues in production**. Keep the room-block/Airbnb-style complexity narration as the supporting clause.

- **CASE-03** ✅? Everbook — lead with 0→1 solo ownership and range: realtime voice AI + print pipeline + commerce. **No usage claims** (product was shelved; it proves range and shipping discipline, nothing else). Current tagline already close — verify against this framing.

- **CASE-04** ✅? Agora — lead with full commerce system breadth; product/seller counts are **scale-of-build, not traction**. Current tagline already leads with the commerce build — verify, and check the body doesn't frame counts as commercial outcome.

- **CASE-05** ✅? Family Office Platform — lead with consolidating five separately built systems into one monorepo. This is the fractional-CTO proof. Current tagline already does this — verify.

- **CASE-06** "Engagement type" label on every case study page, mapping it to one of the three SVC-03 offers ("This was a fixed-scope 0→1 build" / "This was a fractional CTO engagement" / contract). Add an `engagementType` field to `content/work/types.ts` and render it in `CaseBody` — likely as an At-a-glance row or near the role label; if the template placement isn't obvious from `docs/SITE-SPEC.md` § case study template, stop and ask.
  - Family Office → Fractional CTO · Roomvy/QxMD → Contract · Everbook/CC → Fixed-scope 0→1 · Agora → founder build (label as 0→1).
