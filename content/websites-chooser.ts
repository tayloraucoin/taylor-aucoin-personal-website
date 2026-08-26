import { websiteRoutes } from "@/lib/routes";

/**
 * `/websites` — the chooser. Two doors, one glance, no scroll.
 *
 * The naming law here is Taylor's and it overruled an earlier plan to name the
 * doors by buyer. His reasoning: some professions could plausibly buy either
 * build, so "who it's for" cannot carry the distinction. What always can is
 * what you get handed at the end. So each door leads with the deliverable and
 * says who it most applies to underneath.
 *
 * The least-resilient reader on this page is a trades buyer on a phone in a
 * driveway, seconds after a call in which Taylor said "go to
 * tayloraucoin.com/websites". That person now pays one extra click, and every
 * choice below is spent making that click cost nothing. The platform door is
 * first because that buyer is the one under time pressure; the coded-track
 * buyer arrived from a link someone sent them and can read past one card.
 *
 * No gradient anywhere on this page. The doors are flat. A chooser that
 * out-dresses the pages behind it is a chooser that has become the destination.
 */

export const chooser = {
  eyebrow: "Agora Network Technologies",
  title: "Two ways I build websites",
  sub: "Both end with a real site you own, on your own web address. What changes is what you get handed at the end.",
} as const;

export type DoorKey = "platform" | "coded";

export type Door = {
  /** Stable identity, so the picker below can name a door without a second
   *  copy of its title drifting out of sync with this one. */
  key: DoorKey;
  href: string;
  /** The deliverable, named plainly. This is the line people choose on. */
  name: string;
  price: string;
  priceNote: string;
  /** What the thing actually is. Two or three lines, no more. */
  body: string;
  /** Who it fits. Stated as applicability, never as a gate. */
  audience: string;
  cta: string;
};

export const doors: Door[] = [
  {
    key: "platform",
    href: websiteRoutes.platform,
    name: "A site on a managed platform",
    price: "$1,200",
    priceNote: "CAD + GST · live in 3 to 7 days",
    body: "Built on a platform and handed over with a login, so you can update hours, add photos, and see who has contacted you without needing me. There is a monthly platform cost you pay directly.",
    audience:
      "Most applicable for local service businesses. Detailers, landscapers, cleaners, trades.",
    cta: "See this build",
  },
  {
    key: "coded",
    href: websiteRoutes.coded,
    name: "A site built in code",
    price: "$2,000",
    priceNote: "CAD + GST · first look in 3 days",
    body: "Written in Next.js and handed over as a repository in your name, on hosting that costs nothing to run. Changing it later means describing the change in plain words, and you get a guide for doing that.",
    audience:
      "Most applicable when the work itself is what sells you. Filmmakers, photographers, designers, artists.",
    cta: "See this build",
  },
];

/* ── The picker ───────────────────────────────────────────────────────── */

/**
 * The overlap valve, and the reason it is a list of jobs rather than a clever
 * input: someone who did not recognise themselves in either card above is not
 * in the mood to compose a sentence about what they do. They want to find their
 * own job in a list and be told the answer.
 *
 * It sits AFTER the doors and starts collapsed, so it costs the fold nothing.
 * Anybody who already knows which build they want never sees it open.
 *
 * `either` is not a hedge and it is not a fourth option. Taylor's actual point
 * was that some professions genuinely fit both tracks and that the deliverable
 * is what separates them, so the honest verdict for those jobs says so out loud
 * and hands over the question that settles it. Sorting a photographer into a
 * bucket with false confidence would be worse than useless.
 */
export type Verdict = DoorKey | "either";

export type Profession = { label: string; verdict: Verdict };

/**
 * ALPHABETICAL ON PURPOSE. Grouping these by verdict would let the grid leak
 * its own answer, and a reader who can see the mapping is no longer answering
 * honestly about themselves. "Something else" is pinned last because it is a
 * catch-all rather than a job.
 *
 * Taylor owns the final cut of this list. It is drawn from the two markets he
 * actually sells to and is meant to be recognised rather than to be complete.
 */
export const professions: Profession[] = [
  { label: "Architecture or interior design", verdict: "either" },
  { label: "Auto detailing", verdict: "platform" },
  { label: "Cleaning", verdict: "platform" },
  { label: "Consulting", verdict: "either" },
  { label: "Design or illustration", verdict: "coded" },
  { label: "Film or video", verdict: "coded" },
  { label: "Fine art", verdict: "coded" },
  { label: "Landscaping or lawn care", verdict: "platform" },
  { label: "Moving or hauling", verdict: "platform" },
  { label: "Music or performance", verdict: "coded" },
  { label: "Personal training or coaching", verdict: "either" },
  { label: "Photography", verdict: "coded" },
  { label: "Plumbing, electrical, or HVAC", verdict: "platform" },
  { label: "Renovation or contracting", verdict: "platform" },
  { label: "Salon, barber, or spa", verdict: "platform" },
  { label: "Writing", verdict: "coded" },
  { label: "Something else", verdict: "either" },
];

/**
 * `show` drives which door or doors the result offers. Headlines are NOT stored
 * here: for a single-door verdict the headline is that door's own `name`, read
 * straight off `doors` above, so the answer and the card it points at can never
 * disagree.
 */
export const verdicts: Record<
  Verdict,
  { body: string; show: readonly DoorKey[] }
> = {
  platform: {
    body: "Someone got your name and wants to know whether you're real and whether you'll pick up. That build gets you there in about a week, and afterwards you run it yourself with no code and nothing owed to me.",
    show: ["platform"],
  },
  coded: {
    body: "Your work is what sells you, so the site has to be worth looking at. That one gets shaped around the work itself, and the code and the accounts are yours when it's done.",
    show: ["coded"],
  },
  either: {
    body: "This one goes both ways and I won't pretend otherwise. The question that settles it: does someone hire you because of how your work looks, or because you turned up and did the job properly? If it's how it looks, take the coded build.",
    show: ["platform", "coded"],
  },
};

export const picker = {
  trigger: "Not sure which one you need?",
  triggerSub: "Tell me what you do and I'll point you at one.",
  prompt: "What do you do?",
  eitherHeadline: "Either one, honestly",
} as const;

/** Sits under the picker. The human fallback, and it stays a phone call. */
export const chooserFallback =
  "Still stuck? Call me and I'll tell you which one I'd build for you and why.";
