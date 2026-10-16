---
target: specs/web/ux/public/capabilities-words.md
status: approved
promoted:
---

# Capabilities — words

Part of `capabilities.md`. Gloss, handoff pass. The copy is Taylor's: nothing here is improved or new. Sources: `existing: <file>`; `canvas` (drawn on the locked page, the new intent); `[draft]` (a placeholder line on the canvas); `Taylor's to write`. Header and footer strings are the locked chrome's (overview, Navigation; D-SITE-2, 130).

## Page

| Where                     | String                                                                 | Source                                                         |
| ------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `<title>`, social title   | "Capabilities" / "Capabilities — Taylor Aucoin"                        | existing: `app/capabilities/page.tsx` [Gloss: the h1 changed; Taylor's call whether the title follows] |
| Meta description          | "Problems I comfortably take on — payments, AI features, design, data pipelines, realtime voice, consolidation — with the approach and the work behind each." | existing: `app/capabilities/page.tsx` |
| h1                        | "Problems I take on"                                                   | canvas (D-SITE-140)                                            |
| Framing line              | deep specialities, and any part of a product end to end                 | Taylor's to write (D-SITE-146)                                 |
| Filter label              | "Filter by problem or tool [draft]"                                    | [draft] (D-SITE-145)                                           |
| Filter placeholder        | "Filter — payments, search, AI…"                                       | existing: `components/capabilities/CapabilityGrid.tsx`         |
| Clear ×, accessible name  | "Clear the filter [draft]" (the no-match link's words)                 | [draft]                                                        |
| Tabs                      | "All", "Product & design", "Engineering", "AI & data", "Leading delivery" | canvas (D-SITE-146)                                         |
| Tablist, accessible name  | —                                                                      | Taylor's to write                                              |
| Result count (status)     | the count of chips showing, and the no-match line                      | Taylor's to write                                              |

## Chips and the open card

| Where                       | String                                                                                         | Source                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Chip names (25), also the toggle's name | as drawn, e.g. "0→1 builds", "Search and discovery", "Loose briefs, finished product" | canvas (home's lock, D-SITE-46); no field in the file yet (Open decisions) |
| Card title                  | `title`, e.g. "Search and discovery that actually finds things"                               | existing: `content/capabilities.ts`                          |
| Tech line                   | `tech`, e.g. "Elasticsearch · ranking · recommendations"                                        | existing: `content/capabilities.ts`                          |
| Approach                    | `approach`                                                                                     | existing: `content/capabilities.ts`                          |
| Proof line                  | "Done at [proof], usually on [engagement]. [draft]"; drawn as "usually on contract", "usually as a fixed-scope 0→1 build" | [draft], replaces "Usually shows up as · {offer}" (D-SITE-143) |
| Proof names                 | `proof[].label`, except "the family office platform" (file: "Family Office Platform")         | existing: `content/capabilities.ts`; canvas for the one change |
| External proof              | an external proof's accessible name says it opens another site                                 | Taylor's to write                                            |

## No match

| Where          | String                       | Source                                                                                         |
| -------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Line           | "Nothing by that name."      | existing: `CapabilityGrid.tsx` ("Nothing by that name —"); canvas punctuation                  |
| Clear link     | "Clear the filter [draft]"   | [draft] (D-SITE-145)                                                                           |
| Contact link   | "Send a note", to `/contact` | existing: Work with me's close (D-SITE-127); replaces `CapabilityGrid.tsx`'s "ask me anyway →" (D-SITE-174) |

## Close

| Where         | String                                                                | Source                                                                   |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Closing line  | "A 30-minute call, no pitch. We'll figure out if I'm the right fit." | existing: `content/services.ts` (`closing`)                              |
| Button        | "Book a 30-minute call"                                               | canvas, the site-wide label (A-17); the code's "Book a 30-min call →" goes |
| Fallback      | "Not ready to book?" and "Send a note", to `/contact` | existing: `components/services/ClosingCta.tsx`; Work with me's close (D-SITE-127, 174) |
