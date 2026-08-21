import { TERMS_EFFECTIVE, TERMS_VERSION } from "@/lib/legal/version";

/**
 * The legal documents for the websites service. Typed TS, no CMS — same
 * pattern as every other content file.
 *
 * These are binding documents, not marketing. Every commercial number here
 * must agree with `content/websites.ts` and the published How We Work PDF:
 * $1,200 + GST, $600 deposit, $500/$250/free change tiers, the 14-day fix
 * window, the 60-day quiet close-out, 5–7 business days. If one of those
 * changes anywhere, it changes everywhere, and TERMS_VERSION gets bumped.
 *
 * DRAFTED BY CLAUDE (Chancery role), 2026-08-21. Reviewed by no lawyer yet.
 * A BC lawyer should read both documents before the first real charge — the
 * sections a lawyer will care most about are flagged in the session notes,
 * not here, because hedging inside a contract weakens it.
 */

export type LegalBlock = { p: string } | { list: string[] };

export type LegalDocSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  eyebrow: string;
  title: string;
  effective: string;
  version: string;
  intro: string;
  sections: LegalDocSection[];
};

/* ── Terms ────────────────────────────────────────────────────────────── */

export const terms: LegalDoc = {
  eyebrow: "Agora · Website builds",
  title: "Website services terms",
  effective: TERMS_EFFECTIVE,
  version: TERMS_VERSION,
  intro:
    "These are the terms for my website-build service. They're written to be read: about ten minutes, in plain language, and the first sentence of every section is the short version of it.",
  sections: [
    {
      title: "Who this agreement is between",
      blocks: [
        {
          p: "This agreement is between Agora Network Technologies Inc., a British Columbia company, and your business. Agora is the company I, Taylor Aucoin, work through: the site you're on, the person on the phone, and the emails you get are all me, and payments show as TAYLORAUCOIN.COM on your statement.",
        },
        {
          p: "These terms are written for businesses. By agreeing, you confirm you're acting for a business rather than as a consumer.",
        },
      ],
    },
    {
      title: "How you agree to these terms",
      blocks: [
        {
          p: "You agree to these terms by paying the deposit. The payment screen says so and links here, and the version you agreed to is recorded with your payment.",
        },
        {
          p: "Everything after the deposit runs under the same terms. Each later invoice, whether it's the balance, a round of changes, or an add-on, names its own scope and price; paying it is agreeing to that scope at that price under these terms.",
        },
        {
          p: "The version in force when you pay your deposit governs your whole engagement. If I update these terms later, the update applies to new engagements, not to yours.",
        },
      ],
    },
    {
      title: "What you're buying",
      blocks: [
        {
          p: "One finished five-page website, built from your questionnaire answers and launched on your own domain. The full deliverables list is on the websites page as it stood the day you paid your deposit. It includes the site itself, a brand guide, basic local-search setup, your Google Business Profile linked to the site, your AI employee briefs, your command centre document, and training.",
        },
        {
          p: "Your answers define the content. The site is built from what you tell me in the questionnaire and the follow-up round, so the more complete your answers, the better the site.",
        },
        {
          p: "Any preview I showed you before you paid is a sales demonstration. The deliverable is the site built from your answers.",
        },
      ],
    },
    {
      title: "Price and payment",
      blocks: [
        {
          p: "The build is $1,200 CAD plus GST: a $600 deposit to start, and the balance before the site goes live. GST is added at checkout and on invoices.",
        },
        {
          p: "Payments go through Stripe. Card numbers never touch my systems.",
        },
        {
          p: "Extras are flat-priced and invoiced before the work: extra pages, booking setup, payments setup, a logo refresh, and the rest of the add-on list on the websites page. If you add one mid-build, it rides the balance invoice.",
        },
        {
          p: "One rule covers all of it: nothing is delivered before the payment that covers it has cleared. The deposit starts the build, the balance launches the site, and a paid invoice starts a round of changes.",
        },
      ],
    },
    {
      title: "The deposit, and refunds",
      blocks: [
        {
          p: "If you change your mind before I've started building, your deposit comes back in full. Just ask.",
        },
        {
          p: "Once the build starts, the deposit is earned and isn't refunded. The build starts when I begin producing your site from your final answers, and I'll tell you when that happens.",
        },
        {
          p: "The balance is only ever asked for after you've seen your finished site as a live preview.",
        },
      ],
    },
    {
      title: "Changes and further work",
      blocks: [
        {
          p: "Changes come in prepaid batches called rounds. One round is one consolidated list of changes, submitted together. Requests that trickle in one message at a time are collected into the next round; they don't each start one.",
        },
        {
          list: [
            "Standard round, $500: structural work. New or rebuilt sections, layout changes, newly written copy, up to about ten items, or one new page.",
            "Small round, $250: up to three small swaps inside the existing structure. Text edits, photo swaps, updated hours or contact details. No new sections, pages, or copywriting.",
            "My mistakes, free: anything I got wrong, like a typo I introduced, a broken link, or a wrong phone number, fixed free within 14 days of any delivery.",
          ],
        },
        {
          p: "I classify each round and quote it before you pay, and the invoice is paid before work starts. No new round is scoped while an earlier invoice is unpaid. If a small list grows past the line mid-round, I pause and quote the difference rather than absorbing it quietly.",
        },
        {
          p: "More than one new page in a round, or anything the platform can't do, such as online ordering, customer logins, or e-commerce, isn't a round. It's a separate conversation and a separate quote.",
        },
      ],
    },
    {
      title: "Timelines",
      blocks: [
        {
          p: "The build takes five to seven business days from your final answers. The clock starts when I have everything I need.",
        },
        {
          p: "The clock pauses while I'm waiting on you, whether that's answers, photos, or a payment. That time doesn't count against the estimate.",
        },
        {
          p: "If a project goes quiet for 60 days, I may close it out and keep what's been paid for the work done to that point. If you come back later, we start with a fresh quote.",
        },
      ],
    },
    {
      title: "Your content and your claims",
      blocks: [
        {
          p: "You confirm that everything you give me for the site is yours to use: photos, logos, text, and anything your customers appear in.",
        },
        {
          p: "You confirm your Google reviews are from genuine customers, and that the factual claims you give me about your business, such as licensing, insurance, and certifications, are true. The site says what you told me; the accuracy of claims about your own business is yours.",
        },
        {
          p: "Before launch, you review the finished site. Checking every factual claim back against your answers is part of my build, and the final read is yours.",
        },
      ],
    },
    {
      title: "The platform",
      blocks: [
        {
          p: "Your site is built on a third-party managed website platform. The subscription is yours, on your own account and your own card, at the platform's going rate, which is about $36 a month as of these terms and is theirs to change.",
        },
        {
          p: "That structure is deliberate: your domain, your hosting, your customer list, and your dashboard all belong to you. If we stop working together, you keep everything and the site keeps running.",
        },
        {
          p: "It also means there's no source code to hand over, because none exists; the platform is a managed service. Its uptime, features, and pricing are the platform's responsibility rather than mine, and the same goes for third-party tools like booking or payment systems. I set those up; I don't operate them.",
        },
      ],
    },
    {
      title: "Ownership",
      blocks: [
        {
          p: "Once the build is paid in full, the finished site and its content are yours: the words, the structure as built, the brand guide, and the documents that come with it.",
        },
        {
          p: "My working materials stay mine: the tools, templates, prompts, and methods I use to produce the work.",
        },
        {
          p: "I may show your finished site in my portfolio and marketing. If you'd rather I didn't, tell me in writing and I'll stop.",
        },
      ],
    },
    {
      title: "AI in the work",
      blocks: [
        {
          p: "I use AI tools to produce parts of the deliverables: drafting copy from your answers, generating images where you've chosen that route, and building your AI employee briefs. Everything factual is checked against what you told me, and you review the site before it goes live.",
        },
      ],
    },
    {
      title: "Privacy and confidentiality",
      blocks: [
        {
          p: "What you tell me in the questionnaire is confidential. It's used to build your site and its documents, and for nothing else.",
        },
        {
          p: "How personal information is collected, stored, and deleted is covered in the privacy policy, which sits beside these terms and is part of this agreement.",
        },
      ],
    },
    {
      title: "What I don't promise",
      blocks: [
        {
          p: "Nobody honest can promise you a Google ranking, and I don't. What I promise is a site built properly for local search: fast, mobile-ready, with your location and services where search engines look for them.",
        },
        {
          p: "I don't promise traffic, leads, or revenue. A website is a front door; the business behind it is yours.",
        },
      ],
    },
    {
      title: "If something goes wrong",
      blocks: [
        {
          p: "If I fail to deliver, my total liability to you under this agreement is capped at the amount you've actually paid me for this engagement.",
        },
        {
          p: "Neither of us is liable to the other for indirect losses, such as lost profits or lost opportunities. Nothing in these terms excludes liability that the law doesn't allow to be excluded.",
        },
      ],
    },
    {
      title: "Working relationship",
      blocks: [
        {
          p: "Agora is an independent contractor. Nothing in this agreement makes either of us the other's employer, partner, or agent.",
        },
      ],
    },
    {
      title: "Ending the engagement",
      blocks: [
        {
          p: "You can stop at any time. Work already paid for and done stays paid; the deposit follows the rules in section 5, and a prepaid round that hasn't started comes back in full.",
        },
        {
          p: "I can decline or end an engagement too. If I end one without delivering what a payment covered, that payment comes back.",
        },
      ],
    },
    {
      title: "Ongoing services",
      blocks: [
        {
          p: "A monthly care plan may be offered separately. When it is, it will have its own written terms. Nothing in this agreement signs you up for anything recurring.",
        },
      ],
    },
    {
      title: "Disputes",
      blocks: [
        {
          p: "British Columbia law governs this agreement.",
        },
        {
          p: "If something's wrong, tell me first and we'll sort it out in good faith. If we genuinely can't, disputes go to the BC Civil Resolution Tribunal or the courts of British Columbia, whichever the amount calls for.",
        },
      ],
    },
    {
      title: "Contact",
      blocks: [
        {
          p: "Agora Network Technologies Inc. · hello@tayloraucoin.com",
        },
      ],
    },
  ],
};

