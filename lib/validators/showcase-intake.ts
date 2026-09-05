import { z } from "zod";
import { SHOWCASE_STEP_KEYS, type ShowcaseStepKey } from "@/lib/types/intake";

/**
 * Per-step shape guards for the showcase track.
 *
 * Same law as the durable track's (`lib/validators/intake.ts`): every field on
 * every step is optional, without exception. Nothing in this form is required
 * (D-INT-4) — a blank is a question for the call, not a validation failure, and
 * a guess is what puts a false claim on a live site. These are guards, never
 * gates: they strip unknown keys and coerce types, and they never refuse a
 * save.
 *
 * **The step slices fill these in.** PORT-1 stands up the map so the track
 * resolver has something to resolve; PORT-2 adds what the start form writes to
 * `about`, PORT-4 fills about/audience/words/media/access, PORT-5 fills
 * experience/work, PORT-7 fills taste, PORT-8 fills site.
 *
 * A field that is not in its step's schema here is **silently dropped on save**
 * — that is the existing law of this system, not a bug to discover later. Add
 * the field, its label in `lib/intake/showcase-answer-labels.ts`, and the input
 * in the step component, together, or the answer will not survive the round
 * trip.
 */

/** The two shapes nearly every showcase answer takes. */
const text = z.string().trim().optional();
const choice = z.array(z.string()).optional();

/**
 * One person on the roster: a name, what they do, and a line about them.
 *
 * `entryKey` is machinery rather than an answer — the only non-optional key in
 * any showcase schema — because a repeatable entry has no other identity and
 * their headshot needs one to point at (M-PORT-14). Array position cannot do
 * the job: removing the first of three people would re-point the second
 * person's photo at the third.
 *
 * `line` is a short text field and not a long one, deliberately. The About page
 * needs a sentence; the call and the primer fill the rest, and a paragraph box
 * per person is how a three-person roster becomes a form nobody finishes.
 */
export const personEntrySchema = z.object({
  entryKey: z.string(),
  name: text,
  role: text,
  line: text,
});

export type PersonEntry = z.infer<typeof personEntrySchema>;

/**
 * Step 1 — Everything you already have (PORT-18).
 *
 * One answer: the paste. It is an ordinary field from the moment it is typed,
 * so a failed read can never cost a client the hour it took to gather — the
 * contract `fastWay`, `peoplePaste`, and `businessPrimer` already hold
 * (D-PORT-3). What the read produces is **not** stored here: written values
 * land in their real steps, and the run's record lives at the answers
 * document's top-level `ingestion` key, invisible to the intake document by
 * construction (M-PORT-26's reasoning). Files dropped on this step are rows in
 * `intake_files` under `ingest_documents`, not answers.
 */
export const stepIngestSchema = z.object({
  dump: text,

  /**
   * Pages worth reading, one URL per line (PORT-21).
   *
   * Its own field rather than URLs harvested out of `dump`, deliberately:
   * fetching a page is a real action taken on the client's behalf, and it
   * should be something they typed into a box labelled for it rather than
   * something a parser inferred from a paste. A link inside the paste stays
   * text.
   *
   * `parseLinks` in `lib/intake/source-kinds.ts` decides which lines are
   * fetched; the stored answer is always exactly what the client typed.
   */
  links: text,
});

/**
 * Step 2 — About you.
 *
 * `whatYouDo`, `siteKinds`, `disciplines`, and `currentWebsite` arrive from the
 * public start form, so this step opens with them already filled.
 */
