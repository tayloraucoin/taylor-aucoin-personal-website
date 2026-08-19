/**
 * `/websites` page content. Typed TS, no CMS — same pattern as content/work
 * and content/services.
 *
 * Every commercial sentence here — price, process, terms, timelines — is
 * adapted from Taylor's client-facing "How We Work Together" document. Nothing
 * about the relationship was invented. Re-cut for the page, not rewritten; the
 * read-aloud pass is still his (docs/websites/WEBSITES-PAGE-SPEC.md §8).
 *
 * The register is his: first person, plain, blunt where bluntness is honest.
 * No exclamation marks, no marketing verbs, sentence case.
 */

/* ── Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: "Metro Vancouver · Agora Network Technologies",
  title: "Websites for local businesses",
  sub: "You've got a real business with real customers who already say good things about you. What you don't have is a front door online that matches that. I build that front door.",
} as const;

/**
 * The three questions a buyer has before they scroll, answered in one glance.
 * Rendered in the Signal grid idiom — three-up instead of four.
 */
export const heroStats: Array<{ value: string; label: string }> = [
  { value: "$1,200", label: "CAD + GST" },
  { value: "5–7 days", label: "Typical build" },
  { value: "$0", label: "Ongoing cost to me" },
];

/* ── What you get ─────────────────────────────────────────────────────── */

export type LabelledRow = { label: string; body: string };

export const deliverables: LabelledRow[] = [
  {
    label: "The site",
    body: "Five pages, written from your answers — your services, your area, your prices, and what makes people choose you over the guy down the road. Not template copy with your name dropped into it.",
  },
  {
    label: "Built for phones",
    body: "Click-to-call buttons, a contact form that sends enquiries straight to you, and a layout that works thumb-first. Most of the people who find you are standing in a driveway holding a phone.",
  },
  {
    label: "Your real proof",
    body: "Your Google reviews, your service area, your actual prices. The things a stranger is checking before they let you near a $40,000 truck.",
  },
  {
    label: "Photos, handled straight",
    body: "Your own are best — your crew, your trucks, your finished jobs — and four of yours beat forty of somebody else's. Where you don't have them, we pick the approach in the questionnaire: AI-generated, stock, or a mix. I'll send you options rather than guess.",
  },
  {
    label: "A brand guide",
    body: "Your colours pulled out of your logo and built into a full system, a type pairing, and a short guide to your voice — written up as a document you keep. It's what stops your next flyer, truck wrap, and invoice looking like three different companies.",
  },
  {
    label: "AI employees",
    body: "A set of ready-made AI roles built around your business — copywriter, website designer, email marketer, finance consultant. More on these below.",
  },
  {
    label: "Training, not a handover",
    body: "Videos on running the site yourself, a session with the platform's own onboarding team that I set up for you, and a walkthrough of how to use the AI roles on real day-to-day work.",
  },
  {
    label: "Found locally",
    body: "Your Google Business Profile set up and linked, with your location and services where Google looks for them.",
  },
  {
    label: "The keys",
    body: "Your domain, your hosting account, your customer list. Plus a dashboard where you update your hours, add photos, see who's contacted you, and send invoices. No code.",
  },
  {
    label: "A guide",
    body: "A written walkthrough of the dashboard, sent at handoff — so the answer to “how do I change my hours” isn't “call Taylor.”",
  },
];

/* ── How it goes ──────────────────────────────────────────────────────── */

export type ProcessStep = {
  /** Client-facing title. Audience A reads this. */
  title: string;
  /** Mono system label. Audience B reads the taxonomy down the page. */
  system: string;
  body: string;
  /** Only step 03 has these — the one place extra depth is spent. */
  detail?: string[];
};

export const processSteps: ProcessStep[] = [
  {
    title: "You fill out the questionnaire",
    system: "Structured intake",
    body: "About thirty minutes. It asks about your services, your service area, your prices or ranges, how you like to work, and what makes people choose you — plus a section on how you actually talk about the job. That last part is what stops the finished site sounding like every other site in your trade. Be thorough: everything you write becomes the website, and the more you give me the less back-and-forth there is later.",
  },
  {
    title: "I ask follow-ups",
    system: "Gap close",
    body: "One round, sometimes two. I read your answers and come back to sharpen things up or fill gaps. You answer. Then I stop asking and start building.",
  },
  {
    title: "I build your site",
    system: "Brand extraction → primer → build → verification",
    body: "Five to seven business days from your final answers. The build is the same four moves every time, which is the reason it takes a week and not a month.",
    detail: [
      "Brand extraction — the colours in your existing logo become a full colour system, not a guess",
      "Written primer — your answers become a build document before a single page exists",
      "Verification — every factual claim on the finished site gets checked back against what you told me",
    ],
  },
  {
    title: "You review it live",
    system: "Live preview",
    body: "I send you a link. It's a real, working website — not a picture and not a mock-up. Click it, load it on your phone, show your spouse, show your crew.",
  },
  {
    title: "You pay the balance and it goes live",
    system: "DNS cutover",
    body: "Once you're happy, you settle the balance. Same day — usually within a couple of hours — your site goes live on your own web address, in an account that belongs to you. Your existing email keeps working; that's part of the job.",
  },
  {
    title: "You're in charge from there",
    system: "Handoff",
    body: "Update your hours, add photos, see who's contacted you, send invoices. It's a self-serve platform, so none of that needs me — and none of it needs code.",
  },
  {
    title: "I get you up to speed",
    system: "Enablement",
    body: "A handover isn't training. You get the platform's own first-run walkthrough, my documentation videos covering everything you'd actually want to change, and a session with the platform's onboarding team that I book for you. The AI employees come with the same treatment: not just the files, but videos of them being used on real work.",
  },
];

