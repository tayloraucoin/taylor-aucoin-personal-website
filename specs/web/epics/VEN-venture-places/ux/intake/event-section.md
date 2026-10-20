---
target: specs/web/ux/intake/event-section.md
status: approved
promoted:
---

# Event section — intake

## Job

Anyone with an event coming (a summit first, then a retreat, an open day, a workshop or a festival) gives the facts its page and sign-up need. Done means dates, place, capacity, prices, speakers and what "registry" means are each answered or marked "Not sure yet". Every kind meets it, on the coded track only.

## Layout and components

On Work, after the asks block (and after Applying on venture-place), before the claims cluster. It is built from `ChoiceAnswer`, `TextAnswer`, `LongAnswer` and nested `Reveal`. One event only (D-VEN-16).

| #   | Key                   | Shape                                                                  | Shown when          | Critical |
| --- | --------------------- | ---------------------------------------------------------------------- | ------------------- | -------- |
| 1   | `hasEvent`            | radio: `yes`, `no`                                                     | always              |          |
| 2   | `eventType`           | radio: `summit`, `retreat`, `openDay`, `workshop`, `festival`, `other` | 1 `equals yes`      |          |
| 3   | `eventFormat`         | radio: `inPerson`, `online`, `both`, `unsure`                          | 2 answered          |          |
| 4   | `eventDates`          | text                                                                   | 2 answered          | yes      |
| 5   | `eventPlace`          | text                                                                   | 2 answered          | yes      |
| 6   | `eventPlaceConfirmed` | radio: `yes`, `notYet`, `unsure`                                       | 2 answered          | yes      |
| 7   | `eventCapacity`       | text                                                                   | 2 answered          | yes      |
| 8   | `eventWhenFull`       | radio: `waitlist`, `close`, `addDate`, `unsure`                        | 2 answered          |          |
| 9   | `eventPricing`        | radio: `free`, `paid`, `pwyc`, `unsure`                                | 2 answered          | yes      |
| 10  | `eventTiers`          | long                                                                   | 9 `in [paid, pwyc]` | yes      |
| 11  | `eventSpeakers`       | long                                                                   | 2 answered          | yes      |
| 12  | `eventSchedule`       | long                                                                   | 2 answered          | yes      |
| 13  | `eventRegistry`       | radio: `public`, `private`, `application`, `gift`, `unsure`            | 2 answered          | yes      |
| 14  | `eventAfterSignup`    | long                                                                   | 2 answered          |          |
| 15  | `eventSignupTool`     | text                                                                   | 2 answered          |          |
| 16  | `eventConsent`        | radio: `separately`, `no`, `unsure`                                    | 2 answered          | yes      |
| 17  | `eventRefunds`        | long                                                                   | 2 answered          | yes      |
| 18  | `eventLodging`        | long                                                                   | 2 answered          |          |
| 19  | `eventInvestment`     | radio: `yes`, `no`, `unsure`; venture only (`raise`, in `KIND_GATED`)  | 2 answered          | yes      |
| 20  | `eventKeeper`         | text                                                                   | 2 answered          |          |
| 21  | `eventOthers`         | long                                                                   | 1 `equals yes`      |          |

- "Shown when 2 answered" is a `Reveal` on `eventType in [all six]`. Rows 2–21 are `REVEAL_GATED`; radios are `CHOICE_BACKED`.
- Text keys are critical by default; none joins `NON_CRITICAL`.
- Base question: there is no registry flag except row 19.
- The intake document prints the block only when `hasEvent = yes`, and then lists "Event attendees" among the audiences (D-VEN-14).
- Cut order if over time: rows 17 and 18.

## States

The base rows are in `overview.md`.

| State                   | Key                | What shows                                                                                | What the person can do | Copy  | Artboard |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------------- | ---------------------- | ----- | -------- |
| off                     | `event-off`        | row 1 only, unanswered or `no`                                                            | answer                 | below | `—`      |
| yes, no type            | `event-yes`        | rows 1, 2 and 21                                                                          | pick a type            | below | `—`      |
| summit                  | `event-summit`     | rows 1–21 except 10 and 19, on a portfolio                                                | answer                 | below | `—`      |
| paid                    | `event-paid`       | as summit, with row 10 open                                                               | add tiers              | below | `—`      |
| venture, investment yes | `event-investment` | row 19 = yes, with its follow-up line under it                                            | carry on               | below | `—`      |
| switched off            | `event-cleared`    | `hasEvent` set back to `no`: rows 2–21 gone, stored answers kept, the document omits them | turn it back on        | —     | `—`      |

