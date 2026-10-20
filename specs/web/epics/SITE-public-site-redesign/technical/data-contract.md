---
epic: SITE
status: approved
---

# SITE — technical notes: data contract

Content stays typed TS in `content/` (house rule). Validation at every boundary is zod, shared by client and server. Mason, judgment, unless cited.

## Content types

**Shared vocabulary**, in `content/work/types.ts`:

```ts
type WorkType =
  "full-time" | "contract" | "business" | "passion" | "client" | "own-brand";
type Discipline = "product" | "websites" | "branding";
```

**`CaseStudy` gains** (existing fields keep today's strings on the case-study page, D-SITE-189):

- `type: "full-time" | "contract" | "business" | "passion"`; Roomvy and Calculate are full-time (D-SITE-188).
- `listRole: string`, `/work` only; title case and the en dash applied at render (D-SITE-189).
- `sortDate: "YYYY-MM"`, newest first within a group (D-SITE-188).
- `facts: [Fact, Fact, Fact, Fact]`, `Fact = { value: string; meta: string; href?: string }`; only the fourth takes `href` (D-SITE-194, resolving its [PROPOSED]).
- `builtFormat: "band" | "gallery" | "rows-after" | "rows-paired"` (D-SITE-91's [PROPOSED]); for `rows-paired`, each `BuiltCard` takes `screen?: MediaItem`.
- `aiSat?: { ... }`, home's three lists; absent means `no-ai` (D-SITE-85).
- The testimonial is found by the testimonial's project link in `content/testimonials.ts`, never a second pointer.

**Website and branding rows** live in one file, **`content/work/rows.ts`** (D-SITE-188 leaves the name to Technical; not `showcase`, which is the coded track's internal key, verified `lib/routes.ts`):

```ts
type WorkRow = {
  id: string;
  discipline: "websites" | "branding";
  type: WorkType; // websites: "client"; branding: business | passion | own-brand
  title: string;
  tagline: string;
  role: string;
  period: string;
  sortDate: string;
  caseStudySlug?: string; // D-SITE-175: the story link renders only when set and published
  liveUrl?: string;
  gallery: MediaItem[];
  published: boolean; // Phoenix ships false (D-SITE-211)
  example?: {
    // read by /websites only (D-SITE-113, 114, 116)
    desktop: MediaItem;
    phone?: MediaItem;
    testimonial?: { quote: string; name: string; role?: string }; // named, or absent (kit §7)
  };
};
```

Read by `/work`, home's Websites and Branding tabs, and `/websites`' examples. Today's `content/websites-coded-case.ts` goes (D-SITE-114). A unit test asserts every `caseStudySlug` names a study in `content/work/` (a typo shows no link rather than breaking a build, so the test is the guard).

**`/about`'s experience** is about-only (D-SITE-197): `content/about.ts` gains `experience: { group: "full-time" | "contract" | "products" | "programmes"; name; role; years; slug?; anchor? }[]`. `content/work/*.ts` `role` is untouched.

**Capabilities** (`content/capabilities.ts`): `shortName`, `tabs`, and proof hrefs per `capabilities.md`'s [PROPOSED] lines, ticketed with `/capabilities`.

## Form contracts

`lib/validators/book.ts`, from `services-words.md` (option keys are code, labels are copy):

```ts
budget: "under-15k" | "15k-75k" | "over-75k" | "salary" | "none"
start:  "this-month" | "1-3-months" | "later" | "exploring"
role:   "product-engineer" | "product-designer" | "systems-consultant" | "fractional-cto"
      | "zero-to-one" | "website-or-brand" | "not-sure"
BookInput = { building: string(1..2000); budget; start; role; name?: string(..100); email: email(..254) }
Outcome = "fit" | "not_a_fit" | "website"
```

**The fit rule** (D-SITE-166), server-side only, in `app/book/_lib/fit.ts`: `role === "website-or-brand"` → `website`; else `budget ∈ {15k-75k, over-75k, salary}` and `start ∈ {this-month, 1-3-months}` → `fit`; else `not_a_fit`. `not-sure` can be a fit. The client never computes it.

**Note** (`lib/validators/note.ts`): `{ message: string(1..5000); name?: string(..100); email; from: "contact" | "not_a_fit"; screening?: { budget; start; role } }`. Not-a-fit prefills `message` with `building` and carries `screening` in hidden fields, unseen (D-SITE-201).

**Signup** (`lib/validators/note-signup.ts`): `{ email }`. A listed address answers exactly as a new one (`notes-already` = `notes-done`, so nothing tells an observer an address is on the list).

Every form adds a honeypot field and a render timestamp; a filled honeypot or a sub-two-second submit answers as success and does nothing.

## Where state lives

| State                           | Lives in                                                                                                                                         | Notes                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Screening answers, outcome view | the form and the action's returned state (`useActionState`)                                                                                      | URL stays `/book` in every view (C-SITE-services-18); the client sets focus and `document.title` on each view                  |
| Fit hand-off                    | a POST from the fit view to `app/book/handoff/route.ts`, answers in hidden fields                                                                | Re-validates, re-runs the fit rule, answers 303 to `BOOKING_URL` with the prefill ruled in C4. Nothing in a URL on this origin |
| Notes                           | emailed to Taylor, not stored (ruling C3)                                                                                                        | `reply-to` is the sender; nothing is ever sent to the submitted address                                                        |
| Signup addresses                | Postgres, `note_signups` (ruling C2): `id`, `email` (unique, lower-cased), `created_at`, `consent_version`, `source` (`home`), `unsubscribed_at` | No email is sent on signup; the first send to the list is a later ticket and starts with a confirmation                        |
| `/work` tab and type            | URL `?tab=`, `?type=` (D-SITE-101, 190)                                                                                                          | unknown values fall back                                                                                                       |
| `/capabilities` query and tab   | URL by `replaceState` (`q`, `tab`)                                                                                                               | the open card is not in the URL                                                                                                |
| Home tabs, chips, pillars       | component state                                                                                                                                  | `?state=` seeds them outside production                                                                                        |
| Theme                           | `next-themes`, default dark (D-SITE-61)                                                                                                          | existing provider                                                                                                              |

## `?state=`

`lib/page-state.ts`: `readPageState(searchParams, keys)` returns the requested key when it is in that page's States table, else `default`. On a production deployment (`VERCEL_ENV === "production"`) it returns `default` without awaiting `searchParams`, so production pages stay static and no fixture renders there. Fixtures are synthetic and co-located (`app/<route>/_fixtures.ts`). `pending-testimonial` is guarded twice: the reader, and `approved` in `content/testimonials.ts` (D-SITE-199). The intake has no public `?state=`: its states come from the admin client preview over seeded synthetic engagements (D-SITE-218).

## Events

`lib/analytics/events.ts` holds each event's name and its only allowed parameters; `track()` drops anything else and does nothing unless the consent gate has loaded the tag.

| Event                | Parameters, closed sets                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `book_call_click`    | `surface`: home, work-index, case-study, about, services, capabilities, websites; `placement`: header, hero, close, contact_sent, screening_fit; `slug` (case study only, a published slug) |
| `screening_outcome`  | `outcome`: fit, not_a_fit, website                                                                                                                                                          |
| `contact_note_sent`  | `surface`: services; `from`: contact, not_a_fit. Fires on the server's confirmation, never on click                                                                                         |
| `coded_intake_start` | Dropped (D-SITE-226); the `/websites` ticket fires only `book_call_click`                                                                                                                   |

No string parameter is free text. Page views: `send_page_view: false` at load; `PageViews` sends every page view with `page_location` minus `q` (D-SITE-179). SITE-M1 is defined in `doors-and-calls.md` (C5).