/* ── AI employees ─────────────────────────────────────────────────────── */

/**
 * The framing is Taylor's and it is the whole reason this section works for a
 * non-technical reader: the million-dollar question turns an abstract idea
 * ("AI roles") into a concrete one they have already had ("who would I hire").
 */
export const aiEmployees = {
  intro:
    "If someone handed you a million dollars tomorrow, you'd hire people. Some of those hires would be another set of hands on the tools. The rest would be sitting at a desk — writing, quoting, chasing, marketing. Those are the ones you can have now.",
  how: "Each one is a written brief. You paste it into an AI chat and it turns up already knowing your business: your services, your prices, your service area, and how you talk about the work. Not a generic assistant with your name mentioned once — one built from the same answers your website was built from.",
  roles: [
    {
      role: "Copywriter",
      body: "Writes in your voice, off your brand guide. Ads, flyers, service descriptions, or a reply to an awkward enquiry you don't want to get wrong.",
    },
    {
      role: "Website designer",
      body: "Knows your site and your colour system, so the changes you make on your own keep looking like they belong there.",
    },
    {
      role: "Email marketer",
      body: "Seasonal reminders, follow-ups to past customers, and a note to the people who asked for a quote and then went quiet.",
    },
    {
      role: "Business and finance consultant",
      body: "Pricing, quoting, what a job actually costs you once you count the drive, and where the month went.",
    },
  ],
  note: "Those are four examples, not the list — what comes with your build depends on your trade. The documentation includes videos of them being used on real day-to-day work, plus a short crash course on the more capable setups if you decide you want to go further.",
} as const;

/* ── Pricing ──────────────────────────────────────────────────────────── */

export const pricing = {
  label: "Website build",
  amount: "$1,200",
  currency: "CAD + GST",
  terms: "Half to start, half before it goes live.",
  rows: [
    { label: "Ongoing cost to me", value: "$0" },
    {
      label: "Ongoing cost to run the site",
      value: "$36/month, paid by you directly to the platform — less if you pay annually",
    },
  ],
} as const;

/**
 * The page's thesis. `emphasis` renders in --color-ink against --color-body
 * body copy — the one weight change in the section.
 */
export const ownership = {
  before:
    "That $36 isn't mine and I don't take a cut of it. It covers your hosting, your domain, your dashboard, and the tools inside it. You pay it directly, with your own card, on your own account. Which means: ",
  emphasis: "if you ever want to fire me, you keep everything.",
  after:
    " Your website, your domain, your customer list. I'm not the kind of web guy who holds your business hostage. That's on purpose.",
} as const;

export type PricedRow = { label: string; price: string };

export const addOns: PricedRow[] = [
  { label: "Online booking setup — your services, hours, calendar synced", price: "$250" },
  {
    label:
      "Stripe payments setup — your account connected, products and checkout built",
    price: "$250",
  },
  { label: "Extra page beyond the standard five", price: "$150 / page" },
  {
    label: "Google Business Profile deep clean — photos, categories, description",
    price: "$300",
  },
  { label: "Logo refresh", price: "$250" },
];

/*
 * [OPEN — Taylor] The Care Plan is priced at $250/month in the Stripe
 * catalogue and no document in this repo states what it includes. Publishing a
 * recurring charge with no stated scope is a trust leak, and inventing the
 * scope is a service claim I won't make. Write what it covers and add:
 *
 *   { label: "Care plan — <what it covers>", price: "$250 / month" },
 */

/* ── Changes ──────────────────────────────────────────────────────────── */

export const changeTiers: Array<PricedRow & { note: string }> = [
  {
    label: "Standard round of changes",
    price: "$500",
    note: "New sections, layout changes, rewritten copy, a new page",
  },
  {
    label: "Small round of changes",
    price: "$250",
    note: "A few text edits, swapping photos, updating hours",
  },
  {
    label: "My mistakes",
    price: "Free",
    note: "If I typo'd your phone number or broke a link, I fix it — 14 days from delivery",
  },
];

