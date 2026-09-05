import type { LabelRow } from "@/components/ui/LabelRows";
import type { PricedRow, ProcessStep } from "@/content/websites";
import { showcaseIntakeRoutes } from "@/lib/routes";

/**
 * `/websites/coded` page content. Typed TS, no CMS — same pattern as
 * content/websites.ts, whose idioms this file follows deliberately. The two
 * pages have to read as siblings.
 *
 * The register is Taylor's: first person, plain, blunt where bluntness is
 * honest. No exclamation marks, no marketing verbs, sentence case. Held to the
 * Human-Hand scan (~/Documents/Professional/Job Search/human-hand-mode.md) and
 * drafted at zero em dashes rather than scanned down to zero afterwards.
 *
 * COMMERCIAL FACTS ARE RATIFIED, NOT INVENTED. Price, split, page count,
 * timeline, add-on prices, and change tiers all come from Taylor's rulings
 * recorded in docs/websites/PORTFOLIO-MARKETING-EXECUTION-SCOPE.md §2. Two
 * add-ons are deliberately absent; see the note above `addOns`.
 *
 * This draft is the armature Taylor cuts from. His read-aloud pass is still his.
 */

/* ── Where the CTAs point ─────────────────────────────────────────────── */

/**
 * The coded track's questionnaire shipped in a parallel thread at
 * `/websites/coded/intake` (`showcaseIntakeRoutes.start`). Every primary CTA on
 * this page now points there, matching the platform page's law: starting is
 * the primary action, booking a call is the ghost for people who want to talk
 * first.
 *
 * This file no longer decides where the CTA points on its own — it did while
 * the intake was being built elsewhere, and pointed every button at a call in
 * the meantime rather than shipping a disabled button or a "coming soon."
 */
export const startHref: string = showcaseIntakeRoutes.start;
export const ctaLabel = "Start your site →";

/* ── Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: "Built in code · Agora Network Technologies",
  title: "Websites for creative work",
  sub: "Your work is the reason anyone hires you. Most professional websites use templates that were designed for somebody else's work. I build one shaped around what you actually do, in code that you get to keep.",
} as const;

/**
 * Three questions answered before the first scroll: what does it cost, how fast
 * do I see something, what does it cost me to keep.
 *
 * The third cell is the surprise, same mechanism as the platform page's `$0`.
 * Its label does the work that matters: the free tier is Vercel's arrangement
 * and the label says so, because Taylor will not personally underwrite free
 * hosting forever and no cell on this page may read as though he has. The
 * pricing section carries the link to Vercel's own terms.
 */
export const heroStats: Array<{ value: string; label: string }> = [
  { value: "$2,000", label: "CAD + GST" },
  { value: "3 days", label: "To your first look" },
  { value: "$0/mo", label: "Hosting, on Vercel's free tier" },
];

/**
 * The line under the buttons, and it is load-bearing rather than a disclaimer.
 * The one sentence here written for the least certain reader on the page: it
 * says what the button does and what it does not do, which is what makes the
 * button safe to press.
 *
 * Mirrors the platform page's note exactly in shape: a few details, then
 * payment, nothing charged before that. The shared `WebsitesHero` component
 * appends "Rather talk it through first?" plus the phone number after
 * whatever runs here, so this sentence does not need to invite the call itself.
 */
export const heroNote =
  "A few quick details first, then you choose how to pay. Nothing is charged until then.";

/* ── What you get ─────────────────────────────────────────────────────── */

