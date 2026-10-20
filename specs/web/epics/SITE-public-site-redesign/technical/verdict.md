---
epic: SITE
status: approved
---

# SITE — technical notes: verdict and rabbit holes

Technical stage, 2026-10-16. Mason leads; Warden (personal data), Tally (events, SITE-M1) and Touchstone (test shape) applied as lenses in this thread, each labelled where it decides. Over the 2,000-token cap as one file, so split by section:

| File                 | Holds                                                       |
| -------------------- | ----------------------------------------------------------- |
| `verdict.md`         | Appetite verdict, build order, rabbit holes                 |
| `placement.md`       | Where every shared piece goes, by consumer                  |
| `data-contract.md`   | Content types, form contracts, where state lives, `?state=` |
| `doors-and-calls.md` | One-way doors, the calls routed to Taylor and their rulings |
| `test-shape.md`      | The test type per risk, and the harness                     |

Labels: verified (read in a named file), judgment (a role's call).

## Appetite verdict

**Not possible as scoped in ten days; possible with the brief's own cut.** (Mason, judgment; estimates, not measurements.)

- Spent: about two days (intent pass 2026-10-15 through the locks on 2026-10-16). Left: about eight.
- Rough build cost, hardening included: foundation (routes, redirects, chrome, skip link, close, analytics seam) 1; test harness 0.5–1; content contract 0.5; home 1.5–2; `/work` 0.5–1; case study, four formats, six studies 1.5; `/about` 0.75; Work with me with `/book` and `/contact` 1.5–2; notes signup 0.5. **Hirer path: about 8–10 days.**
- Beyond it: `/websites` with the platform fork about 1; `/capabilities` with its motion about 1; the intake restyle over both trees (about 200 idiom sites by the token rules' counts) 1.5–2. **About 3.5–4 more.**
- The brief names the cut: "cut the `/websites` and `/capabilities` restyles before any home or case-study ticket." The intake restyle was "tokens only" in the brief and grew at UX (D-SITE-152 to 163), so it goes with them.
- **Recommendation (routed, call C1):** cut every ticket now, as the brief requires, and build in this order; the last wave ships only if days remain, otherwise it opens the next cycle with no re-spec.

## Build order (for Reeve to wave)

1. **Foundation:** the test harness (C7); routes split and redirects; header, footer, skip link, close block, `BookCallLink`; the analytics seam with `q` stripped; dark default; site-wide not-found; `@modal` retired.
2. **Content contract:** types and the rows file (`data-contract.md`), filled for the six studies and the rows.
3. **Pages, parallel:** home; `/work`; the case study; `/about`; Work with me with `/book` and `/contact`; the notes signup (home's section, its own ticket for the table).
4. **Last wave, if days remain:** `/websites` (with `/websites/coded` → `/websites` and the platform golden file); `/capabilities`; the intake restyle.

Until wave 4 lands, `/websites` keeps today's chooser and the coded page stays at `/websites/coded`; links drawn to `/websites` resolve to the chooser, one click from the coded page (judgment: acceptable for a few days; the alternative is shipping the redirect before its page).

## Rabbit holes

Each patched in a sentence, or out of bounds.

- **`?state=` against static rendering.** Awaiting `searchParams` makes a page dynamic. Patched: `readPageState` returns `default` on a production deployment without touching `searchParams`, so production pages prerender static and fixtures never reach the public; local and preview builds honour every key (C-P08 holds where captures run).
- **`/work`'s tabs as links** (D-SITE-190) need `searchParams` in production. Patched: `/work` renders per request; it is small and server-only, and the Lighthouse audit (WEB-15) reads it like any page.
- **The first GA page view carries `?q=`.** `@next/third-parties` sends the config page view with the full URL. Patched: load gtag with `send_page_view: false` and send every page view from `PageViews`, the first included, with `q` stripped (D-SITE-179). This also stops GA4's site-search detection reading `q`.
- **A server action redirecting off-site.** Patched: the fit screen's button posts to a route handler, `app/book/handoff/route.ts`, which answers 303 to Cal.com; no action-redirect behaviour to rely on.
- **Header state needs the path.** Patched: the nav is a client leaf reading `usePathname` for `aria-current` and the hidden call button, as `SiteChrome.tsx` already does.
- **Shared tabs and chips behave three ways** (home: ARIA tabs and pressed toggles; `/work`: links with `aria-current`, D-SITE-190; `/capabilities`: a tablist). Patched: share the look (`cva` variants in `components/ui/`), never the behaviour; each consumer owns its own.
- **Spam on `/contact`, `/book` and the signup.** Patched: a honeypot (the intake's pattern, verified `_actions/start.ts`), a minimum fill time and field caps. Out of bounds: CAPTCHA (a bot check the reader solves) and an app-level rate limiter; if abuse shows, a Vercel Firewall rule on those POSTs is a dashboard change, no code.
- **`/websites/platform` must not change** (D-SITE-209). Patched: a golden HTML file of its body, taken from `main` before the fork, and a test that diffs it.
- **The intake restyle breaking money or saves** (C-SITE-intake-coded-12). Patched: the restyle diff may not touch `server/`, `_actions/`, `lib/intake/` or `lib/extras/`; a check, not a characterisation suite.
- **MIG-15 moves the app to `apps/web`** (verified contract). Out of bounds for this epic: every path here is root-relative, and MIG-15 is Taylor's call "in a window with no open branches".
- **Out of bounds:** a CMS; a `/notes` page and any send to subscribers (first post, later ticket); dashboards or new analytics tools (brief); the PEM page (D-SITE-128); Phoenix's row content (D-SITE-211); the care plan (D-SITE-212); a platform page restyle (D-SITE-112).

## Not Technical's

Carried as pre-build items: the `pillar-open` crop (D-SITE-184, blocks home only); the case-study capture re-export (D-SITE-196); the graded headshot (D-SITE-172); the two prices (D-SITE-203).