export const stepAboutSchema = z.object({
  displayName: text,
  whatYouDo: text,
  roles: z.array(z.object({ role: text })).optional(),
  leadRole: text,
  howLong: text,
  basedIn: text,

  /**
   * Broadened from "Union or guild memberships" to cover education, training,
   * and certification (Taylor, 2026-09-01). `unions` stays in the schema and in
   * the label map even though no input writes it any more: an engagement
   * answered before the change still holds one, and dropping the key here would
   * silently delete that answer from the document the next time the step saved.
   *
   * @deprecated Superseded by `credentials`. Read-only; do not add an input.
   */
  unions: text,
  credentials: text,
  affiliations: text,
  representation: text,

  /**
   * The business primer's paste box (PORT-10), retired 2026-09-03.
   *
   * PORT-18's ingestion step asks for everything a client has, on step 1, and
   * writes into every step from it — so this narrower box was the same
   * question asked twice and its input is gone. The key stays in the schema
   * and the label map, exactly as `unions` and `siteKinds` did: an engagement
   * that answered it still holds one, and dropping the key here would silently
   * delete that answer from the document the next time the step saved.
   *
   * @deprecated Superseded by the ingestion step's `dump`. Read-only; do not
   * add an input.
   */
  businessPrimer: text,

  /**
   * The braindump, asked before the form starts narrowing.
   *
   * Not the same field as step 9's `anythingElse`, and deliberately not folded
   * into it: this one is asked of someone who has answered nothing yet, and
   * that is the whole reason it is worth having. The two answers routinely
   * disagree, and the disagreement is signal.
   */
  lookingFor: text,

  /**
   * Where a venture honestly stands today. Asked of the venture kind only,
   * where it replaces "how long you've been doing this" — a question with no
   * good answer for something that has not started yet.
   */
  stage: text,

  /**
   * The story the four stage options cannot hold. Same kind gate as `stage`.
   *
   * A separate field rather than a longer help line on the radio group: the
   * intake document prints them as two answers, and "Raising, not yet built"
   * plus three paragraphs of what is actually signed is a different fact from
   * the radio alone.
   */
  stageDetail: text,

  /**
   * The roster (D-PORT-13). `justYou` and `showTeam` are the durable track's
   * two questions, verbatim, and they are asked in that order for its reason:
   * someone who says "keep it to me" has refused a team *page*, not refused to
   * explain how the work gets done, and the About page needs the second answer
   * either way.
   *
   * `leadPerson` holds the chosen person's `entryKey`, never their name — a
   * person has a stable identity here and `leadRole` only stored text because
   * a role does not. Renaming someone keeps them the lead.
   */
  justYou: text,
  showTeam: text,
  /**
   * The raw paste behind the roster's "Sort this for me". An ordinary answer
   * from the moment it is typed, so a failed extraction can never cost a
   * client their paste (D-PORT-3) — the same contract `fastWay` has on steps
   * 3 and 4.
   */
  peoplePaste: text,
  people: z.array(personEntrySchema).optional(),
  leadPerson: text,

  /**
   * What the site is for — the one answer the cartridge branches on (D-PORT-8).
   *
   * Bounds only. Which values mean something is decided in
   * `lib/intake/showcase-kinds.ts`; an unrecognised value is not an error, it
   * resolves to the derivation's default there.
   *
   * Named `siteKind` rather than `kind` because step 4's project entry already
   * owns `kind`, and the answer-label map is flat across the whole track.
   */
  siteKind: text,

  /**
   * Superseded by `kind` at PORT-11 (2026-09-01). The multi-select this held
   * was collected on the start form and read by nothing; `kindFor` now derives
   * a kind from it for engagements answered before the change.
   *
   * Stays in the schema and the label map, exactly as `unions` did: an
   * engagement that answered one still holds it, and dropping the key here
   * would silently delete that answer the next time step 1 saved.
   *
   * @deprecated Superseded by `kind`. Read-only; do not add an input.
   */
  siteKinds: z.array(z.string()).optional(),
  /**
   * What kind of work the portfolio holds. Asked only of the portfolio and
   * studio kinds, and read on the portfolio branch of `flavourFor` to choose
   * between the film and generic packs — so the stored values are the
   * discipline *keys* from `lib/intake/showcase-steps.ts`, never their labels.
   */
  disciplines: z.array(z.string()).optional(),
  disciplinesOther: text,
  currentWebsite: text,

  /**
   * Contact identity is deliberately absent. Name, email, and phone are
   * columns on the engagement; step 1 renders them from there and writes any
   * edit back to the row, so the same fact never lives in two places
   * (D-INT-8).
   */
});