export const deliverables: LabelRow[] = [
  {
    label: "The site",
    body: "Five pages, built around your work. What goes onto each page is set by the answers you provide in the intake form, which includes steps to capture your authentic voice and the tone you want your audience to hear. Project detail pages don't count against the five.",
  },
  {
    label: "Your work, presented properly",
    body: "I take in your media library up front, either by access link or file upload. On your pages, video is embedded from Vimeo or YouTube so it plays properly on a phone with bad reception, and stills run at full quality. Each page represents your project, service, award, or whatever shows you at your best.",
  },
  {
    label: "A style guide",
    body: "The brand pillars, colours, typography, and the spacing and styling rules the site is built on, written down and handed over. It's what makes your brand look professional and stops the next thing with your name on it from looking like it came from a different person.",
  },
  {
    // The GitHub repository lives here rather than as its own row (was "The
    // repository") — it's part of what the stack is, not a separate deliverable.
    label: "Real code",
    body: [
      "Built on ",
      { text: "Next.js", href: "https://nextjs.org" },
      ", ",
      { text: "TypeScript", href: "https://www.typescriptlang.org" },
      ", and ",
      { text: "Vercel", href: "https://vercel.com" },
      ". Each is the top modern choice for a site like this, not something you'd find inside a template. If the site needs a database, that's ",
      { text: "Supabase", href: "https://supabase.com" },
      ", for the same reason. No page builder, no theme, and no plugin that breaks the site when somebody else pushes an update to it. Everything lives in a ",
      { text: "GitHub", href: "https://github.com" },
      " repository in your name. Every file, every change, and the full history of how it got built.",
    ],
  },
  {
    label: "Built for search",
    body: "Clean markup, fast pages, and proper metadata from day one, so you've got the best shot at being found organically. The SEO blog add-ons build on that if you want more than the site on its own gives you.",
  },
  {
    label: "Your own accounts",
    body: "Your domain, your Vercel account, and Supabase if the site needs a database, all registered to you and paid by you. I don't sit in the middle of any of them.",
  },
  {
    label: "A guide to changing it yourself",
    body: "Written for your site specifically. It walks you through editing the site with Claude Code by describing the change you want in ordinary words. You do not have to learn to code to use it, and using it doesn't cost you a subscription to me.",
  },
  {
    label: "Your old links keep working",
    body: "If your current site has been up for years, people still reach it through old emails, other website pages, and articles somebody wrote in 2019. Those addresses get redirected to the right pages on the new site instead of dying with the old one.",
  },
];

/* ── How it goes ──────────────────────────────────────────────────────── */

/**
 * Step 02 carries the depth that step 03 carries on the platform page. It is
 * this page's proof that a system exists rather than a workflow, and it is the
 * only place here where the extra depth is spent.
 */
export const processSteps: ProcessStep[] = [
  {
    title: "You fill out the questionnaire",
    system: "Structured intake",
    body: "Nine steps, about forty-five minutes, longer if your back catalogue runs deep. It asks what you do, who you've done it for, who your audience is today, what you want more of, and what you'd rather stop being called about. Every question is optional and it saves as you type, so you can put it down and come back.",
  },
  {
    title: "You go through the style taste gallery",
    system: "Taste extraction",
    body: "This is the step that replaces a designer showing you three drafts you don't like. You look at real websites from across the whole spectrum, favourite the ones that resonate, and say what catches your eye about them. It works like picking a template, except the thing it collects is why you picked it.",
    detail: [
      "Real sites, not mood boards. Every one is a working website you can open and click around",
      "Ranking. You put your favourites in order, and the order plus your notes is what the design gets built from",
      "The other direction. What makes you close a tab instantly turns out to be worth as much as what you like",
    ],
  },
  {
    title: "You paste in whatever already exists",
    system: "Credits import",
    body: "Your documents, your CV or résumé, your IMDb page, the projects off your old site, anything that feels helpful. Paste the whole mess in and press a button, and it comes back sorted into entries you can correct. Nothing is stored as fact until you've looked at it.",
  },
  {
    title: "You record a voice note",
    system: "Voice capture",
    body: "Two or three minutes on your phone: how you got into this, and one piece you're proud of and why. Don't script it. It's the most useful thing you can give me, because it's where the writing on the finished site gets its voice.",
  },
  {
    title: "I build it",
    system: "Build",
    body: "You see the first look within three days of your final answers. How long the whole thing takes from there depends on how many rounds of feedback you want, and the clock pauses whenever I'm waiting on you.",
  },
  {
    title: "You tell me what's wrong",
    system: "Revision",
    body: "I send you a link to a real working site. Load it on your phone, open it in front of whoever's opinion you actually trust, and come back with the list.",
  },
  {
    title: "It goes live on your address",
    system: "DNS cutover",
    body: "You settle the balance and it goes live, usually the same day. If you had a site there before, the old links get redirected so nothing pointing at you breaks. Your existing email keeps working. That's part of the job.",
  },
  {
    title: "You get the keys",
    system: "Handoff",
    body: "The repository, the accounts, the style guide, and the guide to changing the site yourself. Everything is already in your name by this point, so handoff is a conversation rather than a transfer.",
  },
];

