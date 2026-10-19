---
title: tayloraucoin.com metric definitions
description: The site's named metrics, versioned, both series kept on a change.
layer: measurement
status: adopted
role: Tally
date: 2026-10-19
last_reviewed: 2026-10-19
supersedes:
load_when: metrics, spec
---

# tayloraucoin.com metric definitions

## SITE-M1 — screened calls booked v1

| Field                                 | Definition                                                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Meaning                               | How many intro calls are booked by people who came through the site's screening.                                                                                                       |
| Formula (primary)                     | Cal.com bookings carrying `metadata[source]=site-screening`, counted in Cal.com.                                                                                                       |
| Companion (always reported alongside) | `book_call_click` at every other placement (`header`, `hero`, `close`, `contact_sent`): the funnel into screening.                                                                     |
| Denominator                           | `book_call_click` with `placement: screening_fit`. Every hand-off has passed the fit rule, which a "website or brand" role cannot. Excludes Taylor's own and test bookings.            |
| Segment                               | `surface` of the click; the role passed with the hand-off.                                                                                                                             |
| Window                                | Calendar month; a booking counts in the month it was made, whatever the call's date.                                                                                                   |
| Direction                             | Higher is better for the primary and the rate over the denominator; the companion is read, not targeted.                                                                               |
| Version                               | v1, 2026-10-19                                                                                                                                                                         |
| Status                                | live once SITE-22 ships the hand-off                                                                                                                                                   |
| Dependency                            | The `/book` hand-off posting `metadata[source]=site-screening` (D-SITE-225) and the `book_call_click` event (D-SITE-226). Without the source tag, the weaker fallback is all bookings. |

## Guardrails

| Guardrail          | Definition (event IDs)                                                     | Breach                    |
| ------------------ | -------------------------------------------------------------------------- | ------------------------- |
| No free text in GA | Every `book_call_click`, `screening_outcome` and `contact_note_sent` value | Any value outside its set |

## Changelog

- 2026-10-19: SITE-M1 v1, first definition (D-SITE-226; Taylor's ruling at the Tickets gate, changelog 2026-10-16).