/** Step 2 — Who this site is for. */
export const stepAudienceSchema = z.object({
  audiences: choice,
  audiencesOther: text,
  whoMattersMost: text,
  whatShouldTheyDo: text,
  wantMoreOf: text,
  stopAttracting: text,
  whyPickYou: text,
  whatYouAreNot: text,
  afterOneVisit: text,
});

/**
 * One position, role, or thing they founded. The LinkedIn layer.
 *
 * `entryKey` is machinery rather than an answer — the only non-optional key in
 * any showcase schema — because a repeatable entry has no other identity and
 * files and re-runs both need one to point at (M-PORT-3).
 */
export const experienceEntrySchema = z.object({
  entryKey: z.string(),
  /**
   * Which roster person this belongs to, by their step-1 entry key.
   *
   * Absent means the entry belongs to the thing itself rather than to anyone
   * on it — which is every entry on a portfolio or a practice, and the
   * organisation's own record on a studio, venture, or business. A key that no
   * longer matches anybody (someone removed from the roster) is not an error:
   * the entry stays in the document and simply stops being grouped under a
   * name, which is the same forgiveness a lead person's stale key gets.
   */
  personKey: text,
  what: text,
  where: text,
  when: text,
  about: text,
  category: text,
  feature: z.boolean().optional(),
});

/** Step 3 — Experience and proof. */
export const stepExperienceSchema = z.object({
  /**
   * The raw paste behind "Sort this for me". Saved as an ordinary field from
   * the moment it is typed, so a failed extraction can never cost a client
   * their paste (D-PORT-3). PORT-6 reads it; nothing deletes it.
   */
  fastWay: text,
  experience: z.array(experienceEntrySchema).optional(),

  /**
   * Per-person links, awards, and press, keyed by a roster person's entry key.
   *
   * A record rather than an array because the roster is step 1's list and this
   * is an annotation on it — an array here would be a second, competing list
   * of who exists, and the two would disagree the first time somebody was
   * removed. Keys with no matching person are inert, exactly like a stale
   * `personKey`; nothing prunes them, because a client who deletes a person by
   * accident should get their notes back when they add them again.
   */
  personProof: z
    .record(
      z.string(),
      z.object({
        linkedin: text,
        instagram: text,
        x: text,
        site: text,
        otherLinks: text,
        awards: text,
        press: text,
      }),
    )
    .optional(),
  awards: text,
  press: text,
  kindWords: text,
  publishPermission: z.boolean().optional(),
  notableNames: text,
});

/**
 * One project.
 *
 * `linkPassword` is the deliberate, documented exception to this system's
 * no-passwords law, and it is not a credential: a Vimeo share password
 * protects one URL and grants nothing else — no account, no other video, no
 * ability to change anything. Without it we cannot watch the private link a
 * client just gave us. It renders as a plain text input, never
 * `type="password"`, so no password manager offers to fill it with something
 * that *is* a credential. See the handoff's binding law 3.
 */
/**
 * One video on a project, or one standing on its own on the Media step.
 *
 * A filmmaker's project is rarely one link — there is the film, the trailer,
 * the behind-the-scenes cut, the festival Q&A. `watchUrl` held exactly one of
 * them, which meant every other one arrived in the story box as a URL nobody
 * could tell apart (Taylor, 2026-09-03).
 *
 * `what` is the line that makes the rest of this useful. The site is designed
 * from these answers, and a bare Vimeo link tells whoever is placing it on the
 * home page nothing about whether it is the film or a forty-second teaser.
 *
 * `password` is the share password the old `linkPassword` held, moved to the
 * link it protects. It is not a credential — a Vimeo share password protects
 * one URL and grants nothing else — and it is a plain text input for the
 * reason recorded at `ProjectEntryCard`.
 *
 * `primary` is optional and at most one per project. The component enforces
 * the "at most one" rather than the schema: a guard that refused a second
 * primary would refuse the save, and nothing in this form refuses a save
 * (D-INT-4).
 */