/* ── What you actually own ────────────────────────────────────────────── */

/**
 * The page's thesis, promoted out of the pricing section into a section of its
 * own. On the platform track this passage is a paragraph beside the price card;
 * here it is the differentiator against both anchors the buyer arrives holding,
 * so it gets the structural emphasis.
 *
 * `emphasis` renders in --color-ink against --color-body body copy. It is the
 * one weight change in the section and it lands on Taylor's own sentence.
 */
export const ownership = {
  before:
    "The domain is registered to you. The hosting account is in your name and you pay whatever Vercel charges for it, which for a site this size is nothing. The code sits in a repository with your name on it, and the guide I write teaches you to change the site by describing what you want changed. There is no subscription to me anywhere in that, and nothing of yours routes through an account of mine. Which means: ",
  emphasis: "if you ever want to fire me, you keep everything.",
  after:
    " Your site, your domain, your code, and the ability to keep working on it without me. I'm not the kind of web guy who holds your work hostage. That's on purpose.",
} as const;

/**
 * The Vercel qualifier, and it is Taylor's ruling that it exists.
 *
 * He will not personally promise free hosting forever, because it is not his
 * promise to make. Free is Vercel's tier under Vercel's terms, the client is
 * the account holder, and the page says exactly that and links to the source.
 * Do not soften this into "hosting is free" anywhere on the page.
 *
 * The link to Vercel's own pricing is NOT here. It sits on the `$0` row of the
 * price card in the very next section, because that is where the claim is made
 * as a number and where somebody sceptical goes to check it. Carrying the same
 * link twice within 500px read as padding rather than as thoroughness.
 */
export const hostingTerms = {
  body: "Free hosting here is Vercel's arrangement rather than mine. You're on their free tier, in your own account, under their terms, and those are theirs to change. It has been free for sites this size for years and I have no reason to expect that to move, but I'd rather you hear the shape of it from me than find it out later. The link to their current pricing is on the price below.",
} as const;

/* ── Pricing ──────────────────────────────────────────────────────────── */

export type PricingRow = {
  label: string;
  value: string;
  link?: { label: string; href: string };
};

export const pricing = {
  label: "Site build",
  amount: "$2,000",
  currency: "CAD + GST",
  terms: "Two ways to pay.",
  /** Rendered as a short list under the terms line. The platform card has no
   *  equivalent because it has one payment shape; this track has two. */
  options: [
    "Half to start, half before it goes live.",
    "Or $1,900 in full up front, which is five percent off.",
  ],
  rows: [
    { label: "Ongoing cost to me", value: "$0" },
    {
      label: "Ongoing cost to run the site",
      value:
        "$0 on Vercel's free tier, in your own account and under their terms. Video is embedded rather than hosted, which is what keeps it there.",
      link: { label: "Vercel's pricing", href: "https://vercel.com/pricing" },
    },
  ] as PricingRow[],
} as const;

/**
 * ORDER MATCHES THE PAY SCREEN. Extra pages lead because they are a scope rule
 * rather than an upsell (they are what the five-page line means in practice);
 * the remaining three are the checkout's own rows in the checkout's own order,
 * so a reader who buys does not meet a reshuffled menu one screen later.
 *
 * The admin panel is live at $500, ruled by Taylor on 2026-08-26 (`M-PORT-6`,
 * "admin panel is an upsell right now"). It is seeded active and
 * `offeredAtCheckout: true`, and its row here is a compressed form of the
 * catalogue description rather than a new claim.
 *
 * ITS SECOND SENTENCE IS LOAD-BEARING AND MUST NOT BE CUT AS FLUFF. The whole
 * page argues that a written guide gives you control of your own site without
 * paying anyone a subscription. A $500 login sold immediately under that
 * argument reads as an admission the guide is not really enough, unless the row
 * says plainly that most people don't need it. The catalogue copy says exactly
 * that, Taylor wrote it that way, and honesty here protects the thesis rather
 * than costing a sale.
 *
 * [OPEN - Taylor] The care plan ($100/month) is still absent, and as of
 * `M-PORT-6` that is a decision rather than a pending signature: "don't charge
 * for the maintenance care plan until it's done." It is seeded inactive, sells
 * nowhere in v1, and nothing recurring ships. When its scope settles, add:
 *
 *   { label: "Care plan · email me a change, live within 48 hours", price: "$100 / month" },
 *
 * Animations and Supabase setup (both $250, added 2026-09-01) are page copy
 * only, not seeded in the checkout catalogue (`server/services/products.ts`).
 * Neither is a toggle at checkout: the animations row exists to warn a buyer
 * that scope drives the final charge and to route the ask through the intake
 * form, and Supabase setup is scoped case by case once a build actually needs
 * a database. Wire both into the real catalogue if either becomes a flat,
 * always-available toggle.
 *
 * SEO blog ($750) and per-post writing ($500/post, added 2026-09-01) are also
 * page copy only, same reasoning: neither is seeded in the checkout catalogue,
 * and the per-post one especially isn't a flat toggle — it's ongoing work
 * scoped per request, not a one-time build step.
 */
