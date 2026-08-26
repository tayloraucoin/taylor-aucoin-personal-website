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
  // Step 1 — About you
  displayName: "Name as it appears on the site",
  whatYouDo: "What they do, in one line",
  roles: "Roles",
  leadRole: "The role that leads",
  howLong: "How long they have been doing this",
  basedIn: "Based in",
  unions: "Union or guild memberships",
  representation: "Representation",
  siteKinds: "Kind of site",
  disciplines: "Disciplines",
  disciplinesOther: "Other discipline",
  currentWebsite: "Current website",

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
  story: "The story",
  credits: "Credits worth listing",
  rights: "Allowed to show it",
  placement: "Where it belongs",
  reel: "The reel",
  topFive: "If they could only show five",
  organization: "How the work should be organized",
  organizationOther: "Other organisation",
  sayMore: "More on how the work should read",

  // Step 5 — Taste
  favourites: "Favourite example sites, best first",
  notes: "Notes on other example sites",
  siteKey: "Site",
  note: "Note",
  darkOrLight: "Dark or light",
  stillness: "How still it should be",
  density: "How much on screen at once",
  wordOne: "Feel word 1",
  wordTwo: "Feel word 2",
  wordThree: "Feel word 3",
  neverFeelLike: "Must never feel like",
  linksWorthALook: "Links worth a look",
  brainDump: "The brain dump",
  closeTab: "Makes them close a tab",
  inspiration: "Inspiration images",

  // Step 6 — Your words
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
  howToReach: "How people should reach them",
  showAvailability: "Show availability on the site",
  oldSiteSurvives: "What must survive from the old site",
  linksOutThere: "Links out in the world",

  // Step 9 — Accounts and access
  ownsDomain: "Owns a domain",
  domainName: "Domain",
  registrar: "Registrar",
  domainAccess: "Domain access preference",
  emailAtDomain: "Email at that domain",
  videoHosts: "Where the video lives",
  videoHostsOther: "Other video hosting",
  accounts: "Accounts around the web",
  currentPlatform: "Current site platform",
  handsOn: "How hands-on after launch",
  bestContactMethod: "Preferred contact method",
  anythingElse: "Anything else",

  // File field keys, so the document's Files section reads in words.
  voice_note: "Voice note",
  writing: "Writing samples",
  portrait: "Photo of them",
  behind_scenes: "Behind the scenes",
  laurels: "Laurels and award graphics",
  logo: "Logo or wordmark",
  brand_assets: "Anything else with their name on it",
};
