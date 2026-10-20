---
target: specs/web/ux/public/about-words.md
status: approved
promoted:
---

# About — words

Part of `about.md`. Every string, by Gloss. Copy is Taylor's; nothing here is improved. Sources: `existing: <path>`; `canvas` (drawn on the About page, the canvas is the new intent); `[draft]` (a placeholder Taylor has not written); `Taylor's to write`. Flagged for Taylor's own rewrite, never ours (D-SITE-67): the story's em-dashes, "holistic", "fourteen cohorts" against the bar's [23], "gatherings with conscious people".

| Where | String | Source |
| --- | --- | --- |
| Meta title / description | "About — Taylor Aucoin"; "Product engineer from a bio-med background, based in Vancouver. Thirteen products taken from zero to one and 22 cohorts taught and sponsored." | `app/about/page.tsx` (2026-10-20: role and cohort count match home) |
| Header | Taylor Aucoin · Work · About · Work with me · Contact · Book a 30-minute call | canvas; "Contact" D-SITE-130 |
| Eyebrow | The person behind the work | existing: `app/about/page.tsx` |
| h1 · location | About · From BC · Vancouver for ten years | existing: page, `content/about.ts` `locationLine` |
| Story (3 paragraphs) | as `story` | existing: `content/about.ts` |
| How I think | heading; the three rows Systems, biologically · The weeds are the work · Builder's output, with bodies | existing: `content/about.ts` `howIThink` (Mentorship row moves to Teaching) |
| Experience heads | Experience · Full-time · Contract and fractional · My own products · Programmes | canvas (D-SITE-70) |
| Full-time rows | Everbook · Founding engineer, at Pine Studio · 2024 – 2025; Roomvy · Senior frontend engineer, at Pathfinder Studios · 2023; Calculate by QxMD · Frontend software engineer, a WebMD/Medscape company · 2019 – 2021; FYBR Inc. [Taylor confirms] · Developer, first development job · 2017 | canvas (roles differ from `content/work/*.ts` `role`; D-SITE-197); FYBR `[draft]` |
| Contract row | Multi-entity family office platform · Fractional CTO · 2026 | canvas; `content/work/future-of-cities.ts` |
| Own products | Conscious Connections · Founder, engineer, designer · 2026 – present; Agora · Founder, engineer · 2021 – 2026 | existing: `content/work/*.ts` |
| Also built | Also built · Social Photography Hub · Artist Hivemind Hub · Crypto Alerts · GIS Drone Imagery Reporting Suite | existing: `lib/config.ts` `OTHER_BUILDS` (Hivemind: Taylor confirms) |
| Programmes | BCIT ISSP · Technical client and senior engineer, Agora's teams · [years]; FLUI design hackathon · [role, Taylor confirms] · [year]; League of Innovators · [role, Taylor confirms] · [year] | canvas; brackets `[draft]` |
| Row links | Read the decision story (×6) · Teaching | canvas |
| Teaching | Teaching · [23] cohorts [Taylor confirms]; BCIT ISSP · Industry Sponsored Student Projects · [n] cohorts; VFS · Vancouver Film School · [n] cohorts; A design cohort · [programme name] · [n] cohort; Virtual interns · [programme name] · [n] cohorts | canvas; brackets `[draft]` |
| Teaching paragraph | "Five years and fourteen cohorts at BCIT — …" | existing: `content/about.ts` `howIThink` Mentorship body |
| Education | Lighthouse Labs · Web development [programme, Taylor confirms] · 2016; [School] · UX design · [year]; [School] · Digital marketing · [year]; [University] · Bio-medical degree, a semester off and then software · [years] | canvas; brackets `[draft]` |
| Tools | Tools · The full list is in my résumé [draft] | canvas; link line `[draft]` |
| Tools groups | Languages and frameworks · Data and content · Infrastructure and tooling · Commerce and messaging · AI | canvas (D-SITE-198) |
| Tools items | the core items, shown with the canvas's short labels (TanStack Query, Tailwind CSS, shadcn/ui, Linear, Prisma and Drizzle schema design) | existing: `content/stack.ts` core; labels canvas (D-SITE-198) |
| Testimonials | Testimonials · People I worked for · Engineers I led | canvas |
| Testimonial cards | name, title, relationship line, project label, full text, for Dawson, Bruno, Vaughn, Yogesh | existing: `content/testimonials.ts`; Bruno's relationship line as drawn, "Family office engagement · 2026" (canvas) |
| Pending card | Pending approval · Alex Example · Software Developer, Example Co. · [Synthetic relationship line] · two "[Synthetic]" paragraphs | canvas, synthetic fixture only (D-SITE-12) |
| Off the clock | heading and two paragraphs | existing: `content/about.ts` `offTheClock` |
| Close | closing line | existing: `content/about.ts` `closingLine` |
| Close availability | Available now · {availability} | existing: `content/services.ts` `availability`; separator a middot (canvas) |
| Close actions | Book a 30-minute call · Résumé (PDF) · Not ready to book? · Send a note | canvas; "Send a note" from Work with me's close (D-SITE-127, D-SITE-174) in place of the address |
| Footer | tayloraucoin.com · About · Résumé · Contact · GitHub · LinkedIn · Privacy; the address beside the domain | canvas; "Contact" D-SITE-130 |
| Hidden names | ", {row name}" after each "Read the decision story"; "(PDF)" on the Tools résumé link| Taylor's to write if he wants other wording |
