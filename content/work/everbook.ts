import type { CaseStudy } from "./types";

export const everbook = {
  slug: "everbook",
  index: "03",
  title: "Everbook",
  meta: "Realtime voice AI · Print engine",
  tagline:
    "AI-guided interviews that turn a person's spoken life story into structured chapters, then into a print-ready hardcover delivered to their door.",
  roleLabel: "Founding Engineer",
  role: "Founding engineer, de facto tech lead",
  period: "2024 — 2025",
  stack: [
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "Prisma",
    "OpenAI Realtime API",
    "Puppeteer",
    "Stripe",
    "AWS (S3/SQS/Lambda)",
    "Lulu print API",
  ],
  constraint:
    "Everbook turns a spoken life story into a printed memoir. The two ends of that pipeline are things I didn't control: a black-box voice model on one side, a third-party printer on the other. The interviewee is typically elderly and non-technical, so latency, interruptions, and transcription errors land on the people least able to work around them — the realtime session is literally instructed to wait through pauses and never talk over someone thinking. And the output is a physical, paid product. The printer accepts only dimensionally exact PDFs; a font that loads late or an image on the wrong side of a spread becomes a defective book in someone's hands. There's no hotfix for a book that already shipped. Print is perfection or bust.",
  built: [
    "I was the first engineer, hired to build the product end to end — architecture, schema, and deployment through every feature. As the team grew I ran as de facto tech lead: I wrote the engineering conventions, API standards, and onboarding docs, and owned code review. The founder's stated plan was that the CTO title would follow once headcount justified it.",
    "The capture system runs AI-guided interviews over OpenAI's Realtime API — the browser gets an ephemeral server-minted token and connects directly. There are multiple modes: guided voice interview, uninterrupted monologue, video, and a text-chat fallback. Transcripts are preserved as prompt/response pairs, and a memory layer extracts life facts and tone to personalize later questions. There's also a gifting model: a buyer gifts the book to a relative, who then receives interview prompts on a scheduled email/SMS cadence.",
    "The heart of the build is the page-generation engine. A custom pagination layer measures every rendered element inside an offscreen iframe — after forcing fonts to actually load — then flows content page by page at 300 DPI, accounting for margins, headers, footers, and recto/verso logic so chapter openings and images land on the correct side of a spread, with per-chapter QR codes linking back to the original recording. Puppeteer renders the final PDF at exact inch dimensions, and the cover is generated separately with spine width computed from the printer's dimensions API based on page count. Around all of that sits a full custom storefront: multi-currency, gifting with scheduled delivery, tax and shipping, and a template abstraction that let the same commerce and print rails serve three more product categories beyond the memoir.",
  ],
  decisions: [
    {
      decision:
        "Ship the interview as text chat first; add realtime voice after launch.",
      alternative: "Hold the launch until speech-to-speech voice worked.",
      why: "I wanted the full pipeline — capture, chapter, paginate, print, fulfill — proven end to end with real orders before betting on the hardest component. The cost: the MVP that hit production in six months shipped without the thing the product is actually about. The first customers got a visibly less magical version of the core experience.",
    },
    {
      decision: "OpenAI Realtime speech-to-speech for the live interview.",
      alternative:
        "A stitched pipeline — Whisper for transcription, an LLM for the next question, a TTS voice — where I'd own every stage.",
      why: "Natural turn-taking. An eighty-year-old can hold a conversation with speech-to-speech in a way a stitched pipeline doesn't match. The cost is control: the model is a black box, and I gave up fine-grained ownership of exact turn-by-turn text and timing. I hedged by keeping a Whisper transcription path and the chat mode as fallbacks.",
    },
    {
      decision:
        "HTML/CSS with Puppeteer as the print engine, with a hand-built measure-and-flow pagination layer on top.",
      alternative:
        "A real typesetting stack — LaTeX, PrinceXML, InDesign templates — that's print-correct out of the box.",
      why: "The customer edits their book in a WYSIWYG editor, and I wanted what they see on screen and what prints to come from one rendering engine. A typesetting pipeline would have been more correct on day one but would have forked preview from print, which for a personalized book is worse. The cost was permanent: browsers aren't deterministic print engines, so I owned font-load races, subpixel drift, and recto/verso edge cases for the life of the product.",
    },
  ],
  broke:
    "The pagination engine's core assumption — measure an element, trust the number — kept getting violated in small ways, and the worst was fonts: measure page content before the custom typeface has finished rendering and every height is subtly wrong, so pages overflow or underflow. On screen that's a visual bug; in print it's a physically wrong book. Nothing defective ever shipped, but getting to \"correct 100% of the time\" meant surgical debugging of slight moving variables — forcing font loads before measurement, waiting on image completion, understanding exactly why one page broke — rather than any single clever fix. The lesson: when your renderer isn't deterministic, determinism becomes your job.",
  outcome:
    "MVP to production in six months, then a major re-launch adding the realtime voice interview and the flexible multi-category commerce platform. Production stability held with negligible bugs or regressions across the run. The company never got to market the product properly — the layoff came right at go-to-market, when the founder concluded he didn't have the capital to market it — so there are no sales numbers to point to. The engineering finished; the business didn't get its shot.",
  media: [
    {
      src: "/work/everbook/everbook-ecom-home.png",
      alt: "Multi-category storefront home — memoir plus additional product lines",
    },
    {
      src: "/work/everbook/everbook-life-story-ecom.png",
      alt: "Life Story product page — desktop",
    },
    {
      src: "/work/everbook/everbook-life-story-ecom-cont.png",
      alt: "Life Story marketing page — storytelling mode selection",
    },
    {
      src: "/work/everbook/everbook-life-story-ecom-mobile.png",
      alt: "Life Story product page — mobile",
      size: "narrow",
    },
    {
      src: "/work/everbook/everbook-life-story-dashboard.png",
      alt: "Life Story author dashboard — prompts, stories, and book settings",
    },
    {
      src: "/work/everbook/everbook-life-story-cover-preview.png",
      alt: "Cover preview — spine width computed from page count",
    },
    {
      src: "/work/everbook/everbook-life-story-pages-preview.png",
      alt: "Paginated book preview — interior spread at print dimensions",
    },
    {
      src: "/work/everbook/everbook-life-story-interview-opening.png",
      alt: "Life Story interview — prompt screen with write, audio, video, and AI interview capture modes",
    },
  ],
  links: [
    { label: "Site", href: "https://www.everbook.com/" },
    { label: "Life story", href: "https://www.everbook.com/ca/product/life-story" },
  ],
} satisfies CaseStudy;