export const projectVideoSchema = z.object({
  entryKey: z.string(),
  url: text,
  what: text,
  password: text,
  primary: z.boolean().optional(),
});

export type ProjectVideo = z.infer<typeof projectVideoSchema>;

export const projectEntrySchema = z.object({
  entryKey: z.string(),
  title: text,
  year: text,
  role: text,
  kind: text,
  forWhom: text,
  /**
   * The single watch link, and its share password.
   *
   * **Superseded by `videos` at PORT-19 and still here on purpose.** They are
   * no longer rendered anywhere, and an entry that carries one is read as a
   * single video by `videosOf` — D-PORT-11's law at field scale: a question
   * that stops being asked leaves its answer alone rather than stripping it on
   * the next save.
   */
  watchUrl: text,
  linkPassword: text,
  videos: z.array(projectVideoSchema).optional(),
  story: text,
  credits: text,
  awards: text,
  rights: text,
  placement: text,
});

/**
 * One thing a practice offers: an engagement, a session, a talk, a book.
 *
 * `pricePosture` decides whether `price` is asked at all, and a price that was
 * typed and then hidden stays stored — the same law that governs a whole
 * question when the kind changes (D-PORT-11), applied at field scale.
 */
export const offeringEntrySchema = z.object({
  entryKey: z.string(),
  title: text,
  format: text,
  forWhom: text,
  scope: text,
  pricePosture: text,
  price: text,
  link: text,
  story: text,
  placement: text,
});

/**
 * One piece of what a venture is building: the property, a phase, a programme.
 *
 * `status` is what makes this shape honest — a venture's step 4 mixes what
 * exists with what is planned, and a site that cannot tell them apart is the
 * one thing this entry must never allow. It is left blank unless the client
 * says, and the extractor is forbidden from guessing it (M-PORT-24).
 */
export const pieceEntrySchema = z.object({
  entryKey: z.string(),
  title: text,
  kind: text,
  status: text,
  when: text,
  story: text,
  placement: text,
});

/** One service a business sells. The durable track's shape, entry-keyed. */
export const serviceEntrySchema = z.object({
  entryKey: z.string(),
  title: text,
  price: text,
  included: text,
  duration: text,
  takesLonger: text,
  placement: text,
});

/**
 * One thing a visitor is being asked to do: invest, apply, book, get in touch.
 *
 * The gap the category audit found (B4): nothing in nine steps captured the
 * commercial ask, because a portfolio's ask is "hire me" and step 8's contact
 * question already carried it.
 *
 * **`number` is free text and always will be.** "from €50k", "tiers, not
 * public", and "we haven't set one" are all real answers a numeric validator
 * would refuse. Nothing on this surface totals, converts, or charges anything —
 * there is no arithmetic anywhere near it, which is structural rather than
 * disciplinary.
 */
export const askEntrySchema = z.object({
  entryKey: z.string(),
  ask: text,
  forWhom: text,
  getWhat: text,
  number: text,
  mechanism: text,
  destination: text,
  visibility: text,
});

export type OfferingEntry = z.infer<typeof offeringEntrySchema>;
export type PieceEntry = z.infer<typeof pieceEntrySchema>;
export type ServiceEntry = z.infer<typeof serviceEntrySchema>;
export type AskEntry = z.infer<typeof askEntrySchema>;

/**
 * Step 4 — The work, or what you offer, or what you're building.
 *
 * **Four separate arrays, not one polymorphic one** (M-PORT-23). A shared
 * `entries[]` with a shape discriminator would let a kind change re-read a
 * project as a service, or let a validator strip entries whose shape no longer
 * matches. Separate keys mean a shape that stops rendering leaves its value
 * alone, which is what D-PORT-11 promises in words.
 *
 * No cap on any of them, ever.
 */
