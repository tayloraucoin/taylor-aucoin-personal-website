/**
 * Human labels for every showcase answer key, for the intake document.
 *
 * Same job and same register as the durable track's `answer-labels.ts`: the
 * document reads in Taylor's voice about a client ("What they want more of")
 * while the form reads in the second person to the client ("What work do you
 * want more of?"). Converging them would mean one of the two registers losing.
 *
 * **A key missing here renders in the document as its raw key** —
 * `whatYouAreNot` instead of "What they are not" — which is the failure this
 * file exists to prevent. Adding a field means three files: the schema in
 * `lib/validators/showcase-intake.ts`, the input in its step component, and a
 * line here. PORT-8 sweeps for gaps before the document ships.
 */
export const SHOWCASE_ANSWER_LABELS: Record<string, string> = {
  // Step 1 — Everything you already have (PORT-18)
  dump: "Pasted for reading (everything)",
  links: "Links they asked us to read",

  // Step 2 — About you
  displayName: "Name as it appears on the site",
  whatYouDo: "What they do, in one line",
  roles: "Roles",
  leadRole: "The role that leads",
  howLong: "How long they have been doing this",
  basedIn: "Based in",
  /** @deprecated Kept so pre-2026-09-01 answers still read as words. */
  unions: "Union or guild memberships",
  credentials: "Memberships and credentials",
  affiliations: "Affiliations and partnerships",
  representation: "Representation",
  /**
   * Not `kind`: the project entry on step 4 already owns that key ("What kind
   * of thing it is"), and this label map is flat — one label per field key
   * across the whole track — so a second `kind` would silently relabel every
   * project. Not `siteKinds` either: that is the retired multi-select this
   * replaced, and it is still read for engagements that answered it.
   */
  siteKind: "What the site is for",
  /** @deprecated Kept so pre-2026-09-01 answers still read as words. */
  siteKinds: "Kind of site",
  /** @deprecated Kept so pre-2026-09-01 answers still read as words. */
  siteKindsOther: "Other kind of site",
  disciplines: "Disciplines",
  disciplinesOther: "Other discipline",
  currentWebsite: "Current website",
  stage: "Where it stands",
  stageDetail: "Where it stands, in their words",
  justYou: "Just them, or a team",
  showTeam: "Team on the site",
  businessPrimer: "Pasted for reading (the business)",
  lookingFor: "What they want out of this",
  peoplePaste: "Pasted for sorting (the team)",
  people: "The people",
  name: "Name",
  line: "One line about them",
  leadPerson: "Who leads",

  // Step 2 — Who this site is for
  audiences: "Who ends up on the site",
  audiencesOther: "Other audiences",
  whoMattersMost: "Who matters most",
  whatShouldTheyDo: "What each visitor should do next",
  wantMoreOf: "Work they want more of",
  stopAttracting: "Work they want to stop attracting",
  whyPickYou: "Why people pick them",
  whatYouAreNot: "What they are not",
  afterOneVisit: "The impression after one visit",

  // Step 3 — Experience and proof
  fastWay: "Pasted for sorting",
  experience: "Experience",
  what: "What it is",
  where: "Where",
  when: "When",
  about: "What to say about it",
  category: "Category",
  feature: "Feature this",
  awards: "Awards, grants, and festival selections",
  press: "Press",
  personProof: "Per-person links, awards, and press",
  personKey: "Whose this is",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
  site: "Their own site",
  otherLinks: "Anywhere else",
  kindWords: "Kind words",
  publishPermission: "Permission to publish kind words",
  notableNames: "Notable names",

  // Step 4 — The work
  projects: "Projects",
  title: "Title",
  year: "Year",
  role: "Their role on it",
  kind: "What kind of thing it is",
  forWhom: "Who it was for",
  watchUrl: "Where to watch",
  linkPassword: "Share password for the link",
  // `what` is already above, on the experience entry, and means the same thing
  // here — the map is flat by design and a key has one label across the form.
  videos: "Videos",
  url: "Link",
  password: "Share password for that link",
  primary: "Lead with this one",
  story: "The story",
  credits: "Credits worth listing",
  rights: "Allowed to show it",
  placement: "Where it belongs",
  // Both retired at PORT-19 and both still labelled: a stored answer keeps
  // printing, and a document that met a key with no label would print the key.
  reel: "The reel (retired question)",
  topFive: "If they could only show five (retired question)",
  topFivePicks: "If they could only show five",
  organization: "How the work should be organized",
  organizationOther: "Other organisation",
  sayMore: "More on how the work should read",

  // Step 4 — the kind-shaped entry arrays and the ask block (PORT-14 renders
  // these; the labels land here so the document never prints a raw key).
  offerings: "What they offer",
  pieces: "What they're building",
  services: "Services",
  format: "Format",
  scope: "Scope",
  pricePosture: "Price on the site",
  price: "Price",
  included: "What's included",
  duration: "How long it takes",
  takesLonger: "What makes it take longer",
  status: "Status",
  asks: "What they're asking people to do",
  ask: "The ask",
  getWhat: "What they get",
  number: "The number",
  mechanism: "How it happens",
  destination: "Where it lands",
  visibility: "Shown on the site",

  // Step 4 — the claims cluster. The three answers that stop a false claim
  // reaching a live site (D-PORT-10).
  signOff: "Who signs off on the words",
  cantSay: "What they can't say",
  requiredWording: "Required wording",

  // Step 6 — Taste
  picks: "Example sites they picked",
  score: "How close",
  siteKey: "Site",
  note: "Note",
  references: "Sites they found",
  styleBrief: "The style they described",
  wordOne: "Feel word 1",
  wordTwo: "Feel word 2",
  wordThree: "Feel word 3",
  neverFeelLike: "Must never feel like",
  brainDump: "The brain dump",
  inspiration: "Inspiration images",
  /* Legacy and retired taste keys. Labelled so a stored answer still prints as
     words; excluded from the done screen's skipped list by
     `RETIRED_TASTE_KEYS` below, because a client is not asked them any more. */
  favourites: "Favourite example sites, best first",
  notes: "Notes on other example sites",
  darkOrLight: "What the site sits on",
  stillness: "How still it should be",
  density: "How much on screen at once",
  linksWorthALook: "Links worth a look",
  closeTab: "Makes them close a tab",

  // Step 6 — Your words
  comeAcross: "How they want to come across",
  currentBio: "Current bio",
  keepMyWording: "Keep their wording",
  personVoice: "First or third person",
  writtenNotes: "Pasted writing",
  neverSay: "Words and phrases to avoid",
  recordingConsent: "Consent to record calls",

  // Step 7 — Media
  logoStatus: "Logo status",
  coloursYouLike: "Colours they are drawn to",
  dislikes: "Dislikes",

  // Step 8 — The site itself
  pages: "Pages they want",
  pagesOther: "Other pages",
  howSeparate: "How separate the different things should be",
  extraPagesPlan: "What the extra pages are for",
  howToReach: "How people should reach them",
  embedForm: "Needs a form embedded",
  embedFormLink: "The form's link",
  embedFormNotes: "Where the form goes, and what it's for",
  showAvailability: "Show availability on the site",
  availabilityDetail: "What the availability line should say",
  homeBrainDump: "What should be on the home page",
  homeMedia: "Shortlisted for home — files",
  homeVideos: "Shortlisted for home — videos",
  oldSiteSurvives: "What must survive from the old site",
  linksOutThere: "Links out in the world",

  // Step 9 — Accounts and access
  ownsDomain: "Owns a domain",
  domainName: "Domain",
  registrar: "Registrar",
  domainAccess: "Domain access preference",
  emailAtDomain: "Email at that domain",
  // Retired at PORT-19; labelled so a stored answer still prints.
  videoHosts: "Where the video lives (retired question)",
  videoHostsOther: "Other video hosting (retired question)",
  accounts: "Accounts around the web",
  currentPlatform: "Current site platform",
  handsOn: "How hands-on after launch",
  bestContactMethod: "Preferred contact method",
  tools: "Tools they already use",
  toolsDetail: "Which tools, and whose",
  toolsOther: "Anything else running",
  anythingElse: "Anything else",

  // Add-on questions, shown only to the clients who bought them.
  animationReferences: "Motion they liked",
  animationIntensity: "How much the motion announces itself",
  animationNever: "What must never move",
  logoFeeling: "What's wrong with the logo they have",
  logoExactWording: "Exact wording for the mark",
  logoWhere: "Where the mark has to work",
  logoDirections: "Marks they like, and why",
  supabaseWhatPersists: "What the site must remember",
  supabaseWhoLogsIn: "Who logs in, and what they see",
  supabaseExistingData: "Data that already exists",
  supabaseSensitivity: "How sensitive the data is",
  blogWhoWrites: "Who writes the posts",
  blogHowOften: "How often they'll post",
  blogTopics: "What they'd write about",
  blogExisting: "Posts to bring across",
  adminEditors: "Who needs a login",
  adminEditWhat: "What they want to change themselves",
  bookingWhat: "What can be booked, and how long",
  bookingCalendar: "Calendar they live in",
  bookingLeadTime: "Notice, and how far ahead",
  bookingPayment: "Whether they pay at booking",
  bookingPolicy: "Cancelling and rescheduling",

  // File field keys, so the document's Files section reads in words.
  ingest_documents: "Documents dropped on the everything step",
  ingest_links: "Pages fetched from the links they gave",
  voice_note: "Voice note",
  business_primer: "Documents dropped on the fast way",
  writing: "Writing samples",
  portrait: "Photo of them",
  behind_scenes: "Behind the scenes",
  laurels: "Laurels and award graphics",
  logo: "Logo or wordmark",
  brand_assets: "Anything else with their name on it",
  headshot: "Their photo",
  place: "The place",
  documents: "Documents",
};

/**
 * Taste keys the client is no longer asked, and must not be nagged about.
 *
 * Two classes, one behaviour. Five are questions the redesign retired
 * (D-PORT-20); two are PORT-7's answer shape, which `picksOf` now reads and
 * nothing writes. All seven stay in `stepTasteSchema` so stored answers survive
 * the shape guard, and all seven keep their labels above so the intake document
 * still prints them as words for the engagements that hold them.
 *
 * What this set buys is the done screen: `collectUnanswered` lists every empty
 * field as something to cover on the call, and without this every new client
 * would be told we still need to discuss "How still it should be" and their
 * "Favourite example sites, best first" — questions nobody asked them. Listing
 * a retired question as unanswered is the form apologising for its own history.
 *
 * Scoped to the showcase track's taste step where it is applied, so a durable
 * key that happens to share a name is untouched.
 */
export const RETIRED_TASTE_KEYS: ReadonlySet<string> = new Set([
  // Retired questions (D-PORT-20).
  "darkOrLight",
  "stillness",
  "density",
  "linksWorthALook",
  "closeTab",
  // PORT-7's shape, read by `picksOf` and never written.
  "favourites",
  "notes",
]);
