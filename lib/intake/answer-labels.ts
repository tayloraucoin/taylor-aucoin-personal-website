/**
 * Human labels for every answer key, for the intake document.
 *
 * The step components currently declare their own labels inline, so these are
 * a second statement of the same words. That is deliberate for now rather than
 * accidental: the document reads in Taylor's voice about a client ("What the
 * customer must provide") while the form reads in the second person to the
 * client ("What does the customer need to provide?"). Converging them would
 * mean one of the two registers losing.
 *
 * If they ever drift in *meaning* rather than register, this file is the one
 * to trust — it is what reaches the brand guide.
 */
export const ANSWER_LABELS: Record<string, string> = {
  // Step 1 — business identity
  businessName: "Customer-facing name",
  legalName: "Legal or registered name",
  logoName: "Name on the logo or signage",
  contactName: "Main contact",
  contactPhone: "Phone",
  contactEmail: "Email",
  whatYouDo: "What they do",
  howLong: "Years in business",
  businessNumber: "Business number",
  gstRegistered: "GST registered",
  insured: "Insured",
  insuranceType: "Insurance type",
  licences: "Licences and certifications",

  // Step 2 — pricing
  services: "Services",
  addOns: "Add-ons",
  extraCharges: "Extra charges",
  extraChargesOther: "Other extra charges",
  dontOffer: "Does not offer",
  minimumJob: "Minimum job size",
  paymentMethods: "Payment methods",
  paymentMethodsOther: "Other payment methods",
  whenTheyPay: "When customers pay",
  depositAmount: "Deposit amount",
  cancellationPolicy: "Cancellation policy",

  // Step 3 — operations
  whatYouBring: "What they bring",
  customerProvides: "What the customer must provide",
  customerProvidesOther: "Other customer requirements",
  whatMustBeTrue: "Conditions for accepting a job",
  whatMakesYouDecline: "Reasons to decline a job",
  areasCovered: "Areas covered",
  areasAvoided: "Areas avoided",
  furthestTravel: "Maximum travel",
  daysWorked: "Working days",
  typicalHours: "Typical hours",
  jobsPerDay: "Jobs per day",
  howFarAhead: "Booking lead time",
  shortestNotice: "Shortest notice accepted",
  badWeather: "Bad weather and off-season",
  replySpeed: "Response time",
  howCustomersBook: "How customers book now",
  howCustomersBookOther: "Other booking channels",

  // Step 4 — positioning
  idealCustomer: "Ideal customer",
  badFit: "Bad fit",
  whyPickYou: "Why customers choose them",
  whoYouLoseTo: "Who they lose work to",
  valueOne: "Value 1",
  valueTwo: "Value 2",
  valueThree: "Value 3",
  sellYourself: "One-sentence pitch",
  whatYouAreNot: "What they are not",

  // Step 5 — voice
  neverSay: "Words and phrases to avoid",
  writtenNotes: "Pasted writing",
  recordingConsent: "Consent to record the call",

  // Step 6 — photos
  logoStatus: "Logo status",
  coloursYouUse: "Existing colours",
  dislikes: "Dislikes",

  // Step 7 — reviews
  reviewSources: "Review sources",
  bestReviews: "Pasted reviews",
  publishPermission: "Permission to publish reviews",
  notableClients: "Notable clients",

  // Step 8 — team
  justYou: "Solo or team",
  headcount: "Headcount",
  showTeam: "Show team on the site",
  team: "Team members",
  yourBackground: "Owner background",

  // Step 9 — access
  ownsDomain: "Owns a domain",
  domainName: "Domain",
  registrar: "Registrar",
  emailAtDomain: "Email at that domain",
  googleBusinessProfile: "Google Business Profile",
  socials: "Social accounts",
  existingWebsite: "Existing website",
  existingWebsitePlatform: "Existing website platform",
  hasStripe: "Stripe account",
  bookingTool: "Booking tool",
  bestContactMethod: "Preferred contact method",
};

export function labelFor(key: string): string {
  return ANSWER_LABELS[key] ?? key;
}
