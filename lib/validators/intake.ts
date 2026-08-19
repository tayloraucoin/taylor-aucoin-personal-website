import { z } from "zod";
import { INTAKE_STEP_KEYS, type IntakeStepKey } from "@/lib/types/intake";

/**
 * Everything Taylor knows after the sales call, captured once so the client is
 * never asked for it again (D-INT-8).
 *
 * Shared deliberately: the CLI validates against this today and the admin
 * surface will validate against the same schema later. One home, so the two
 * cannot disagree about what an engagement needs.
 */
export const createEngagementInput = z
  .object({
    businessName: z.string().trim().min(1, "Business name is required"),
    contactName: z.string().trim().min(1, "Contact name is required"),
    contactEmail: z.email("A valid contact email is required"),
    contactPhone: z.string().trim().min(1).optional(),

    /** Renders verbatim on the pay screen — written for the client's eyes. */
    projectSummary: z.string().trim().min(1).optional(),

    currency: z.string().trim().length(3).default("cad"),
    depositRequired: z.boolean().default(true),
  });

// The deposit amount is deliberately absent. A standard build has a standard
// price, which lives in Stripe's catalogue (STRIPE_PRICE_DEPOSIT) rather than
// being retyped per client. `engagements.deposit_amount_cents` is now written
// at fulfillment as the record of what was actually charged.

export type CreateEngagementInput = z.infer<typeof createEngagementInput>;

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

/** The save action's input. The token is a credential, so it is never logged. */
export const saveStepInput = z.object({
  token: z.string().min(1),
  stepKey: intakeStepKeySchema,
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
  stepKey: intakeStepKeySchema,
  fieldKey: z.string().min(1).max(40),
  filename: z.string().min(1).max(255),
  mimeType: z.string().max(160).optional(),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