export const changeRules: string[] = [
  "Changes come in batches, not messages. I send you a feedback form, you write down everything you want changed and submit it once, and I do it all in one focused session. What doesn't work is thirteen texts over four days — that's how projects turn into a mess and how prices go up.",
  "Each round is paid before I start it. No exceptions, and no new round starts while an old invoice is open.",
  "I decide which tier a round falls into, and I tell you before you pay. If your “small” list is actually a big list, I'll say so and quote it properly rather than quietly doing it and resenting it. If you'd rather trim it back down to the smaller tier, that's completely fine — your call.",
];

export const changesClosing =
  "None of this is me being precious. It's how I keep the price low: I can charge $1,200 instead of $3,000 because I know exactly how much work I'm signing up for.";

/* ── Worth saying up front ────────────────────────────────────────────── */

export const upFront: LabelledRow[] = [
  {
    label: "Timelines pause",
    body: "When I'm waiting on you, the clock stops. If I need photos or answers and don't hear back, that's not time against the estimate — life happens, just tell me. If a project goes quiet for 60 days I'll close it out and keep what's been paid for the work done to that point.",
  },
  {
    label: "I reply within two business days",
    body: "Always. Usually much faster.",
  },
  {
    label: "No ranking promise",
    body: "I can't promise you'll rank #1 on Google. Nobody honest can. What I can promise is a site built properly for local search — fast, mobile-ready, with your location and services where Google looks for them — and that it'll be a hell of a lot better than what you've got now.",
  },
  {
    label: "Your content is yours",
    body: "You confirm you own the photos you send me and that your Google reviews are from genuine customers. They are — that's why I called you.",
  },
  {
    label: "Portfolio",
    body: "I'd like to show your site in my portfolio. If you'd rather I didn't, just say so and I won't.",
  },
];

/* ── FAQ ──────────────────────────────────────────────────────────────── */

export const faq: Array<{ q: string; a: string }> = [
  {
    q: "Who owns the site?",
    a: "You do. The domain is registered in your name, the hosting account is yours, and you pay the platform directly with your own card. I don't sit in the middle of any of it.",
  },
  {
    q: "Can I change things myself afterwards?",
    a: "Yes, and you should. It's a self-serve platform — hours, photos, prices, text, new enquiries, invoices all live in a dashboard you log into, with no code and no cost. You are not handcuffed to a technical person, which is the thing most people are actually worried about when they ask this. Paid rounds of changes are only for when you want me to do the structural work: new sections, a new page, a rewrite.",
  },
  {
    q: "What happens if we stop working together?",
    a: "Nothing happens to your site. It's in your account, on your domain, with your customer list in it. You keep all of it and carry on. That's the whole point of setting it up that way.",
  },
  {
    q: "How long does it take?",
    a: "Five to seven business days from your final answers. The clock starts when I've got everything I need, and it pauses whenever I'm waiting on you.",
  },
  {
    q: "Do I need to write anything?",
    a: "No. You answer the questionnaire in your own words and I write the site from it — including a section on how you actually talk about the job, so what comes out sounds like you rather than like a template. You'll read it before it goes live and tell me what's wrong.",
  },
  {
    q: "What if I don't have good photos?",
    a: "Most people don't, and it isn't a problem. Your own are best where they exist. Where they don't, you tell me in the questionnaire which way you'd rather go — AI-generated, stock, or a mix — and I'll come back with a couple of options to pick from instead of guessing and making you sit through three rounds of it.",
  },
  {
    q: "What if I already have a domain?",
    a: "We use it. If it's pointed at an old site, I'll do the cutover — including making sure your existing email keeps working, which is the part that usually gets broken.",
  },
  {
    q: "If the platform is self-serve, why do I need you?",
    a: "You don't, strictly. You could sit down with the same tools and get something out of them. What you're paying for is knowing which questions to ask, and what to do with the answers — how a real business gets turned into a brief an AI can build something authentic from, instead of the generic thing it produces when nobody has done that work. That plus a week of my time instead of a month of yours, and a set of AI employees you keep using long after the site is finished.",
  },
  {
    q: "Why is this so much cheaper than the other quotes I've had?",
    a: "Because the scope is fixed and I know exactly what I'm signing up for. One build, from a questionnaire, in a week, on a platform you run yourself afterwards. A $3,000 quote is usually paying for meetings, revisions with no ceiling, and someone staying in the middle of your hosting. I've taken all three out.",
  },
];

/* ── Close ────────────────────────────────────────────────────────────── */

export const closing = {
  line: "Ready? Start the questionnaire. About thirty minutes, and you can stop and come back whenever you like.",
  entity: "Agora Network Technologies Inc.",
} as const;
