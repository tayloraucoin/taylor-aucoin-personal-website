# Taylor's feedback, round 3 — 2026-10-19

Taylor's own words, given after round 2 (lanes E, F, P, H) was merged on `feature/website-rebrand` and served on :4320. This file is the source of truth for round 3. Images are in `assets/`.

## Assets

| File                              | What it is                                                                                                                                                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/work-filter-cramped.webp` | /work, Product engineering tab, "Full-time" chip on, at desktop width: the "Read the decision story" link wraps one word per line in a narrow third column, rows sit in the left two-thirds, and each row's divider runs only about a fifth of the width |

Taylor also attached two earlier résumés (outside the repo, for the résumé thread only): `~/Documents/Professional/Job search/Resumes/Taylor_Aucoin_-_Senior_Engineer_2026.pdf` and `~/Documents/Professional/Job search/Resumes/Taylor_Aucoin_Senior_Staff_Fullstack_Engineer.pdf`.

## Feedback, as given

- The branding UI examples need more frames. For example, we literally have tons in the Paper files. Namely the colour palette, typography, etc. Lots of good examples to pull from.
- Agora branding UI: lead with the dark background. I don't care for the light one as much.
- On /work, when off of All, the columns get weird and cramped. (See the screenshot.)
- On /about's history, it lists "Also built: Social Photography Hub · Artist Hivemind Hub · Crypto Alerts · GIS Drone Imagery Reporting Suite", but Crypto Alerts and GIS Drone are now above, in full-time work.
- VFC is the program, not VFS: https://ventureforcanada.ca/programs/intrapreneurship. These are the cohorts.
- That section title should maybe be more like "Teaching & Sponsoring Programs", since they are all free or cheap programs to leverage student work for my projects. I just happened to teach a lot to get them to do what I needed, and to be successful in the projects.
- At the end of /about's testimonials, ideally link to read more on LinkedIn: an anchor, or the recommendations path of my profile.
- Separate thread: look over the new branding (dark) and write a prompt for creating a new résumé with the branding and recent info. Use the two earlier versions as structural reference, but make it the best logical version that pairs with the website's branding, information and framing. The context is me as everything I state myself to be on my website: the website is the source of truth.

## Orchestrator's notes (2026-10-19, not Taylor's words)

- **Branding frames:** the rows are in `content/work/rows.ts` (`agora-kit`, `conscious-connections-kit`, …). Agora's gallery holds two light frames today (`agora-brand-cover.jpg`, `agora-brand-logo.jpg` in `public/images/branding/`). The kits live in Paper. Exporting frames from Paper is read-only on the Paper file.
- **Also built:** rendered by `app/about/_components/Experience.tsx` (~L37, D-SITE-68). `content/about.ts` already lists "The Chart Guys (Crypto Alerts)" (~L100) and "FYBR Inc. (GIS Drone Imagery Reporting Suite)" (~L106) as roles.
- **VFS → VFC:** `content/about.ts` ~L159 reads `{ name: "VFS", line: "Vancouver Film School · 4 cohorts" }`. That is wrong: it is Venture for Canada's intrapreneurship program. `content/home.ts` ~L25 also says "VFS" in the cohorts fact's meta. Check the count with Taylor if the page doesn't settle it.
- **Section title:** the teaching ledger (`teachingLedger`, `teachingCount = "22 cohorts"`) and home's "22 cohorts taught" fact. A title change is Taylor's wording ("Teaching & Sponsoring Programs"). Whether home's "cohorts taught" fact follows is his call too.
- **LinkedIn:** `lib/config.ts` ~L120 has `https://www.linkedin.com/in/taylor-aucoin/`. LinkedIn's recommendations view is `…/in/taylor-aucoin/details/recommendations/`. It needs a sign-in to view, which is worth a line to Taylor.
- **/work cramped columns:** the grid seems to change track sizes when a type filter is on. Reproduce at 1440 with each chip, and compare against All.