export const stepWorkSchema = z.object({
  fastWay: text,
  projects: z.array(projectEntrySchema).optional(),
  /**
   * The reel question, and the paragraph that followed it.
   *
   * Both retired at PORT-19 — the reel is answered by a project's primary
   * video and the home block on step 9; the five are picked from the project
   * rows into `topFivePicks`. Neither is rendered; both stay so a stored
   * answer keeps printing in the document.
   */
  reel: text,
  topFive: text,
  /** Up to five project entry keys. The order is the rank; nothing else is. */
  topFivePicks: choice,
  organization: choice,
  organizationOther: text,
  sayMore: text,

  /** The three kind-shaped entry arrays that sit beside `projects`. */
  offerings: z.array(offeringEntrySchema).optional(),
  pieces: z.array(pieceEntrySchema).optional(),
  services: z.array(serviceEntrySchema).optional(),

  /** What the site is asking people to do (audit B4). */
  asks: z.array(askEntrySchema).optional(),

  /**
   * The claims cluster — the track's one ink treatment (D-PORT-10, audit B5).
   *
   * These three are what stop a false claim reaching a live site: who reads the
   * words before they go up, what may not be said, and what must appear
   * verbatim. The durable track has had an equivalent since INT; the showcase
   * track shipped without one, on a page that can carry an investment
   * solicitation.
   *
   * All three are quote-or-nothing to the business primer, by its existing
   * rule: anything touching money, legal status, or claims about results.
   */
  signOff: text,
  cantSay: text,
  requiredWording: text,
});

export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;

/** One roster person's links, awards, and press. Keyed by their entry key. */
export type PersonProof = NonNullable<
  z.infer<typeof stepExperienceSchema>["personProof"]
>[string];
export type ProjectEntry = z.infer<typeof projectEntrySchema>;

/**
 * A 1–7 weight on a reaction. Optional everywhere, and that is the ruling.
 *
 * **There is no default.** A scale that arrives pre-set at four fabricates a
 * score nobody gave, and every pick a client never touched would read as the
 * same middle number — which is worse than no number, because it looks like an
 * answer. An untouched scale saves nothing and the document prints "no score".
 *
 * D-PORT-4 forbade rating sliders and was amended by Taylor on 2026-09-03. What
 * it refused was a rating *instead of* a why, applied to every card in
 * isolation. This is a weight *on* a why: it exists only inside a pick the
 * client chose to make, it is asked as closeness ("how close is this to what
 * you want?") rather than as quality, and the note beside it is the field that
 * matters. The taste scope §14 carries the full reversal.
 */
const score = z.number().int().min(1).max(7).optional();

/**
 * Step 6 — Taste.
 *
 * ## The shape
 *
 * `picks` is what a client kept from the gallery we showed them: a site key, an
 * optional closeness score, and the note that is the actual point. Order is
 * gallery order and carries no meaning — the score is the rank, and ties are
 * honest. There is no position field, because the drag-rank it replaced was
 * asking for a total ordering nobody holds (D-PORT-4 as amended).
 *
 * `references` is the same reaction to sites we did *not* show them: their own
 * links, typed or taken from the AI search, each with the same score and note.
 * `entryKey` is machinery rather than an answer — a repeatable entry has no
 * other identity (M-PORT-14) — and `source` records whether the client typed
 * the link or pressed "Add to my sites" on a search result.
 *
 * `styleBrief` is what they typed into the search box. It is kept whether or
 * not the search ever ran, because a description of the site someone is
 * picturing is worth having even if no link came back.
 *
 * ## Legacy, read but never written
 *
 * `favourites` and `notes` are PORT-7's shape. `picksOf` in
 * `lib/intake/taste-picks.ts` reads a `favourites` array as unscored picks and
 * **nothing writes the derivation back** — the same law `videosOf` follows for
 * a project's legacy `watchUrl` (PORT-19). An engagement answered before today
 * keeps its stored array untouched until the client edits a pick, at which
 * point `picks` is written beside it and the legacy key goes quiet.
 *
 * ## Retired, and still here on purpose
 *
 * The five keys under the retirement comment below are questions the step no
 * longer asks (D-PORT-20). **They stay in this schema because this schema is
 * the shape guard**: a key removed from here is a key stripped from the answers
 * document on the client's next save, so deleting them would quietly erase what
 * people already answered — on the one surface whose supreme law is that
 * answers are never lost. They render nowhere, they are excluded from the done
 * screen's skipped list by `RETIRED_TASTE_KEYS`, and they keep their labels so
 * a stored answer still prints as words.
 */