## Words

By Gloss. `[COPY — pending Taylor]`, floor pack (D-VEN-24).

1. "Do you have an event planned?". Help: "A summit, a retreat, an open day. If it needs a page or a sign-up, tell us about it here." Options: "Yes", "No".
2. "What kind of event?". Options: "Summit", "Retreat", "Open day", "Workshop", "Festival", "Something else".
3. "In person or online?". Options: "In person", "Online", "Both", "Not sure yet".
4. "When, and in which time zone?". Help: 'If the dates aren\'t set, say "not fixed yet" and roughly when.'
5. "Where?". Help: "The venue and the town, or the property itself."
6. "Is the place confirmed?". Options: "Confirmed", "Not yet", "Not sure".
7. "How many people can come?". Help: "In person and online, if it's both."
8. "And when it's full?". Options: "A waitlist", "Sign-ups close", "We add a date", "Not sure yet".
9. "Is it free?". Options: "Free", "Paid", "Pay what you can", "Not sure yet".
10. "Tiers and prices". Help: "Each tier, its price and currency, and what it includes."
11. "Speakers". Help: "Mark each one confirmed or invited, and say whether we may name them yet."
12. "A draft schedule". Help: 'Paste what you have, or write "to come".'
13. "When people sign up, what are they joining?". Help: "This decides what we build." Options: "A public list of who's coming", "A private sign-up list", "An application list you review", "A gift or contribution registry", "Not sure yet".
14. "What arrives after someone signs up?". Help: "A confirmation, a calendar invite, a payment link. Whatever you send now."
15. "Where do sign-ups go?". Help: "The tool, and whose account it's in."
16. "May you email sign-ups about anything else?". Help: "Stays or other events, for example. If yes, the sign-up asks for that on its own line." Options: "Yes, asked separately", "No", "Not sure yet".
17. "Refunds and transfers". Help: "What happens when someone can't come."
18. "Where do people stay?". Help: "On site, nearby, or nowhere needed."
19. "Will any part of it present the investment?". Options: "Yes", "No", "Not sure yet". The line under it on `yes`: "Then your counsel should see the invitations and slides before they go out."
20. "Who keeps the dates current after launch?". Help: "A name. Past dates left on a page make people think the place has closed."
21. "Any other events coming?". Help: "Name them and roughly when."

## Access

By Threshold.

- Radios are `fieldset`s with legends.
- A reveal opens after its trigger in DOM order. Focus stays on the trigger, and nothing is announced (the §6.5 reveal law). Hidden rows leave the tab order.
- Row 19's follow-up line is plain text after the group, linked to it with `aria-describedby`.
- Ids follow `f-<key>`.
- Reduced motion: reveals appear without animation.

## Instrumentation

None. No answer leaves the answers document.

## Criteria

| ID            | When                                 | Then                                                                                                                       | Evidence |
| ------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-VEN-event-1 | any of the six kinds, coded track    | row 1 renders on Work after the asks (and after Applying when present) and before claims; the durable track has none of it | test     |
| C-VEN-event-2 | `hasEvent = yes`                     | rows 2 and 21 render; rows 3–20 render only once `eventType` is answered                                                   | test     |
| C-VEN-event-3 | `eventPricing` is `paid` or `pwyc`   | row 10 renders; on `free` or `unsure` it is hidden and its text is kept                                                    | test     |
| C-VEN-event-4 | a non-venture kind                   | row 19 is absent; on venture it renders, and `yes` shows the follow-up line                                                | test     |
| C-VEN-event-5 | the primer and ingestion inventories | every key from row 2 on is `REVEAL_GATED`; radios are `CHOICE_BACKED`; text keys are critical                              | test     |
| C-VEN-event-6 | the intake document                  | prints the event block and adds "Event attendees" to the audiences only when `hasEvent = yes`                              | test     |
| C-VEN-event-7 | the state rows                       | captured at 390, 834 and 1440, light and dark, reduced motion                                                              | capture  |
| C-VEN-event-8 | keyboard only from row 1 to row 21   | the order matches the visual order, and focus never moves on its own                                                       | manual   |

## Decisions and open items

D-VEN-14, 15, 16, 17, 24 (`overview.md`). Nothing blocks.
