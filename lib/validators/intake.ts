import { z } from "zod";
import {
  INTAKE_STEP_KEYS,
  INTAKE_TRACK_KEYS,
  SHOWCASE_STEP_KEYS,
  type IntakeStepKey,
} from "@/lib/types/intake";

/**
 * Everything Taylor knows after the sales call, captured once so the client is
 * never asked for it again (D-INT-8).
 *
 * Shared deliberately: the CLI validates against this today and the admin
 * surface will validate against the same schema later. One home, so the two
 * cannot disagree about what an engagement needs.
 */
export const createEngagementInput = z.object({
  businessName: z.string().trim().min(1, "Business name is required"),
  contactName: z.string().trim().min(1, "Contact name is required"),
  contactEmail: z.email("A valid contact email is required"),
  contactPhone: z.string().trim().min(1).optional(),

  /** Renders verbatim on the pay screen — written for the client's eyes. */
  projectSummary: z.string().trim().min(1).optional(),

  currency: z.string().trim().length(3).default("cad"),
  depositRequired: z.boolean().default(true),

  /**
   * Which questionnaire this engagement answers. Defaults to the durable
   * track, so every existing caller — the CLI, the durable start form —
   * keeps creating exactly what it created before.
   */
  track: z.enum(INTAKE_TRACK_KEYS).default("durable"),
});

// The deposit amount is deliberately absent. A standard build has a standard
// price, which lives in Stripe's catalogue (STRIPE_PRICE_DEPOSIT) rather than
// being retyped per client. `engagements.deposit_amount_cents` is now written
// at fulfillment as the record of what was actually charged.

/**
 * `z.input`, not `z.infer`: the defaulted fields (`currency`, `depositRequired`,
 * `track`) are optional to *supply* and guaranteed to *exist* after parsing.
 * Inferring the output type here would force every caller to restate a default
 * the schema already holds — and would have made adding `track` a change to
 * every call site rather than to none.
 */
export type CreateEngagementInput = z.input<typeof createEngagementInput>;

/**
 * The public start form at `/intake`.
 *
 * Six fields, because this is the screen a client meets before they have paid
 * anything and the only job it has is to make an engagement real. Everything
 * substantive — business number, GST, insurance — waits until Step 1, behind
 * the deposit.
 *
 * `website` is a honeypot: a real client never sees it, so anything in it is a
 * bot. Named to be tempting rather than obviously bait.
 */
export const startIntakeInput = z.object({
  businessName: z.string().trim().min(1, "Please add your business name"),
  contactName: z.string().trim().min(1, "Please add your name"),
  contactEmail: z.email("Please add an email we can reach you at"),
  contactPhone: z.string().trim().min(1).optional(),
  whatYouDo: z.string().trim().min(1).optional(),
  /**
   * A Google Maps share link. Deliberately not validated beyond "some text" —
   * a client pasting a search URL or their listing name instead of a share
   * link has still told us enough to find them, and rejecting it would cost
   * more than the tidiness is worth. The verification call confirms it.
   */
  googleMapsUrl: z.string().trim().optional(),
  currentWebsite: z.string().trim().optional(),
  website: z.string().max(0).optional(),
});

export type StartIntakeInput = z.infer<typeof startIntakeInput>;

/* ────────────────────────────────────────────────────────────────────────────
   Questionnaire answers
   ────────────────────────────────────────────────────────────────────────────

   Every field on every step is optional, without exception. Nothing in this
   form is required (D-INT-4) — a blank is a question for the verification
   call, not a validation failure, and a guess is what puts a false claim on a
   live site.

   So these schemas are shape guards, not gates. They exist to strip unknown
   keys and coerce types before anything reaches the database, never to refuse
   a submission. Zod's default object behaviour drops unrecognised keys, which
   is exactly what we want from a client we do not control.

   The per-step TypeScript types are inferred from the schemas rather than
   written twice. The schema is the shape; a hand-maintained interface beside
   it would be a second home for one fact.
   ──────────────────────────────────────────────────────────────────────────── */

const text = z.string().trim().optional();
const choice = z.array(z.string()).optional();

/** Step 1 — About your business. */
export const stepBusinessSchema = z.object({
  businessName: text,
  legalName: text,
  logoName: text,
  contactName: text,
  contactPhone: text,
  contactEmail: text,
  whatYouDo: text,
  howLong: text,
  businessNumber: text,
  gstRegistered: text,
  insured: text,
  insuranceType: text,
  licences: text,
});

/** One service, priced. Free-form throughout — "from $80/hr" is a real answer. */
export const serviceSchema = z.object({
  name: text,
  price: text,
  included: text,
  duration: text,
  whatMakesItLonger: text,
});

export const addOnSchema = z.object({ name: text, price: text });

/** Step 2 — What you offer and what you charge. */
export const stepPricingSchema = z.object({
  services: z.array(serviceSchema).optional(),
  addOns: z.array(addOnSchema).optional(),
  extraCharges: choice,
  extraChargesOther: text,
  dontOffer: text,
  minimumJob: text,
  paymentMethods: choice,
  paymentMethodsOther: text,
  whenTheyPay: text,
  depositAmount: text,
  cancellationPolicy: text,
});