export const stepTasteSchema = z.object({
  picks: z
    .array(z.object({ siteKey: z.string(), score, note: text }))
    .optional(),
  references: z
    .array(
      z.object({
        entryKey: z.string(),
        /**
         * Stored as typed. Normalising a bare `juliarossetti.com` into a URL is
         * the component's job (PORT-23); refusing one is nobody's — nothing on
         * this form refuses a save (D-INT-4).
         */
        url: text,
        score,
        note: text,
        source: z.enum(["typed", "search"]).optional(),
      }),
    )
    .optional(),
  styleBrief: text,

  wordOne: text,
  wordTwo: text,
  wordThree: text,
  neverFeelLike: text,

  /**
   * Moved here from the media step (Taylor, 2026-09-04: "feels like it belongs
   * in taste, not in media").
   *
   * It was next to the logo and the file drops, which made it read as an asset
   * question. It is a taste question, and it belongs with the three words and
   * the thing the site must never feel like — the cluster the style search then
   * reads. No engagement had answered it, so the key moved with no fallback.
   */
  coloursYouLike: text,
  brainDump: text,

  /* ── Bought the animations add-on ──────────────────────────────────────
     Present only for a client who paid for it, on the pay screen or on this
     step (PORT-26). */
  animationReferences: text,
  animationIntensity: text,
  animationNever: text,

  /* ── Legacy (PORT-7). Read by `picksOf`, never written. ──────────────── */
  favourites: z.array(z.object({ siteKey: z.string(), note: text })).optional(),
  notes: z.record(z.string(), z.string()).optional(),

  /* ── Retired 2026-09-03 (D-PORT-20). Kept so stored answers survive. ───
     Asked by no screen. `darkOrLight`, `stillness`, and `density` are now
     properties of the sites a client picks rather than questions they answer
     cold; `linksWorthALook` became `references`; `closeTab` folded into the
     brain dump's help. Do not delete these — see the docstring above. */
  darkOrLight: text,
  stillness: text,
  density: text,
  linksWorthALook: text,
  closeTab: text,
});

/** One kept reaction to a site we showed them. */
export type TastePick = { siteKey: string; score?: number; note?: string };

/** One kept reaction to a site they found. */
export type TasteReference = {
  entryKey: string;
  url?: string;
  score?: number;
  note?: string;
  source?: "typed" | "search";
};

/** PORT-7's shape. Read by `picksOf`; nothing writes it. */
export type TasteFavourite = { siteKey: string; note?: string };

/** Step 6 — Your words. Uploads are rows in `intake_files`, not answers. */
export const stepWordsSchema = z.object({
  /**
   * How they want to come across — three words or one sentence, their choice.
   *
   * One field rather than two, because "either" is the honest instruction: a
   * three-box shape would make three words the expected answer and a sentence
   * the awkward one. `predictComeAcross` proposes both shapes into it and
   * writes neither.
   */
  comeAcross: text,
  currentBio: text,
  keepMyWording: z.boolean().optional(),
  personVoice: text,
  writtenNotes: text,
  neverSay: text,
  recordingConsent: z.boolean().optional(),
});

/** Step 7 — Media. */
export const stepMediaSchema = z.object({
  /**
   * Videos that belong to no project — a showreel, a teaser, a talk.
   *
   * The same shape a project's videos take, minus the primary tick, which is
   * a per-project idea and has nothing to sit at the top of here.
   */
  videos: z.array(projectVideoSchema).optional(),
  logoStatus: text,
  dislikes: text,

  /* ── Bought the logo refresh add-on (2026-09-03) ───────────────────────
     What the first round's board gets built from. `logoWhere` is a checkbox
     group because each surface constrains the mark differently — a logo that
     has to survive embroidery is not the same logo as a favicon. */
  logoFeeling: text,
  logoExactWording: text,
  logoWhere: choice,
  logoDirections: text,
});