export const addOns: PricedRow[] = [
  {
    label: "Extra page beyond the standard five · project pages don't count",
    price: "$150 / page",
  },
  {
    // Kept to two lines deliberately. At three it became the tallest row in the
    // section, which put the most visual weight on the one add-on this page
    // actively talks you out of. Emphasis should not track the thing I'm
    // recommending against.
    label:
      "Admin panel · a login for changing copy and images without code. Most people do fine with the guide.",
    price: "$500",
  },
  {
    label: "Logo or wordmark refresh · for when you want the mark anyway",
    price: "$250",
  },
  {
    label: "Booking setup · a booking page wired to your calendar",
    price: "$250",
  },
  {
    label:
      "Animations · standard motion built with Framer Motion or similar. Bigger asks can run more, and you'll describe what you're after in the intake form.",
    price: "$250",
    link: { label: "Framer Motion", href: "https://motion.dev" },
  },
  {
    label:
      "Supabase setup · for a database when the site needs one: logins, saved form entries, anything that has to persist beyond the pages themselves.",
    price: "$250",
  },
  {
    label:
      "SEO blog · a blog section built into your site, with its own admin so you can publish and manage posts without touching code.",
    price: "$750",
  },
  {
    label:
      "A blog post, written for you · you brain-dump what you know, I turn it into a polished post tuned for the keywords you're chasing.",
    price: "$500 / post",
  },
];

/* ── Changes ──────────────────────────────────────────────────────────── */

/**
 * The tiers and the three rules are shared with the platform track verbatim and
 * are imported by the page rather than restated here. Only the closing line
 * differs, because it names this track's price and this track's anchor.
 */
export const changesClosing =
  "None of this is me being difficult. It's how the price stays where it is. I can charge $2,000 instead of $5,000 because I know exactly how much work I'm signing up for.";

/* ── Worth saying up front ────────────────────────────────────────────── */

export const upFront: LabelRow[] = [
  {
    label: "What I don't build",
    body: [
      "No web apps, no online stores, no membership systems. This product is a site, and it isn't priced to do those jobs. I build all of that too, just separately, and you can have a look at ",
      { text: "my engineering work", href: "/" },
      " if that's what you're after. Logins are the one exception. The admin panel add-on gives you one, and it only does a single job: letting you edit copy and images without touching code.",
    ],
  },
  {
    label: "Video lives elsewhere",
    body: "Your video is embedded from Vimeo or YouTube rather than hosted on the site itself. That's deliberate. It's why the hosting costs nothing, and it's why your reel plays properly on a phone with two bars.",
  },
  {
    label: "I don't make the work",
    body: "I don't cut reels, retouch photos, or shoot anything. The site presents what you've already made. If your reel needs a re-cut, that's a conversation with an editor, and it's a much better conversation to have before the build than after it.",
  },
  {
    label: "You confirm you're allowed to show it",
    body: "Studio and client work sometimes comes with strings. The questionnaire asks about every piece, and I'd rather ask you than get you in trouble.",
  },
  {
    label: "No promise about who finds you",
    body: "I can't promise this site brings you strangers. Nobody honest can. It's built properly for search and it will load fast and read well, but the people it's really for are the ones already looking you up: the producer who got your name from someone, the person who watched something and wanted to know who made it.",
  },
  {
    label: "Timelines pause",
    body: "When I'm waiting on you, the clock stops. If I need files or answers and don't hear back, that isn't time against the estimate. Life happens, just tell me. If a project goes quiet for 60 days I'll close it out and keep what's been paid for the work done to that point.",
  },
  {
    label: "I reply within two business days",
    body: "Always. Usually much faster.",
  },
  {
    label: "Portfolio",
    body: "I'd like to show your site in my portfolio when it's done. If you'd rather I didn't, just say so and I won't.",
  },
];