/** Step 3 — How you work. The step that stops false claims reaching a site. */
export const stepOperationsSchema = z.object({
  whatYouBring: text,
  customerProvides: choice,
  customerProvidesOther: text,
  whatMustBeTrue: text,
  whatMakesYouDecline: text,
  areasCovered: text,
  areasAvoided: text,
  furthestTravel: text,
  daysWorked: choice,
  typicalHours: text,
  jobsPerDay: text,
  howFarAhead: text,
  shortestNotice: text,
  badWeather: text,
  replySpeed: text,
  howCustomersBook: choice,
  howCustomersBookOther: text,
});

/** Step 4 — Your customers and competition. */
export const stepPositioningSchema = z.object({
  idealCustomer: text,
  badFit: text,
  whyPickYou: text,
  whoYouLoseTo: text,
  valueOne: text,
  valueTwo: text,
  valueThree: text,
  sellYourself: text,
  whatYouAreNot: text,
});

/** Step 5 — How you talk. Uploads are rows in `intake_files`, not answers. */
export const stepVoiceSchema = z.object({
  neverSay: text,
  writtenNotes: text,
  recordingConsent: z.boolean().optional(),
});

/** Step 6 — Photos and logo. */
export const stepPhotosSchema = z.object({
  logoStatus: text,
  coloursYouUse: text,
  dislikes: text,
});

/** Step 7 — Reviews and proof. */
export const stepReviewsSchema = z.object({
  reviewSources: choice,
  bestReviews: text,
  publishPermission: z.boolean().optional(),
  notableClients: text,
});

export const teamMemberSchema = z.object({ name: text, role: text });

/** Step 8 — Your team. */
export const stepTeamSchema = z.object({
  justYou: text,
  headcount: text,
  aboutTeam: text,
  showTeam: text,
  team: z.array(teamMemberSchema).optional(),
  yourBackground: text,
});

export const socialAccountSchema = z.object({ platform: text, url: text });

/**
 * Step 9 — Accounts and access.
 *
 * There is no password field here and there never will be one. Access is
 * collected out of band: the confirmation email lists what invitations to send
 * and where. A credential typed into a free-text box is a design failure
 * upstream of the box (build spec §5).
 */
export const stepAccessSchema = z.object({
  googleMapsUrl: text,
  ownsDomain: text,
  domainName: text,
  registrar: text,
  domainAccess: text,
  emailAtDomain: text,
  googleBusinessProfile: text,
  socials: z.array(socialAccountSchema).optional(),
  existingWebsite: text,
  existingWebsitePlatform: text,
  hasStripe: text,
  bookingTool: text,
  /**
   * Paid extras the client wants quoted. Named `extrasWanted` rather than
   * `addOns` because `answer-labels.ts` is a flat key-to-label map and step 2
   * already owns `addOns` for the client's *own* add-on services. Two steps
   * can hold the same key in the database without colliding; the document
   * would have labelled these "Add-ons" and read as the client's price list.
   */
  extrasWanted: choice,
  bookingServices: text,
  bookingCalendar: text,
  /**
   * The two facts the Stripe setup guide needs that this form does not already
   * hold. GST status is step 1 and the product list is step 2, so neither is
   * asked twice (D-INT-8). There is no field for the invite itself: access is
   * collected out of band, and a "have you invited me yet" checkbox ticked
   * before the client has opened the guide would record a false yes.
   */
  stripeAccountEmail: text,
  statementDescriptor: text,
  bestContactMethod: text,
  anythingElse: text,
});

export const STEP_SCHEMAS = {
  business: stepBusinessSchema,
  pricing: stepPricingSchema,
  operations: stepOperationsSchema,
  positioning: stepPositioningSchema,
  voice: stepVoiceSchema,
  photos: stepPhotosSchema,
  reviews: stepReviewsSchema,
  team: stepTeamSchema,
  access: stepAccessSchema,
} satisfies Record<IntakeStepKey, z.ZodType>;

export type StepBusinessAnswers = z.infer<typeof stepBusinessSchema>;
export type StepPricingAnswers = z.infer<typeof stepPricingSchema>;
export type StepOperationsAnswers = z.infer<typeof stepOperationsSchema>;
export type StepPositioningAnswers = z.infer<typeof stepPositioningSchema>;
export type ServiceAnswer = z.infer<typeof serviceSchema>;
export type AddOnAnswer = z.infer<typeof addOnSchema>;

export const intakeStepKeySchema = z.enum(INTAKE_STEP_KEYS);

/**
 * Any track's step key.
 *
 * The save action is shared by both tracks — the autosave engine is one
 * mechanism and forking it would fork the one promise this system makes about
 * never losing an answer. Shape validation here is deliberately permissive
 * about *which* track a key belongs to, because that question has a better
 * answer one layer down: `saveStepAnswers` resolves the schema through the
 * engagement's own track and refuses a foreign key outright (M-PORT-1). The
 * action validates shape; the seam validates belonging.
 */