/** Step 8 — The site itself. */
export const stepSiteSchema = z.object({
  pages: choice,
  /**
   * Pages the checklist does not name, typed by the client.
   *
   * Replaced `pagesOther`, a single text box, at Taylor's 2026-09-04 note: a
   * typed page is a page, so it counts toward the running total and can be
   * removed like any other. Adding the row is choosing it, so there is no
   * separate selected flag to keep in step with the list.
   */
  pagesCustom: choice,
  /**
   * What the pages they bought at checkout are for. Asked only of clients who
   * bought some — see `paidExtraPages`.
   */
  extraPagesPlan: text,
  howSeparate: text,
  howToReach: text,

  /**
   * A form built elsewhere that has to live on the site.
   *
   * Not the same question as `howToReach`: that one picks the contact route,
   * this one surfaces a Typeform or a Google Form the client already depends
   * on. The link and the notes are the two things that make it buildable, and
   * `embedFormNotes` is where "the responses feed a spreadsheet my whole
   * intake runs on" gets said before launch rather than after.
   */
  embedForm: text,
  embedFormLink: text,
  embedFormNotes: text,

  showAvailability: text,
  /** What it should say, and when it stops being true (PORT-19 note 12). */
  availabilityDetail: text,

  /**
   * The home page: the braindump, and the shortlist it is read beside.
   *
   * `homeMedia` holds `intake_files` row ids; `homeVideos` holds video refs
   * minted by `videoRef` — a project's entry key and the video's, joined, or
   * `media` and the video's for one that belongs to no project. Both are
   * stored as given: a file that is later deleted, or a video that is later
   * removed, leaves a tick pointing at nothing rather than editing the
   * client's answer behind their back, and the block says so where it renders.
   *
   * This block replaced the reel question at PORT-19.
   */
  homeBrainDump: text,
  homeMedia: choice,
  homeVideos: choice,

  oldSiteSurvives: text,
  linksOutThere: text,

  /* ── Bought the Supabase add-on (2026-09-03) ───────────────────────────── */
  supabaseWhatPersists: text,
  supabaseWhoLogsIn: text,
  supabaseExistingData: text,
  /** How carefully it has to be built, not whether it gets built. */
  supabaseSensitivity: text,

  /* ── Bought the SEO blog add-on (2026-09-03) ───────────────────────────── */
  blogWhoWrites: text,
  blogHowOften: text,
  blogTopics: text,
  blogExisting: text,
});

/**
 * Pages included in the build before an extra-page conversation happens.
 *
 * Published in the marketing scope (R-8) and in step 8's own intro. Project
 * detail pages do not count against it — they come with the work section.
 * One home, so the step's note and any later quote read the same number.
 */
export const INCLUDED_PAGES = 5;

/**
 * Step 9 — Accounts and access.
 *
 * There is no password field here and there never will be one, exactly as on
 * the durable track. The one apparent exception arrives on step 4 — a per
 * project share password for a private Vimeo link — and it is not a
 * credential: a share password protects one URL and grants nothing else. See
 * PORT-5, where the field carries that note at its definition.
 */
export const stepAccessSchema = z.object({
  ownsDomain: text,
  domainName: text,
  registrar: text,
  domainAccess: text,
  emailAtDomain: text,
  /**
   * Where the video lives — retired at PORT-19, kept so stored answers print.
   *
   * The question asked a client to name Vimeo or YouTube after they had
   * already pasted the links themselves, on the project cards and on Media.
   * The domains answer it (Taylor, 2026-09-03), so asking was making someone
   * type the same fact twice.
   */
  videoHosts: choice,
  videoHostsOther: text,
  accounts: z.array(z.object({ platform: text, link: text })).optional(),
  currentPlatform: text,

  /**
   * What the client already runs, and whose account each one lives in.
   *
   * Asked instead of the video-host question on every kind but a portfolio and
   * a studio. `toolsDetail` is where the "whose account" answer lands, and it
   * is the half that matters: an organisation's Mailchimp and a founder's
   * personal one are different assets with different handover paths.
   */
  tools: choice,
  toolsDetail: text,
  /** Whatever the eight-item checklist did not name. */
  toolsOther: text,

  /* ── Bought the admin panel add-on (2026-09-03) ────────────────────────── */
  adminEditors: text,
  adminEditWhat: text,

  /* ── Bought the booking add-on (2026-09-03) ────────────────────────────── */
  bookingWhat: text,
  bookingCalendar: text,
  bookingLeadTime: text,
  bookingPayment: text,
  bookingPolicy: text,

  handsOn: text,
  bestContactMethod: text,
  anythingElse: text,
});