/* ── Privacy ──────────────────────────────────────────────────────────── */

export const privacy: LegalDoc = {
  eyebrow: "Agora · Website builds",
  title: "Privacy policy",
  effective: TERMS_EFFECTIVE,
  version: TERMS_VERSION,
  intro:
    "This policy covers the website-build service, including the intake questionnaire. It says what I collect, what it's for, who else touches it, and how to get it corrected or deleted.",
  sections: [
    {
      title: "Who's handling your information",
      blocks: [
        {
          p: "Agora Network Technologies Inc., a British Columbia company. I'm Taylor Aucoin, its principal, and I'm the only person who works with your information. For questions, corrections, or deletion: hello@tayloraucoin.com.",
        },
      ],
    },
    {
      title: "What I collect",
      blocks: [
        {
          list: [
            "What we agreed on the phone: your name, business name, phone, email, and a short summary of the project.",
            "Your questionnaire answers: services, prices, service area, how you work, and your team's names and roles if you share them.",
            "What you upload: photos, your logo, a voice note if you leave one, and screenshots, including your reviews.",
            "Payment records from Stripe: what was paid and when. Card numbers never touch my systems; Stripe holds those.",
            "One functional cookie, which reopens your intake link on the device you started on.",
          ],
        },
        {
          p: "The intake form has no analytics and no ad tracking, and there is no password field anywhere in it. I will never ask you for a password.",
        },
      ],
    },
    {
      title: "What it's used for",
      blocks: [
        {
          list: [
            "Building your site and its documents: the brand guide, the command centre, and your AI employee briefs.",
            "Running the engagement: taking payment, sending at most three reminder emails, which stop the moment you finish the form, and the follow-up call.",
            "Keeping proper business records: invoices and receipts.",
          ],
        },
        {
          p: "The voice note exists to capture how you talk, so your site sounds like you instead of like a template. It's used for that, and it's deleted with everything else.",
        },
        {
          p: "Nothing is sold, rented, or used for advertising. Ever.",
        },
      ],
    },
    {
      title: "AI tools",
      blocks: [
        {
          p: "I use paid, business-grade AI services to produce your deliverables. Your answers and files go to those services only as needed to build your site, under commercial terms that don't use your content to train public models.",
        },
      ],
    },
    {
      title: "Who else touches it",
      blocks: [
        {
          list: [
            "Stripe, for payments.",
            "Supabase, for the database and file storage.",
            "Vercel, for hosting this site.",
            "Resend, for sending email.",
            "AI providers, for producing the deliverables described above.",
          ],
        },
        {
          p: "Some of these companies store data outside Canada, mostly in the United States, where it can be subject to local law. By using the service, you consent to that processing.",
        },
      ],
    },
    {
      title: "Your customers",
      blocks: [
        {
          p: "Review screenshots and job photos can include your customers' names or likenesses. I use them for exactly one thing: putting your real reviews and real work on your own site. The terms ask you to confirm you have the right to share them.",
        },
      ],
    },
    {
      title: "How long I keep it",
      blocks: [
        {
          p: "Through the engagement and for 24 months after it ends, in case you come back for changes. Then it's deleted.",
        },
        {
          p: "You can ask for deletion earlier at any time, and I'll do it. The exception is what tax law requires me to keep: invoice and payment records stay for the period the Canada Revenue Agency requires.",
        },
      ],
    },
    {
      title: "Your rights",
      blocks: [
        {
          p: "Ask what I hold about you, have it corrected, or have it deleted: hello@tayloraucoin.com. You'll get an answer in days, not weeks.",
        },
        {
          p: "If you think your information has been handled badly and I haven't fixed it, you can complain to the Office of the Privacy Commissioner of Canada.",
        },
      ],
    },
    {
      title: "Security",
      blocks: [
        {
          p: "Data moves encrypted, storage is access-controlled, intake links expire, and the form collects no credentials. No system is perfect, but this one is small, holds as little as possible, and is built to stay that way.",
        },
      ],
    },
    {
      title: "Changes to this policy",
      blocks: [
        {
          p: "If this policy changes, the date at the top changes with it, and clients with an active engagement hear about material changes directly.",
        },
      ],
    },
  ],
};