export const anyStepKeySchema = z.enum([
  ...INTAKE_STEP_KEYS,
  ...SHOWCASE_STEP_KEYS,
]);

/** The save action's input. The token is a credential, so it is never logged. */
export const saveStepInput = z.object({
  token: z.string().min(1),
  stepKey: anyStepKeySchema,
  answers: z.record(z.string(), z.unknown()),
});

export type TeamMemberAnswer = z.infer<typeof teamMemberSchema>;
export type SocialAccountAnswer = z.infer<typeof socialAccountSchema>;

/**
 * Upload issuance. Size is the only thing that can refuse a file — never the
 * format. A client sending a `.heic` from an iPhone or a `.amr` voice memo
 * from an old Android is sending exactly what they have, and rejecting it
 * teaches them the form is broken (requirements doc §A).
 */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const uploadIssueInput = z.object({
  token: z.string().min(1),
  stepKey: anyStepKeySchema,
  fieldKey: z.string().min(1).max(40),
  /**
   * Which repeatable entry the file belongs to. Bounded shape only — an
   * unrecognised key just means the file groups under nothing, which is a
   * cosmetic loss in the intake document rather than a reason to refuse a
   * client's upload.
   */
  entryKey: z.string().min(1).max(24).optional(),
  filename: z.string().min(1).max(255),
  mimeType: z.string().max(160).optional(),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

/**
 * A ceiling on a transcript the client has edited.
 *
 * Thirty minutes of continuous speech is on the order of 30,000 characters, so
 * this is roughly triple the longest real transcript with room for somebody
 * who decides to type their whole biography into the box. It bounds a hostile
 * payload; it is not a limit any client can reach by talking.
 */
export const MAX_TRANSCRIPT_CHARS = 100_000;

export const transcriptSaveInput = z.object({
  token: z.string().min(1),
  fileId: z.uuid(),
  /**
   * An empty string is legitimate and means "delete what the machine wrote".
   * Every field on this form is optional, and that includes unsaying something
   * (D-INT-4).
   */
  transcript: z.string().max(MAX_TRANSCRIPT_CHARS),
});

/**
 * The pay action's input beyond the token: which optional add-ons the client
 * ticked on P0. Keys are validated against the live catalogue in the deposit
 * service — this schema only bounds the shape, so a hostile payload cannot
 * smuggle in size or type surprises.
 */
export const depositAddonSelectionInput = z
  .array(z.string().trim().min(1).max(64))
  .max(12)
  .default([]);

/**
 * A sanity ceiling on one extra-page purchase, not a product rule.
 *
 * Twenty pages past the included five is not a site, it is a typo — and a typo
 * in a quantity is the cheapest possible way to overcharge someone. It lives
 * here rather than in the deposit service because both ends need it now: the
 * server bounds the charge with it, and the pay screen builds its picker from
 * it, and a second copy on the browser side is a ceiling that can drift below
 * the one that actually refuses.
 */
export const EXTRA_PAGES_MAX = 20;

/**
 * How many extra pages the client asked for on the pay screen.
 *
 * Zero is the ordinary answer and is not a selection — it means the row was
 * left alone. The count rides Stripe's own line-item `quantity`, so this is
 * the only number the browser proposes, and it proposes a *count*, never an
 * amount: the price still comes from the catalogue row and is verified against
 * Stripe before a session exists.
 */
export const extraPagesInput = z.coerce
  .number()
  .int()
  .min(0)
  .max(EXTRA_PAGES_MAX)
  .catch(0)
  .default(0);

/**
 * The ceiling on blog posts bought at checkout, for the same reason
 * `EXTRA_PAGES_MAX` exists: a count is the cheapest way to overcharge someone
 * by a typo, and the browser's picker and the server's refusal must be built
 * from one number.
 *
 * Lower than the page ceiling on purpose. Twenty posts is a content contract,
 * not a checkbox on a deposit screen — past this the conversation is a
 * conversation, and Taylor invoices it.
 */
export const SEO_POSTS_MAX = 10;

/**
 * How many written blog posts the client asked for on the pay screen.
 *
 * Zero is the ordinary answer. Gated as well as bounded: the service drops
 * this count entirely unless the blog itself is being bought, because a post
 * with nowhere to publish is work the client cannot use.
 */
export const seoPostsInput = z.coerce
  .number()
  .int()
  .min(0)
  .max(SEO_POSTS_MAX)
  .catch(0)
  .default(0);

/**
 * A promo code as typed by a client. Bounds only — whether it means anything
 * is decided by `lib/intake/promo.ts`, in one place, on the server.
 */
export const promoCodeInput = z.string().trim().max(64).optional();

/**
 * Whether the pay action should attempt the admin test price. The env var
 * `ADMIN_TEST_PAYMENT` must also be true — this flag alone cannot change
 * what is charged.
 */
export const adminTestPaymentInput = z.boolean().optional().default(false);