export const SHOWCASE_STEP_SCHEMAS = {
  ingest: stepIngestSchema,
  about: stepAboutSchema,
  audience: stepAudienceSchema,
  experience: stepExperienceSchema,
  work: stepWorkSchema,
  taste: stepTasteSchema,
  words: stepWordsSchema,
  media: stepMediaSchema,
  site: stepSiteSchema,
  access: stepAccessSchema,
} satisfies Record<ShowcaseStepKey, z.ZodType>;

export const showcaseStepKeySchema = z.enum(SHOWCASE_STEP_KEYS);

/**
 * The public start form at `/websites/coded/intake`.
 *
 * Shorter than the durable track's because a creative arrives by a link
 * someone sent them rather than off a phone call, and everything substantive
 * waits until after payment. Name and email are the only two that gate: they
 * are what an engagement cannot exist without, and what a lost link is
 * recovered by.
 *
 * There is no business-name field. The engagement row's `business_name` is
 * notNull and carries the client's own name on this track (M-PORT-3) — a
 * filmmaker's practice is usually themselves, and asking a second time for the
 * same string is the D-INT-8 failure in miniature.
 *
 * `website` is a honeypot, same as the durable form: a real client never sees
 * it, so anything in it is a bot. Named to be tempting rather than obviously
 * bait.
 */
export const startShowcaseIntakeInput = z.object({
  contactName: z.string().trim().min(1, "Please add your name"),
  contactEmail: z.email("Please add an email we can reach you at"),
  contactPhone: z.string().trim().min(1).optional(),
  whatYouDo: z.string().trim().optional(),

  /** The kind picker. Bounds only; `showcase-kinds.ts` decides what each means. */
  siteKind: z.string().trim().optional(),

  /**
   * What the thing is called, asked of every kind but a portfolio.
   *
   * This becomes the engagement's `business_name`. Before PORT-11 that column
   * always carried the contact's own name, on the assumption that a creative's
   * practice is themselves (M-PORT-3) — true of a filmmaker and wrong of a
   * venture with three founders and a property.
   */
  entityName: z.string().trim().optional(),
  disciplines: z.array(z.string()).optional(),
  disciplinesOther: z.string().trim().optional(),
  currentWebsite: z.string().trim().optional(),
  website: z.string().max(0).optional(),
});

export type StartShowcaseIntakeInput = z.infer<typeof startShowcaseIntakeInput>;

/*
 * There is no separate showcase save action. Both tracks share `saveStep` and
 * its `anyStepKeySchema`, because the autosave engine is one mechanism and
 * forking it would fork the one promise this system makes: that an answer is
 * never lost. Belonging is checked one layer down, where it is checked against
 * the engagement's real track rather than against the shape of a request.
 */

/**
 * The discipline answer the flavour resolver reads.
 *
 * Bounds only — which values mean something is decided by
 * `lib/intake/showcase-steps.ts`, in one place. An unrecognised discipline is
 * not an error; it resolves to the generic copy pack.
 */
export const showcaseDisciplinesInput = z.array(z.string()).optional();

/**
 * Which payment plan the client picked on the pay screen.
 *
 * The browser names a plan, never a product key and never an amount. The
 * catalogue turns this into a row server-side (`getBuildProduct`), so the worst
 * a fabricated request can do is pick the other legitimate plan on its own
 * track.
 */
export const buildPlanInput = z.enum(["half", "full"]);