/* ── FAQ ──────────────────────────────────────────────────────────────── */

/**
 * Two of these carry the whole page.
 *
 * A buyer on this track arrives holding one of exactly two price anchors: the
 * $20/month template platform, or the $5,000 agency quote. The questions are
 * worded to name the anchor out loud, because a buyer holding one of them will
 * not read an answer addressed to the other.
 */
export const faq: Array<{ q: string; a: string }> = [
  {
    q: "Who owns the site?",
    a: "You do, in every sense that matters. The domain is registered in your name, the hosting account is yours, and the code is in a repository you control. I don't hold any of it and there's nothing you'd have to ask me to release.",
  },
  {
    q: "Can I change it myself afterwards?",
    a: "Yes, and the guide I write is mostly about how. You describe the change you want in plain words to Claude Code, and it makes it. Swapping a photo, adding a project, rewriting your bio, and adding a page are all inside what someone non-technical can do after reading it. If you'd rather click buttons than describe changes, the admin panel add-on gives you a private login that does the same job, though most people find they don't need it. Paid rounds are for when you want me doing structural work instead.",
  },
  {
    q: "Why is this $2,000 when Squarespace is $20 a month?",
    a: "Because they're different purchases. A template platform rents you a design that several thousand other people are also using, and the rent doesn't stop. Here you pay once. The design comes out of your own answers about what you like, the code sits in a repository with your name on it, and the hosting is free because a site like this is small and static. If the $20 a month is genuinely the better deal for where you're at, I'll say so rather than sell you into this one anyway. It sometimes is.",
  },
  {
    q: "Why is this $2,000 when an agency quoted me $5,000?",
    a: "Because I've taken out the two things that cost the most and produce the least. There are no discovery meetings. The questionnaire does that work, and it does it better, because you answer it with time to think instead of on the spot in a room. And nobody stays in the middle of your hosting afterwards on a retainer you pay to get a phone number changed. What's left is a fixed scope I can price honestly.",
  },
  {
    q: "If an AI can build it, why do I need you?",
    a: "You don't, strictly. The tools are available to you, and the guide I write teaches you to use them on your own site. What you'd be doing without me is the part that isn't typing: working out who the site is for, what it should lead with, which forty projects become eight, and how to describe your own work without it reading like a program note. That's the job. The building is the fast part, and it's fast because the thinking happened first.",
  },
  {
    q: "What happens if we stop working together?",
    a: "Nothing happens to your site. It's on your domain, in your hosting account, and the code is in your repository. You carry on, with or without someone else. Setting it up that way is the point rather than a courtesy.",
  },
  {
    q: "How long does it take?",
    a: "You see the first look within three days of your final answers. The total depends on how many rounds of changes you want after that, and the clock pauses whenever I'm waiting on you. Most of the time the answer is a couple of weeks end to end.",
  },
  {
    q: "What if I don't like it?",
    a: "You tell me and we fix it. That's what the revision round is for, and the taste step earlier in the questionnaire exists specifically so the first version lands close. If you come out of the gallery favouriting sites that look nothing like what I send you, something has gone wrong and I want to hear about it.",
  },
  {
    q: "What about my current site?",
    a: "We keep what's worth keeping and redirect the rest. If your site has been up for years, links to it are sitting in old emails, festival listings, and articles. Those get pointed at the right pages on the new site so they don't break. The questionnaire asks which parts of the old site have to survive and which should die with it.",
  },
];

/* ── Close ────────────────────────────────────────────────────────────── */

export const closing = {
  line: "Ready? Start the questionnaire. Give it about forty-five minutes, and you can stop and come back whenever you like.",
  entity: "Agora Network Technologies Inc.",
} as const;
