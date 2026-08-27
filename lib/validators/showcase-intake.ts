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
 * Step 1 — About you.
 *
 * `whatYouDo`, `siteKinds`, `disciplines`, and `currentWebsite` arrive from the
 * public start form, so step 1 opens with them already filled.
 */
export const stepAboutSchema = z.object({
  displayName: text,
  whatYouDo: text,
  roles: z.array(z.object({ role: text })).optional(),
  leadRole: text,
  howLong: text,
  basedIn: text,
  unions: text,
  representation: text,

  /** Which category of site, from the start form's first checkbox group. */
  siteKinds: z.array(z.string()).optional(),
  /**
   * What kind of work the portfolio holds. Read by `flavourFor` to pick the
   * example-site set and the copy pack, so the stored values are the discipline
   * *keys* from `lib/intake/showcase-steps.ts`, never their labels.
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
export const projectEntrySchema = z.object({
  entryKey: z.string(),
  title: text,
  year: text,
  role: text,
  kind: text,
  forWhom: text,
  watchUrl: text,
  linkPassword: text,
  story: text,
  credits: text,
  awards: text,
  rights: text,
  placement: text,
});

/** Step 4 — The work. No cap on projects, ever. */
export const stepWorkSchema = z.object({
  fastWay: text,
  projects: z.array(projectEntrySchema).optional(),
  reel: text,
  topFive: text,
  organization: choice,
  organizationOther: text,
  sayMore: text,
});

export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;

/**
 * Step 5 — Taste.
 *
 * `favourites` is an ordered array and **the order is the rank** — there is no
 * separate position field to disagree with it. Notes live on the favourite
 * itself so a rank and its reason cannot come apart.
 *
 * `notes` holds what a client wrote about a site they did *not* favourite. A
 * note is worth keeping either way: "this one, but not the type" is a
 * sharper instruction than any ranking.
 *
 * No rating field exists here and none ever will. The favourites flow replaced
 * rating sliders deliberately (handoff decision 6) — a five-star average of a
 * person's taste is a number that means nothing to the person who has to
 * design from it.
 */
export const stepTasteSchema = z.object({
  favourites: z
    .array(z.object({ siteKey: z.string(), note: text }))
    .optional(),
  notes: z.record(z.string(), z.string()).optional(),
  darkOrLight: text,
  stillness: text,
  density: text,
  wordOne: text,
  wordTwo: text,
  wordThree: text,
  neverFeelLike: text,
  linksWorthALook: text,
  brainDump: text,
  closeTab: text,
});

export type TasteFavourite = { siteKey: string; note?: string };

/** Step 6 — Your words. Uploads are rows in `intake_files`, not answers. */
export const stepWordsSchema = z.object({
  currentBio: text,
  keepMyWording: z.boolean().optional(),
  personVoice: text,
  writtenNotes: text,
  neverSay: text,
  recordingConsent: z.boolean().optional(),
});

/** Step 7 — Media. */
export const stepMediaSchema = z.object({
  logoStatus: text,
  coloursYouLike: text,
  dislikes: text,
});

/** Step 8 — The site itself. */
export const stepSiteSchema = z.object({
  pages: choice,
  pagesOther: text,
  howSeparate: text,
  howToReach: text,
  showAvailability: text,
  oldSiteSurvives: text,
  linksOutThere: text,
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
  videoHosts: choice,
  videoHostsOther: text,
  accounts: z.array(z.object({ platform: text, link: text })).optional(),
  currentPlatform: text,
  handsOn: text,
  bestContactMethod: text,
  anythingElse: text,
});

export const SHOWCASE_STEP_SCHEMAS = {
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
  siteKinds: z.array(z.string()).optional(),
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
