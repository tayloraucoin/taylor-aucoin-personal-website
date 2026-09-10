# Parked: naming Cho Ventures on the family office case study

**Status: blocked on written permission.** Tony Cho gave permission over
WhatsApp. Taylor wants an official email confirmation on file before the
client's name goes public, so the change was built, verified, and then
reverted out of the working tree rather than shipped.

Reverted 2026-09-10. The change itself was written the same day and briefly
lived inside commit `f16a86e` ("Updated experience"), which is where to look
if this file and the patch ever drift apart.

## When the email lands

```bash
bash docs/pending/cho-ventures-naming/restore.sh
```

Then `npx tsc --noEmit && yarn build:agent`, and delete this directory.

## What it does

- `content/work/family-office-platform.ts` -> `content/work/cho-ventures.ts`,
  export `familyOfficePlatform` -> `choVentures`, slug -> `cho-ventures`,
  title -> **Cho Ventures** (one-name, like every other study).
- `public/work/family-office-platform/` -> `public/work/cho-ventures/`, and the
  architecture capture renamed to match.
- Names **Tony Cho** as principal, **ChoZen Eco-Retreat** as the retreat centre
  (tagline, at-a-glance, the booking-engine process section, the built card,
  and `Specialties.tsx`), and **Future of Cities** in the brief.
- `content/capabilities.ts` — 9 proof chips relabeled and rehrefed, plus the
  7 prose mentions of "the family office".
- `content/testimonials.ts` — Bruno -> **Bruno Vitale**, "Creative Director,
  Cho Ventures", slug `bruno-vitale`; `HOME_TESTIMONIALS` in `lib/config.ts`
  follows.
- `next.config.ts` — permanent redirect `/work/family-office-platform` ->
  `/work/cho-ventures`, because case-study URLs get pasted into email.
- Anonymization comments in `CaseLinks.tsx` and `CaseBody.tsx` rewritten.

## Decisions inside the patch, if they need revisiting

1. **"A foundation" became "Future of Cities" with the word dropped.** Their
   own portfolio page calls it a mission-driven consortium, so the patch names
   it without asserting a legal form.
2. **No outbound link was added.** `CaseLinks` is documented as proof the work
   exists in the wild; cho.ventures is their marketing site, not the platform.
   Everything Taylor built sits behind a login.
3. **The built-card label stayed `RETREAT BOOKING PLATFORM`**, not
   `CHOZEN BOOKING PLATFORM` — the labels in that grid read as categories.
4. **Bruno's attribution changed on Tony's permission.** Bruno approved a
   specific line; if the email only covers the company name, ask him too.
