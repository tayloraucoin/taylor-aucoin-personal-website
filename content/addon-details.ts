/**
 * The "how it works" content behind each P0 add-on — what a client reads
 * before deciding to tick the box. Typed TS, no CMS, same pattern as every
 * other content file.
 *
 * Keyed by `products.key`. An add-on without an entry here simply renders no
 * info button, so shipping a new catalogue row never breaks the pay screen.
 *
 * Register: the /websites voice. First person, plain, sentence case, no
 * jargon. These read on a phone, in a dialog, by someone deciding whether to
 * spend $250 — each one answers "what exactly happens, what do you need from
 * me, and where does it end" in under a minute of reading.
 */

export type AddonDetailSection = {
  label: string;
  body: string;
};

export type AddonDetail = {
  /** Dialog heading. The product name stays the row's job; this frames the process. */
  heading: string;
  intro: string;
  sections: AddonDetailSection[];
  /** The honest boundary line: where the add-on ends. Renders last, dim. */
  boundary?: string;
};

export const addonDetails: Record<string, AddonDetail> = {
  logo_refresh: {
    heading: "How the logo refresh works",
    intro:
      "A refreshed logo in two rounds, built from what your business already looks like — not a from-scratch rebrand.",
    sections: [
      {
        label: "What I start from",
        body: "The questionnaire asks a few logo questions, and you send me whatever exists today: your current logo, old versions, truck wraps, business cards. Even a rough favourite from another trade helps.",
      },
      {
        label: "Round one — the board",
        body: "I put together a board of options, usually somewhere between two and six directions. You pick the one you want and tell me anything that bugs you about it. Plain words are fine: 'too thin', 'wrong green', 'looks like a tech company'.",
      },
      {
        label: "Round two — the final",
        body: "I take your pick and your notes and come back with the finished version. You get the files you actually need: for the site, for print, and for whoever makes your next truck wrap.",
      },
    ],
    boundary:
      "Two rounds lands it for almost everyone. If you want to keep exploring after that, further rounds are a fresh logo refresh at the same price.",
  },

  gbp_clean: {
    heading: "What the deep clean covers",
    intro:
      "Your Google Business Profile is the first thing most customers ever see of you. The deep clean brings the whole listing up to professional standard.",
    sections: [
      {
        label: "The listing itself",
        body: "Your business name, address, phone, and hours checked and corrected everywhere they appear, holiday hours included, and your categories set properly — the primary category is one of the biggest levers on where you show up.",
      },
      {
        label: "What customers read",
        body: "A written business description that actually sells you, your services listed out individually so they can match searches, and answers seeded into the Q&A section for the questions people always ask.",
      },
      {
        label: "What customers see",
        body: "Your photos organized and the right ones added: logo, cover, your crew, your trucks, finished jobs. Listings with real photos get dramatically more calls than listings with none.",
      },
      {
        label: "Reviews",
        body: "Reply templates written in your voice for the reviews you already have and the ones coming, so responding takes you thirty seconds instead of a staring contest.",
      },
    ],
    boundary:
      "One-time clean-up, linked to your new site when it goes live. Keeping it fed month to month — posts, review replies, fresh photos — is what the care plan is for.",
  },

  stripe_setup: {
    heading: "How the payments setup works",
    intro:
      "By the end of this, you can take card payments and send proper invoices from your own Stripe account — the same payment company running this page.",
    sections: [
      {
        label: "What I build",
        body: "I set up your account's products and prices, your checkout, and how it connects to your site and booking, and I test the whole flow end to end before anything goes live.",
      },
      {
        label: "The one part that has to be you",
        body: "Stripe needs your business details and your banking information to pay you out, and that part you enter yourself, logged into your own account. I never see or handle your banking details — same rule as everywhere else in this process: no passwords, no bank logins, ever.",
      },
      {
        label: "What you walk away with",
        body: "A working payments account in your name, plus a plain-English guide in your command centre covering the things you'll actually do: sending an invoice, checking what's been paid, and issuing the occasional refund.",
      },
    ],
    boundary:
      "Stripe charges its standard card fees per transaction — that's their cut, not mine, and I don't take a percentage of anything.",
  },

  booking_setup: {
    heading: "How the booking setup works",
    intro:
      "Online booking on your own site, so the customer standing in their driveway at 9pm can book you without calling.",
    sections: [
      {
        label: "One shared schedule",
        body: "This is one calendar for the whole business — not a separate calendar per person. Customers pick a service, a date, and a time. They can't pick a specific crew member, and nothing auto-assigns jobs. That's the right fit for a solo operator, and workable for a small crew who split jobs themselves after the booking comes in.",
      },
      {
        label: "What I build",
        body: "Your services, durations, and hours set up in the booking system, synced to Google Calendar so double-bookings can't happen, and embedded right on your site.",
      },
      {
        label: "What I need from you",
        body: "The questionnaire covers it: which services people can book online, what calendar you live out of, and how far ahead you take work. Google Calendar syncs automatically — if you use Apple, Outlook, or nothing at all, tell me anyway and I'll set your hours by hand instead. If you'd rather quote some jobs before committing to a time, those stay off the booking list.",
      },
      {
        label: "What your customer sees",
        body: "They pick a service, see your real availability, and book. You get it on your calendar and they get a confirmation — no phone tag.",
      },
    ],
    boundary:
      "This is one calendar for one business — right for a solo operator, workable for a small crew sharing a pool of jobs. For anything more complex — a bigger team, customers picking a specific person, jobs that need to auto-assign — email me what you're looking for and I'll quote it properly.",
  },
};
