---
target: specs/web/ux/public/services-words.md
status: approved
promoted:
---

# Work with me — words

Part of `services.md`. Every visible string as drawn on the locked canvas, with its source. Sources: **svc** existing `content/services.ts`; **wc** existing `content/websites-coded.ts`; **canvas** drawn without a mark, the canvas is the intent (Taylor's; ship as is); **[draft]** a placeholder line Taylor has not written; **Taylor's** a bracketed slot he writes. Build ships the text without the `[draft]` tag only once Taylor clears it. Nothing here is new copy.

## Chrome

| Where | String | Source |
| --- | --- | --- |
| Header | Work · About · Work with me · Contact · Book a 30-minute call | canvas (D-SITE-2, 130; A-17) |
| Theme toggle name | Theme | existing `components/ui/ThemeToggle.tsx` |
| Footer | tayloraucoin.com · hello@tayloraucoin.com; About · Résumé · Contact · GitHub · LinkedIn · Privacy | canvas (D-SITE-130); address `lib/config.ts` |
| Document titles | the view's H1 | [ASSUMPTION: H1 reused]; `/work-with-me` keeps "Work with me" (existing `app/services/page.tsx`); its description follows D-SITE-129 at build |

## `/work-with-me`

| Where | String | Source |
| --- | --- | --- |
| Eyebrow | Vancouver · Contract & fractional | existing `components/services/ServicesHero.tsx` |
| H1 | Work with me | existing |
| Availability (hero and close) | Available now · Taking up to two engagements, or the right full-time role. | svc `availability` |
| Sub | the seat scales with the team … | Taylor's (D-SITE-129) |
| Hero buttons | Send a note [draft] · Book a 30-minute call | [draft]; A-17 |
| Section heads | Roles [draft] · Building, for clients [draft] · How I work · How to start · FAQ | [draft]; the last three existing |
| Terms | Full-time · contract · fractional (two rows) · Scoped engagement · Retainer, 1–2 days a week · Fixed scope, 8–16 weeks | canvas (D-SITE-57) |
| Product engineer | Teams that need senior throughput now. / Embed with your team, on your stack and conventions · Ship production features end to end · Raise the bar in review and specs | svc |
| Product designer | [Taylor's line] / what the seat covers | Taylor's |
| Systems consultant | System design, before the build. / what the engagement delivers | [draft]; Taylor's |
| Fractional CTO | Non-technical founders and scaling teams. / Architecture and technical strategy · Hiring, code review, and standards · AI-native process — conventions that let a team build safely | svc |
| 0→1 build | Founders who need a real product, not a prototype. / Idea to shipped product … · Built solo, with weekly written updates · Documentation and conventions the next engineer inherits | svc |
| Price anchor | Most engagements land between $15K and $75K CAD. Fixed scope where it makes sense, with no hourly surprises. | svc (D-SITE-121) |
| Coded website | Coded website · $2,000 CAD + GST · Websites for creative work. 3 days to your first look. · Websites · Send a note [draft] | wc; canvas link label |
| Branding | Branding · {price} · [Taylor's line] · Branding & UI · Send a note [draft] | price Taylor's before launch, as "$N CAD + GST" (D-SITE-203); Taylor's; tab label D-SITE-38 |
| Conventions install | Conventions install [draft] · {price} · [Taylor's line] · Send a note [draft] | [draft]; price as branding's; Taylor's |
| How I work rows | Typed end to end … Weekly written updates (five title · line pairs) | svc |
| What I'm not | label "What I'm not"; three lines | svc `whatImNot` |
| How to start | 1 A 30-minute call · 2 A scoped proposal · 3 A start date, each with its line | svc; step 1 Taylor's to rewrite (note leads) |
| Reply line | I reply within one business day. | svc `replyLine` |
| FAQ | five question · answer pairs, How do engagements start? … Are you available now? | svc `faq`; first answer Taylor's to rewrite |
| Close | a closing line that leads with a note, then the call · Send a note [draft] · Prefer a call? · Book a 30-minute call | Taylor's; [draft]; canvas |

## `/book`

| Where | String | Source |
| --- | --- | --- |
| H1, intro | Before we book · Four quick questions, so the 30 minutes are useful to both of us. | [draft] |
| Fields | What are you building? (hint: A sentence or two is plenty.) · Budget · When do you want to start? · The role you need · Name · Email (hint: you@company.com) | [draft]; Name, Email canvas |
| Budget chips | Under $15K · $15K–$75K · Over $75K · A full-time salary · No budget yet | canvas (D-SITE-166) |
| Start chips | This month · In 1–3 months · Later · Just exploring | canvas |
| Role chips | Product engineer · Product designer · Systems consultant · Fractional CTO · 0→1 build · A website or brand · Not sure yet | canvas (D-SITE-57, 166) |
| Button; beside | Continue · I reply within one business day. | [draft]; svc |
| Field errors | Pick the closest band, or "No budget yet". · That doesn't look like an email address — check for a typo. | [draft]; canvas. Other groups and the textarea: Taylor's to write, same pattern |
| Sending | Sending… | canvas (D-SITE-169) |
| Send error | That didn't send — your answers are still here. Try again, or email hello@tayloraucoin.com | [draft] |
| Fit | Let's book it · Thanks, {first name}. That sounds like a good fit. Pick a time on my calendar. · Book a 30-minute call · Rather write first? · Send a note | [draft]; A-17 |
| Not a fit | Let's talk first · Thanks, {first name}. From what you've shared, a short exchange by email will tell us more than a call. Add anything you like and send it. · Your note · Send a note | [draft] |
| Website line | Need a website or a brand? · See how a coded site works | canvas; [draft] |

## `/contact`

| Where | String | Source |
| --- | --- | --- |
| H1, intro | Contact · Tell me what you're working on, or just ask. I reply within one business day. | canvas; [draft] |
| Fields | Message (hint: A sentence or two is plenty.) · Name · Email (hint: you@company.com) | canvas; [draft] |
| Button; beside | Send a note · Or email hello@tayloraucoin.com | [draft]; canvas |
| Field errors | Add a line or two about what you need. · the email line as `/book` | [draft]; canvas |
| Send error | That didn't send — your note is still here. Try again, or email hello@tayloraucoin.com | [draft] |
| Sent | Sent. I'll reply to {email} within one business day. · Prefer a call? · Book a 30-minute call | [draft]; canvas |

Synthetic data on the canvas (Sam, Sam Rivera, sam@example.com, the sample notes) never ships. `{first name}` and `{email}` come from the visitor's own answers; with Name blank the greeting drops ", {first name}" (D-SITE-201). Contact keeps "Or email hello@tayloraucoin.com" beside the button in every state (D-SITE-202).
