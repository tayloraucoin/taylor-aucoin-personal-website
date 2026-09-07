/**
 * The coded track's copy packs: one per flavour, layered over a complete floor.
 *
 * Six packs, and `generic` is the only one that must be whole. Every other pack
 * is a partial that overrides the slots whose words genuinely differ and
 * inherits the rest, so a blank in Vesper's table is a fall-through rather than
 * an invitation to invent a sentence (M-PORT-22).
 *
 * **The word "flavour" means "pack".** It was named when there were two of
 * them and both were disciplines; it now spans consultants, studios, ventures,
 * and service businesses. Keeping the name was deliberate at PORT-11 — every
 * step component already takes a `flavour` prop and renaming them is churn with
 * no behaviour — and the debt is recorded in M-PORT-22 rather than hidden here.
 *
 * **Nothing imports this file except `showcase-steps.ts` and `tracks.ts`.**
 * Same law the step registry lives under, for the same reason: one home per
 * kind of fact, one resolver across tracks.
 *
 * ## Where these words come from
 *
 * Strings marked *(v2)* below are `docs/websites/portfolio-intake-questions-v2.md`,
 * **approved and verbatim**. They do not get improved, shortened, or
 * re-punctuated, and a paraphrase of one is a defect.
 *
 * Everything else is `docs/websites/CODED-INTAKE-KINDS-UX-SCOPE.md` §6 and is a
 * **draft pending Taylor's human-hand pass**, marked `[COPY — pending Taylor]`
 * at its definition so the pass has a grep target. That pass edits this one
 * file; it is why every kind-varying string in the track lives here rather than
 * in the nine components that render them.
 *
 * ## What belongs here
 *
 * A slot exists once two packs genuinely say different words, **or** once a new
 * string needs to reach Taylor's pass in one sitting. A string that reads the
 * same for a filmmaker and a foundation *and was already approved* stays with
 * the step that asks it, where there is nothing to resolve.
 *
 * The ask block and the claims cluster (kinds scope §5.3, §5.4) are the second
 * case: constant across every kind that renders them, but new, and the pass has
 * to reach them. PORT-12's note said they would live with PORT-14's components;
 * that would have split the pass across two files, so they are here instead.
 */

import type { RevealCondition } from "./reveal-condition";

/**
 * Which pack a client's answers earn.
 *
 * `film` and `generic` are the portfolio kind's two, chosen by discipline as
 * they always were. The other four are chosen by the engagement's kind and
 * never by a discipline (see `showcase-kinds.ts`).
 */
export const SHOWCASE_FLAVOURS = [
  "film",
  "generic",
  "practice",
  "entity",
  "venture",
  "service",
] as const;

export type ShowcaseFlavour = (typeof SHOWCASE_FLAVOURS)[number];

/** One option in a checkbox or radio group. The value is stored; the label is read. */
export type CopyChoice = { value: string; label: string };

/** A label and its one-line "why we're asking", which always travel together. */
export type CopyField = { label: string; help: string };

/**
 * One fork on the taste step, asked as a five-stop spectrum between two named
 * ends (D-PORT-29).
 *
 * **`id` is storage and outlives the copy.** Answers are keyed by it in
 * `taste.spectrums`, so it is chosen once and never renamed — the same contract
 * a gallery `siteKey` holds. Retiring a spectrum means deleting it from a pack;
 * the stored answer survives and still prints, because `spectrums` is an open
 * record rather than a closed enum (M-PORT — the D-PORT-20 keys learned this
 * the hard way).
 *
 * **The group is a placement fact, not part of the answer.** Two blocks render
 * on the step and they ask different kinds of question:
 *
 * - `structure` — what the site *does*. Rendered under the picks list and
 *   gated on the first pick, because these generalise from sites the client
 *   has just reacted to. Asked cold they are the radios D-PORT-20 retired.
 * - `feel` — what the site *feels like*. Ungated: the client is the only
 *   authority on these, so there is nothing to warm them up with. They sit
 *   above the three-words field, whose free-text half asks the same thing.
 *
 * The distinction that keeps a spectrum honest: **if the design pass would
 * overrule the client's answer, it was never their question.** Type scale,
 * whether words overlay media, and gutter treatment all fail that test and are
 * deliberately absent — see the scope's §13.
 *
 * `ends` are the two short names — "Cool" and "Warm". `means` is what each end
 * **translates into** for the build, one line apiece, and it is the half that
 * does the work: a client reading "Cool" guesses, and a client reading "Keeps
 * its distance. Still, spare, a little severe." knows.
 *
 * There is no per-stop copy. The track is continuous (1.0 to 7.0), so a value
 * has no words of its own — the number and the end it leans toward are the
 * readout, and the two `means` lines carry the meaning of the whole axis. This
 * replaced forty-five stop phrases with eighteen descriptors, which is both
 * less to write and less to keep true.
 *
 * Site keys were carried here briefly, to name two gallery examples per end.
 * They are gone (Taylor, 2026-09-07: clients "aren't paying that kind of
 * attention"), and their removal takes a coupling with them — copy no longer
 * depends on gallery content, so a site archived in `/admin/intake/examples`
 * can no longer change what a fork says.
 */
export type TasteSpectrum = {
  id: string;
  label: string;
  ends: { low: string; high: string };
  means: { low: string; high: string };
  group: "structure" | "feel";
};

/**
 * Every string that flexes between packs, or that needs Taylor's pass.
 *
 * **Option `value`s are stable storage keys and never change.** A label may be
 * rewritten in the pass; a value may not, because a client's stored answer
 * points at it. Values are deliberately shared across packs where the meaning
 * is the same (`press`, `contact`), so a kind change does not orphan an answer.
 */
export type ShowcaseCopyPack = {
  /* ── Start form and step 1 (kinds scope §6.1) ───────────────────────── */

  /** The kind picker's own question, and the line under it. */
  kindLabel: string;
  kindHelp: string;
  /** "What's it called?", asked of every kind but a portfolio. */
  entityNameLabel: string;
  entityNamePlaceholder: string;
  whatYouDoLabel: string;
  whatYouDoHelp: string;
  nameLabel: string;
  nameHelp: string;
  howLongLabel: string;
  representation: CopyField;
  /** The roster block (PORT-13). Constant across packs; here for the pass. */
  rosterLinePlaceholder: string;
  /** The roster's own paste-and-sort block (PORT-17). */
  rosterPaste: { intro: string; afterLine: string };
  /**
   * The ingestion step — step 1 since PORT-18 (2026-09-03).
   *
   * One screen, one job: give us everything you already have, once. Only
   * `what` flexes between packs (which documents a filmmaker, a consultant, a
   * studio, a venture, and a trade actually have); every other string is the
   * same for every kind and lives here so Taylor's copy pass is one file.
   * `title` and `intro` are what the step registry renders in the shell.
   *
   * `done.filled` carries a `{count}` token the component replaces. A string
   * with a hole in it is still one string the pass can read whole.
   */
  ingestion: {
    title: string;
    intro: string;
    /** What to paste, in the kind's own vocabulary. The one flexing line. */
    what: string;
    /** Go wide, not deep — steps 3 and 4 have boxes of their own. */
    ceiling: string;
    /** "Don't send media you want displayed", said as information. */
    media: CopyField;
    paste: CopyField & { placeholder: string };
    files: CopyField;
    /** The links box (PORT-21), and the honest ceiling under it. */
    links: CopyField & { placeholder: string };
    /**
     * What happened to each file and page, in the client's words.
     *
     * Every one of these is information rather than an error. A Keynote we
     * cannot open is not the client's mistake and not a fault in their file —
     * it is a thing Taylor reads instead, which is exactly what happened to
     * every attachment before this existed.
     */
    sources: {
      title: string;
      reading: string;
      read: string;
      unreadable: string;
      tooLarge: string;
      failed: string;
      retry: string;
      fetched: string;
      fetchFailed: string;
      omitted: string;
    };
    button: string;
    confirm: {
      title: string;
      body: string;
      proceed: string;
      back: string;
      /**
       * What the run is about to read, listed before they commit.
       *
       * A one-shot action has to show its inputs. A client who attached a deck
       * thirty seconds ago needs to see whether it is ready, because pressing
       * now is the difference between a run that used it and a run that did
       * not — and there is no second press.
       */
      reads: {
        title: string;
        paste: string;
        files: string;
        links: string;
        stillReading: string;
        none: string;
      };
    };
    running: { title: string; body: string };
    done: {
      title: string;
      filled: string;
      nothing: string;
      partial: string;
      /** Files that were still being read when the run went ahead. */
      notReady: string;
      again: string;
    };
    /**
     * One line per way a press can end badly.
     *
     * In the pack rather than in the component — where `ExtractionBlock` and
     * `PrimerBlock` keep theirs — because the build order promises Taylor's
     * copy pass is one file, and this step has more of these than any other
     * surface on the track. None of them is styled as an error and none of
     * them is the client's mistake.
     */
    failures: {
      nothingPasted: string;
      tooLarge: string;
      rateLimited: string;
      offline: string;
      link: string;
      failed: string;
      alreadyRan: string;
    };
  };
  rosterLead: CopyField;
  /** Shown under step 1's kind line whenever the picker is open (PORT-13). */
  kindChangeLine: string;

  /* ── Step 2 (kinds scope §6.2) ──────────────────────────────────────── */

  audienceIntro: string;
  audiences: readonly CopyChoice[];
  wantMoreOf: CopyField;
  stopAttracting: CopyField;
  whatYouAreNotHelp: string;
  afterOneVisitHelp: string;

  /* ── Step 3 (kinds scope §6.3) ──────────────────────────────────────── */

  experiencePasteIntro: string;
  experienceWhatPlaceholder: string;
  experienceWherePlaceholder: string;
  experienceCategoryPlaceholder: string;
  awards: CopyField;
  kindWordsHelp: string;

  /* ── Step 4 (kinds scope §6.4) ──────────────────────────────────────── */

  workTitle: string;
  workIntroLead: string;
  workIntroTail: string;
  workPasteIntro: string;
  workBlockLabel: string;
  workAddLabel: string;
  /**
   * The reel question — **retired at PORT-19 and rendered nowhere.**
   *
   * Taylor dropped it on 2026-09-03: it asked for the one video a stranger
   * should see first, on step 5, from a client who had not finished telling us
   * what they had, and it only ever had one slot. Two things replaced it — a
   * per-project "lead with this one" tick on the video itself, and step 9's
   * home shortlist, which asks the same question of the whole catalogue.
   *
   * The slots stay because Taylor's copy pass is a pass over this file and a
   * string deleted before he has read it is a decision made on his behalf. The
   * pass deletes them or repurposes them; nothing else should.
   *
   * (The v2 doc italicises one word in the film label — "Which piece is *the*
   * reel?" — and it is stored as plain text because a field label is a string,
   * not markup. Logged in `DEVIATIONS.md`.)
   */
  reelLabel: string;
  reelHelp: string;
  organizationOptions: readonly CopyChoice[];

  /**
   * Step 5's spectrums, or nothing (D-PORT-29).
   *
   * **Optional on purpose, and absent from `GENERIC`.** A pack with no set
   * renders no block — not an empty instrument, not a placeholder (D-PORT-12's
   * law, reused). Film is curated first because the research is film, and the
   * forks that separate film portfolios are not the ones that separate
   * consultants' sites; every other pack gets its own set written for it rather
   * than inheriting one that half-fits.
   *
   * Being absent from `GENERIC` also keeps it out of `SHOWCASE_COPY_SLOTS`,
   * which is the verifier's list of slots every pack must fill. That is
   * correct: this is a per-pack extra, not a floor.
   */
  tasteSpectrums?: readonly TasteSpectrum[];

  /* ── Steps 5 to 9 (kinds scope §6.5) ────────────────────────────────── */

  /**
   * Help for the ground-tone question on step 5. Named for its field key,
   * which is still `darkOrLight` — the question widened from two options to a
   * scale (2026-09-03) but the stored key did not move, because renaming it
   * would orphan every answer already given.
   */
  darkOrLightHelp: string;
  voiceNotePrompt: string;
  /**
   * The person-voice example on step 6, in the pieces English needs.
   *
   * `personSubject` is "I" or "We"; `personVerb` follows it and also follows
   * "They" when we have no name yet; `personVerbThird` follows a name. All
   * three are stored rather than derived, because appending an "s" is right for
   * "direct" and wrong for "do".
   */
  personSubject: string;
  personVerb: string;
  personVerbThird: string;
  bioHelp: string;
  writingHelp: string;
  /** Step 7's replacement for "A photo of you" on the roster kinds. */
  place: CopyField;
  behindScenesHelp: string;
  /** Step 7's laurels slot, which is not laurels for an organisation. */
  logos: CopyField;
  documents: CopyField;
  logoHelp: string;
  pages: readonly CopyChoice[];
  howSeparateHelp: string;
  /** Appended to the base four on step 8 for the non-portfolio kinds. */
  reachExtraOptions: readonly CopyChoice[];
  availability: CopyField;
  /** Step 9's replacement for the video-host question on non-portfolio kinds. */
  tools: CopyField & {
    options: readonly CopyChoice[];
    detail: CopyField;
    /**
     * The box for what the checklist does not name. A fixed list of eight is a
     * guess about a stack, and the tool nobody thought to list is exactly the
     * one that turns out to be load-bearing at launch (Taylor, 2026-09-03).
     */
    other: CopyField;
  };
  accountsHelp: string;

  /* ── Step 4's ask block and claims cluster (kinds scope §5.3, §5.4) ─── */

  /**
   * These do not flex between packs — every kind that renders them says the
   * same words. They live here anyway, because the other half of this file's
   * job is that Taylor's copy pass edits **one** file, and these are new
   * strings that have never had his read.
   */
  /**
   * What each add-on asks, keyed by the extras vocabulary in
   * `server/services/products.ts`. Non-flexing, in the pack for the same
   * reason `ask` and `claims` are.
   */
  upsells: Readonly<Record<UpsellExtra, UpsellBlock>>;

  /**
   * Step 3's per-person block, rendered for the kinds that have a roster.
   *
   * Like `ask` and `claims`, these do not flex between packs — every kind that
   * renders them says the same words. They live here for the same reason those
   * do: Taylor's copy pass edits one file, and these are new strings that have
   * never had his read.
   */
  personProof: {
    intro: string;
    linksLabel: string;
    linksHelp: string;
    awardsLabel: string;
    pressLabel: string;
    sharedLabel: string;
    sharedHelp: string;
    noRoster: string;
  };

  ask: {
    blockLabel: string;
    blockHelp: string;
    addLabel: string;
    /** Label-only: the options are the explanation, so there is no help line. */
    askField: { label: string; options: readonly CopyChoice[] };
    forWhomLabel: string;
    forWhomPlaceholder: string;
    getWhat: CopyField;
    number: CopyField;
    mechanism: { label: string; options: readonly CopyChoice[] };
    destination: CopyField;
    visibility: { label: string; options: readonly CopyChoice[] };
  };

  /**
   * The track's one ink treatment (D-PORT-10). Its intro renders at full ink
   * because it is the cluster that stops a false claim reaching a live site —
   * the same reason the durable track grants ink to "How you work".
   *
   * No word here is "legal", "compliance", "liability", or "risk". A founder in
   * fundraising mode should read this and feel looked after, not audited.
   */
  claims: {
    mono: string;
    intro: string;
    signOff: CopyField;
    cantSay: CopyField;
    requiredWording: CopyField;
  };

  /* ── Additive suffixes ──────────────────────────────────────────────── */

  /**
   * Appended to an existing help line rather than replacing it. Absent on the
   * packs that add nothing, which is why these are the only optional slots:
   * an empty string would be a value, and a value is a thing a pass has to
   * read past.
   */
  basedInHelpSuffix?: string;
  notableNamesHelpSuffix?: string;
  voiceNoteSkipSuffix?: string;
  reachHelpSuffix?: string;

  /**
   * Step 1's venture-only question, which replaces "how long".
   *
   * `detail` is the box under the options. Four radio buttons are the right
   * shape for the *fact* and a terrible shape for the *story*: "Raising, not
   * yet built" is true of a napkin sketch and of a company with a signed term
   * sheet, and the site reads completely differently for each. The options
   * sort; the box is where the sorting gets its meaning (Taylor, 2026-09-03).
   */
  stage?: CopyField & {
    options: readonly CopyChoice[];
    detail: CopyField;
  };
};

/**
 * One question inside an add-on's block.
 *
 * `key` is the answer key it stores under and must exist in that step's
 * schema. The three shapes cover everything these blocks ask: a line, a box,
 * and a choice.
 */
export type UpsellField = CopyField & {
  key: string;
  /** A textarea rather than a single line. */
  long?: boolean;
  options?: readonly CopyChoice[];
  multiple?: boolean;
  /**
   * A follow-up inside the block, opened by another of the block's own fields.
   *
   * The same vocabulary every other reveal on the form uses, so a question
   * nested one level deeper is not a second mechanism to learn. An `extra`
   * condition would be meaningless here: the block itself is already gated on
   * the purchase, so nothing inside it can be reached without one.
   */
  dependsOn?: RevealCondition;
};

/**
 * The questions an add-on earns, and the callout that frames them.
 *
 * These render only for a client who bought the thing — `Reveal`'s `extra`
 * condition, resolved from what was actually paid for, never from an answer.
 * Until 2026-09-03 the coded track had none of these at all: six add-ons were
 * sold at checkout and the questionnaire asked about none of them.
 *
 * `body` is the callout: what the add-on is, and what it needs from the client
 * that nothing else on the form will get. It is not a sales line — they have
 * already bought it.
 */
export type UpsellBlock = {
  eyebrow: string;
  body: string;
  fields: readonly UpsellField[];
};

/**
 * The add-ons whose purchase opens questions, in the extras vocabulary
 * `PRODUCT_KEY_TO_EXTRA` maps catalogue keys onto.
 *
 * Extra pages are not here: they are a count, not a yes, and step 8 reads the
 * number rather than a flag.
 */
export type UpsellExtra =
  "adminPanel" | "logo" | "booking" | "animations" | "supabase" | "seoBlog";

/**
 * Every add-on's questions, written once.
 *
 * They do not flex between packs — a venture buying an admin panel and a
 * filmmaker buying one are buying the same thing and get asked the same
 * things — so they are a constant the packs share by reference rather than six
 * copies that could drift apart.
 *
 * Each block's `body` assumes the client has already paid. None of them sells,
 * none of them congratulates, and none of them explains the price. They say
 * what happens next and what is needed from the person reading.
 */
const UPSELLS: Readonly<Record<UpsellExtra, UpsellBlock>> = {
  adminPanel: {
    eyebrow: "Admin panel · your own login",
    body: "A private login where you change copy and swap images yourself, no code involved. What it covers is decided by what you tell us here — anything you say you want to change yourself gets wired to be editable, and everything else stays fixed so it cannot be broken by accident.",
    fields: [
      {
        key: "adminEditors",
        label: "Who needs a login?",
        help: "Names, and the email address each should use. Everyone gets the same access — there are no roles or permissions in this, and if you need those, say so and we'll talk.",
        long: true,
      },
      {
        key: "adminEditWhat",
        label: "What do you want to change yourself?",
        help: "Be greedy here — it is far cheaper to make something editable now than to add it later. Project entries, the bio, hero images, availability, prices, a news line.",
        long: true,
      },
    ],
  },

  logo: {
    eyebrow: "Logo refresh · two rounds",
    body: "A refreshed mark built from what you already have, in two rounds: a board of directions, then the finished version in the files you actually need. Everything below is what the board gets built from, so an hour spent here is worth more than any amount of feedback later.",
    fields: [
      /**
       * Relabelled 2026-09-07. It asked what was wrong with the mark they have,
       * and a client who answered "no" to `logoStatus` and bought the refresh
       * anyway — which the catalogue copy invites, "for when you want the mark
       * anyway" — has no mark to fault. The file drop is correctly closed for
       * them too, so the old wording opened the block on a question they could
       * only skip.
       */
      {
        key: "logoFeeling",
        label: "Where are you starting from?",
        help: 'If you\'ve got a mark, plain words about what\'s wrong with it are exactly right: "too thin", "wrong green", "looks like a tech company", "my nephew made it in 2011". If you haven\'t got one, say so and tell us what you\'ve been using instead.',
        long: true,
      },
      {
        key: "logoExactWording",
        label: "The exact wording, spelled exactly right",
        help: 'Including capitals, ampersands, accents, and whether "Ltd" or "Studio" is part of the mark or not. This is the single most expensive thing to get wrong.',
      },
      {
        key: "logoWhere",
        label: "Where does it have to work?",
        help: "Each one changes what the mark can be. A logo that has to survive being embroidered is a different logo from one that only ever sits in a browser tab.",
        multiple: true,
        options: [
          { value: "site", label: "The website" },
          { value: "favicon", label: "A browser tab / app icon" },
          { value: "social", label: "Social avatars" },
          { value: "print", label: "Print — cards, letterhead, posters" },
          { value: "signage", label: "Signage or vehicle wraps" },
          { value: "merch", label: "Merch — embroidery, screen print" },
          { value: "video", label: "Video slates or end cards" },
        ],
      },
      /**
       * What survives and what is off the table. Neither branch of the block
       * asked it: `logoDirections` collects marks they admire and `logoWhere`
       * collects usage, and a colour someone already owns is neither.
       * `coloursYouLike` on the taste step is about the site, not the mark.
       */
      {
        key: "logoConstraints",
        label: "Anything the mark has to keep, or has to avoid?",
        help: "A colour you own, a symbol people already recognise, a word that has to sit alongside it. Worth naming anything you'd hate to end up with, too.",
        long: true,
      },
      {
        key: "logoDirections",
        label: "Marks you like, and why",
        help: 'Anyone\'s — other industries welcome, and often more useful. Say what you like about each one; "this one" on its own tells us less than "the way this one is just the letters".',
        long: true,
      },
    ],
  },

  booking: {
    eyebrow: "Booking · one shared calendar",
    body: "Booking on your own site, wired to the calendar you already live in. This is one calendar for one operation: people pick a service, a date, and a time. They cannot pick a specific person, and nothing auto-assigns. If you need either of those, tell us here rather than at launch.",
    fields: [
      {
        key: "bookingWhat",
        label: "What can people book, and how long does each take?",
        help: "One per line, with its length. Leave off anything you would rather quote before committing to a time — those stay an email.",
        long: true,
      },
      {
        key: "bookingCalendar",
        label: "What calendar do you live in?",
        help: "Google Calendar syncs automatically. Apple, Outlook, or nothing at all — say so anyway and we'll set your hours by hand instead.",
      },
      /**
       * The hours themselves, which nothing on this form asked for until
       * 2026-09-07. The question above promises to set them by hand for anyone
       * off Google Calendar, and there was no answer to set them from.
       *
       * The durable track collects this on its operations step
       * (`daysWorked`, `typicalHours`, `jobsPerDay`, `howFarAhead`). The coded
       * track has no such step, so its booking block carries the same facts or
       * nobody has them. Timezone rides along in the help rather than as a
       * field of its own: it is one word, and it is the word people forget.
       */
      {
        key: "bookingHours",
        label: "When are you bookable?",
        help: "Days and hours, and the timezone they're in. If you need gaps between bookings, or a cap on how many you'll take in a day, say that here too.",
        long: true,
      },
      /**
       * What the confirmation carries: an address, or a video link the booking
       * generates. Nothing else on the form distinguishes those, and finding
       * out at launch means rebuilding the confirmation.
       */
      {
        key: "bookingWhere",
        label: "Where do these happen?",
        help: "This decides what the confirmation email holds. Tick everything that applies.",
        multiple: true,
        options: [
          { value: "video", label: "Video call" },
          { value: "phone", label: "Phone" },
          { value: "inPerson", label: "In person, at your place" },
          { value: "travel", label: "In person, you travel to them" },
        ],
      },
      {
        key: "bookingLeadTime",
        label: "How much notice, and how far ahead?",
        help: 'The soonest someone can book you ("not today", "24 hours") and the furthest out ("three months").',
      },
      {
        key: "bookingPayment",
        label: "Do they pay when they book?",
        help: "Taking money at the booking cuts no-shows hard. It also needs a payments account, so say if you don't have one.",
        options: [
          { value: "full", label: "Yes — pay in full to book" },
          { value: "deposit", label: "A deposit to hold the slot" },
          { value: "no", label: "No — invoice or pay after" },
          { value: "unsure", label: "Not sure — let's talk" },
        ],
      },
      /**
       * Opens on the two answers that turn a booking page into a payments
       * build. There is no coded Stripe add-on in the catalogue — the durable
       * track has `stripe_setup` and this one has nothing — so the help says
       * plainly that the money half is quoted on its own. It states a fact and
       * stops: no price, no total, and nothing on this surface can charge
       * anyone (M-PORT-4).
       */
      {
        key: "bookingPaymentDetail",
        label: "What gets charged, and have you got a Stripe account?",
        help: "The amount for each thing on your list, or the deposit if it's a deposit. Taking money at the booking is quoted on its own, and we'll agree it with you before anything gets built.",
        long: true,
        dependsOn: { field: "bookingPayment", in: ["full", "deposit"] },
      },
      {
        key: "bookingCollect",
        label: "What should someone tell you when they book?",
        help: "Name and email come as standard. This is anything past that: what they want to work on, a budget, where they heard about you.",
        long: true,
      },
      {
        key: "bookingPolicy",
        label: "Cancelling and rescheduling",
        help: "What you want the confirmation email to say. If you don't have a policy, say that — most people don't until the first person cancels an hour before.",
        long: true,
      },
    ],
  },

  animations: {
    eyebrow: "Animations · what moves, and how much",
    // The body no longer restates the confirmation card that always sits
    // directly above it (`MotionNotice`, §11.2) — the two were ending on the
    // same sentence, in two stacked callouts. It also dropped a reference to
    // the stillness question, retired with the taste step at D-PORT-20; the
    // scope flagged that clause for editing and this is the edit.
    body: "Motion gets built into the site from the start. What's covered here is standard motion. If what you describe below turns out to be bigger than that, we'll talk before anything changes.",
    fields: [
      {
        key: "animationReferences",
        label: "Motion you've seen and liked",
        help: 'Links, and the moment on each one you mean — "the way the images settle when you land" beats a bare URL. Anything counts: sites, apps, title sequences, a game menu.',
        long: true,
      },
      {
        key: "animationIntensity",
        label: "How much should it announce itself?",
        help: "There is no wrong answer, but there is a wrong answer for your audience — a funder skimming on a train and a director watching a reel want opposite things.",
        options: [
          {
            value: "barely",
            label: "Barely — it should feel smooth, not animated",
          },
          {
            value: "arrival",
            label: "Noticeable on arrival, then it settles down",
          },
          {
            value: "throughout",
            label: "Throughout — motion is part of the personality",
          },
          {
            value: "showpiece",
            label: "One showpiece moment, quiet everywhere else",
          },
        ],
      },
      /**
       * The showpiece option named a thing and then never asked what it was.
       * One moment is the whole deliverable for that answer, so it is the one
       * question that cannot be left to the call.
       */
      {
        key: "animationShowpiece",
        label: "Which moment?",
        help: "Where it should land and what it does. The thing that loads first, a project opening up, a name that draws itself.",
        long: true,
        dependsOn: { field: "animationIntensity", equals: "showpiece" },
      },
      {
        key: "animationNever",
        label: "What must never move?",
        help: "Text people have to read, your logo, a specific image, anything on the contact page. Also worth saying if motion makes you or anyone you know queasy — the site respects the system-level reduced-motion setting either way.",
        long: true,
      },
    ],
  },

  supabase: {
    eyebrow: "Database · what the site remembers",
    body: "A database behind the site, for anything that has to survive past the page load. Everything below shapes what gets built, and the last question shapes how carefully — a list of newsletter emails and a list of applicants' personal details are not the same job.",
    fields: [
      {
        key: "supabaseWhatPersists",
        label: "What does the site need to remember?",
        help: "Form entries, applications, saved lists, bookings, uploads, a members' directory. Describe it the way you'd describe it to a person, not the way you'd describe it to a computer.",
        long: true,
      },
      {
        key: "supabaseWhoLogsIn",
        label: "Who logs in, and what do they see that others don't?",
        help: "If nobody logs in, say so — that is a much simpler build and worth knowing early.",
        long: true,
      },
      {
        key: "supabaseExistingData",
        label: "Is there data that already exists somewhere?",
        help: "A spreadsheet, a Mailchimp list, another site's database, a filing cabinet. Where it lives and roughly how much of it.",
        long: true,
      },
      {
        key: "supabaseSensitivity",
        label: "How sensitive is what it holds?",
        help: "This changes how it is built, not whether it gets built. Getting it wrong in the optimistic direction is the expensive way round.",
        options: [
          { value: "public", label: "Not sensitive — it could be public" },
          { value: "contact", label: "Names and contact details" },
          {
            value: "personal",
            label: "Personal details people expect kept private",
          },
          {
            value: "regulated",
            label: "Health, financial, or anything regulated",
          },
        ],
      },
    ],
  },

  seoBlog: {
    eyebrow: "Blog · built in, with its own admin",
    body: "A blog section with an admin for publishing without touching code. The build is the easy half; the half that decides whether it works is whether posts actually get written, so the first question is the honest one.",
    fields: [
      {
        key: "blogWhoWrites",
        label: "Who's actually going to write these?",
        help: "A blog nobody writes is worse than no blog — an empty section with a two-year-old post reads as an abandoned business. There is no wrong answer here, only an unrealistic one.",
        options: [
          { value: "me", label: "Me" },
          { value: "team", label: "Someone on the team" },
          { value: "taylor", label: "I'd rather buy posts written for me" },
          { value: "unsure", label: "Honestly, not sure yet" },
        ],
      },
      {
        key: "blogHowOften",
        label: "How often, realistically?",
        help: 'Monthly beats weekly-for-six-weeks-then-never. "A few times a year" is a real answer.',
      },
      {
        key: "blogTopics",
        label: "What would you write about?",
        help: "Topics, and the phrases you'd want someone to be typing into Google when they find you. The questions customers ask you over and over are usually the best posts you'll ever write.",
        long: true,
      },
      {
        key: "blogExisting",
        label: "Anything already written to bring across?",
        help: "Posts on an old site, a newsletter archive, LinkedIn articles. Links or a paste — and say if the old URLs need to keep working.",
        long: true,
      },
    ],
  },
} as const;

/**
 * The floor. Complete by type, and correct on its own for any client whose
 * pack has nothing to say.
 *
 * Every *(v2)* string here is approved copy carried across unchanged from the
 * components that used to hold it. Everything else is `[COPY — pending Taylor]`.
 */
const GENERIC: ShowcaseCopyPack = {
  // [COPY — pending Taylor]
  kindLabel: "What is this site for?",
  // [COPY — pending Taylor]
  kindHelp:
    "Pick the one that leads. If you're a mix, the questions inside have room for the rest.",
  // [COPY — pending Taylor]
  entityNameLabel: "What's it called?",
  // [COPY — pending Taylor] — the floor rather than blank, because the "Something
  // else" kind resolves to this pack and is asked the question.
  entityNamePlaceholder:
    "Holistica, or Northshore Physio, or whatever's on the door.",
  whatYouDoLabel: "What you do, in one line", // (v2)
  whatYouDoHelp:
    'The line that sits under your name. "Founder / Product Designer" counts. So does "Ceramicist, mostly commissions" or "I run a two-person studio in Halifax." We\'ll sharpen it together.', // (v2)
  nameLabel: "Your name, as it should appear on the site", // (v2)
  nameHelp: "If you go by something different professionally, use that.", // (v2)
  howLongLabel: "How long you've been doing this", // (v2)
  representation: {
    label: "Representation", // (v2)
    help: "Agent, manager, or rep — who they are, and whether enquiries should go through them.", // (v2)
  },
  // [COPY — pending Taylor]
  rosterLinePlaceholder: "What they're best at, in a sentence",
  // [COPY — pending Taylor]
  rosterPaste: {
    intro:
      "Paste the team page, the deck's team slide, or a few LinkedIn headers. We'll sort out names and roles; you fix what we got wrong.",
    afterLine:
      "People appear below. Fix anything we got wrong — nothing saves as fact until you've seen it.",
  },
  rosterLead: {
    // [COPY — pending Taylor]
    label: "Who leads?",
    help: "Whose name goes first, and whose story the About page opens with.",
  },
  // [COPY — pending Taylor] — every string in this block.
  ingestion: {
    title: "Everything you already have",
    intro:
      "One job on this screen: give us everything you already have, once. We read it and fill in as much of the rest of this form as it honestly supports — so the steps ahead open mostly answered, and you correct instead of compose.",
    what: "An old About page, an artist statement, a bio from a programme or a festival, the text off your current site, a CV, an email where you put it well. Paste it all in one go — don't tidy it.",
    ceiling:
      "Go wide, not deep. Your work history and the individual pieces each get a box of their own later, with the same trick — so a line or two on each is plenty here.",
    media: {
      label: "Words now, pictures later",
      help: "Photos, video, logos, and anything you want on the site itself come later, in the steps that place them. This step reads text.",
    },
    paste: {
      label: "Paste it all here",
      help: "One big messy paste is perfect. It saves as you type.",
      placeholder: "Paste it all here — don't tidy it.",
    },
    files: {
      label: "Or send the files themselves",
      help: "A deck, a PDF, a doc, a scan — anything too long to paste. We read what we can and store all of it either way, and Taylor reads what we can't.",
    },
    links: {
      label: "Pages worth reading",
      help: "One per line. Your old site, an interview, a festival page, a profile. We read the page itself; we don't follow anything on it. Anything behind a login — Instagram, LinkedIn, a private drive — can't be read from outside, so paste what it says instead.",
      placeholder: "https://your-old-site.com",
    },
    sources: {
      title: "What we've got so far",
      reading: "Reading it…",
      read: "Read",
      unreadable:
        "We can't read this kind of file — it's stored, and Taylor reads it himself.",
      tooLarge:
        "Too big for us to read through — it's stored, and Taylor reads it himself.",
      failed: "That one didn't read.",
      retry: "Try reading it again",
      fetched: "Read",
      fetchFailed:
        "Couldn't open that page from outside. Paste what it says instead, if it matters.",
      omitted:
        "Left out of the read — there was too much altogether. Taylor still has it.",
    },
    button: "Read it all",
    confirm: {
      title: "Ready to run this?",
      body: "This runs once. It reads everything above and fills in what it can across the steps ahead; anything it can't find, you type as you go. If there's more to add, add it first — there's no second pass.",
      proceed: "Yes, read it",
      back: "Not yet",
      reads: {
        title: "What we'll read",
        paste: "What you pasted",
        files: "Files we've read",
        links: "Links",
        stillReading:
          "Still being read — wait a moment if you want these included",
        none: "Nothing to read yet",
      },
    },
    running: {
      title: "Reading it through",
      body: "Usually under a minute. A big paste can take a few. You can close this tab — if it finishes while you're gone, the form will be filled in when you come back.",
    },
    done: {
      title: "Read.",
      filled:
        "Filled in {count} answers across the steps ahead. Each one is marked until you've touched it, and the sentence it came from is a tap away.",
      nothing:
        "Nothing in there we could turn into an answer — no harm done. Everything you pasted is kept, and Taylor reads it. Carry on.",
      partial:
        "Some of it landed and some didn't; the steps that filled in say so. Everything you pasted is kept, and Taylor reads it.",
      notReady:
        "These weren't finished being read in time, so they weren't used — Taylor still has them:",
      again:
        "This step has run and won't run again. Anything you'd add now goes into the steps themselves — and Taylor reads all of it.",
    },
    failures: {
      nothingPasted:
        "Nothing to read yet — paste something in first, or carry on and answer the questions yourself.",
      tooLarge:
        "That's more than we can read in one go. Paste the part that explains you best and send the rest as files — Taylor reads those either way.",
      rateLimited:
        "Give it a minute and try again. Everything you pasted is safe.",
      offline:
        "You're offline right now. Everything you've pasted is saved on this device — try again once you're back.",
      link: "That link stopped working. Everything you pasted is still here.",
      failed:
        "That didn't work, and nothing was written. Everything you pasted is safe — try again, or carry on and answer the questions yourself. Taylor reads what you sent regardless.",
      alreadyRan:
        "This step has already run. Refresh to see what it filled in.",
    },
  },
  // [COPY — pending Taylor]
  kindChangeLine:
    "Changing this changes the questions, not your answers. Anything you've written stays.",

  audienceIntro:
    "This site isn't for you — it's for the person deciding whether to work with you. This step is about who that is.", // (v2)
  audiences: [
    // (v2 list)
    { value: "producers", label: "Producers or production companies" },
    { value: "agencies", label: "Agencies or brands" },
    { value: "direct", label: "Direct clients" },
    { value: "festivals", label: "Festivals or programmers" },
    { value: "students", label: "Students or their parents" },
    { value: "press", label: "Press" },
    { value: "recruiters", label: "Recruiters or employers" },
    { value: "peers", label: "Other people in my field" },
    { value: "investors", label: "Investors" },
    { value: "collaborators", label: "Prospective collaborators" },
  ],
  wantMoreOf: {
    label: "What work do you want more of?", // (v2)
    help: "The site's job is shaping what comes next, not cataloguing what came before. What do you want the phone ringing about?", // (v2)
  },
  stopAttracting: {
    label: "What do you want to stop attracting?", // (v2)
    help: "Work you'd rather age out of — even if it pays.", // (v2)
  },
  whatYouAreNotHelp:
    '"I\'m not the cheap option" or "I\'m not a corporate video guy" — whatever\'s true.', // (v2)
  afterOneVisitHelp:
    'The impression, in your own words. "Someone you\'d trust with a crew" reads differently from "someone who makes strange, beautiful things" — both are good answers.', // (v2)

  experiencePasteIntro:
    "Paste everything — your LinkedIn, your old site's about page, your CV, your IMDb bio. One big messy blob is perfect.", // (v2)
  experienceWhatPlaceholder: "Instructor — Film Production", // (v2)
  experienceWherePlaceholder: "LaSalle College", // (v2)
  experienceCategoryPlaceholder: "Teaching, directing, community…", // (v2)
  awards: {
    label: "Awards, grants, and festival selections", // (v2)
    help: "Every prize, nomination, grant, and official selection you can remember — festival names and years included. Festivals hand out laurel graphics for these; there's a spot for the files in the media step.", // (v2)
  },
  kindWordsHelp:
    "Things clients, collaborators, or students have said about working with you — paste from emails or texts. One or two is plenty.", // (v2)

  workTitle: "The work", // (v2)
  workIntroLead:
    "Now the work itself — the pieces the last step's career produced.", // (v2)
  workIntroTail:
    "Add as many as you want; there's no cap. Don't aim for polished — aim for honest, and lead with what you'd show first.", // (v2)
  workPasteIntro:
    "Same trick as the last step — paste your filmography, credit list, IMDb page, or the projects off your old site, and hit the button.", // (v2)
  workBlockLabel: "Your projects", // (v2)
  workAddLabel: "Add another project", // (v2)
  reelLabel: "Which piece leads?", // (v2)
  reelHelp: "The one thing a stranger should see first.", // (v2)
  organizationOptions: [
    // (v2 list)
    { value: "role", label: "By role — directing, camera, editing" },
    { value: "type", label: "By type — films, commercials, music videos" },
    { value: "grid", label: "One curated grid, no filters" },
    { value: "audience", label: "By who it's for" },
    { value: "trust", label: "You decide — I trust the design" },
    { value: "other", label: "Something else" },
  ],

  // [COPY — pending Taylor] — replaces the film line, which every non-film
  // client used to read ("Most film sites run dark so the footage glows").
  darkOrLightHelp:
    "The ground everything else is built on — type, photography, and how loud the whole thing feels all follow from it. Sites like this work anywhere on the scale, so go with what you'd want to open at night.",
  voiceNotePrompt:
    "Record a voice memo on your phone answering two things: how did you get into this, and what's a piece of work you're proud of — and why? Two or three minutes is the floor, not the ceiling — if there's more in you, take up to half an hour and really tell us. Somewhere between an enthusiastic ramble and a talk you've given a hundred times is exactly the register. Don't script it. This is the single most useful thing you can give us.", // [COPY — pending Taylor] — was v2 verbatim until the ceiling was raised (Taylor, 2026-09-03)
  personSubject: "I",
  personVerb: "make",
  personVerbThird: "makes",
  bioHelp:
    "Paste whatever exists — old site, festival program, LinkedIn. All versions welcome.", // (v2)
  writingHelp:
    "Artist statements, director's notes, grant applications, captions — anything in your own words.", // (v2)
  place: {
    // [COPY — pending Taylor]
    label: "The place",
    help: "The studio, the property, the shop, the room where it happens. Wide shots and details both.",
  },
  behindScenesHelp:
    "You on set, behind a camera, teaching. This is where the site gets its humanity.", // (v2)
  logos: {
    label: "Laurels and award graphics", // (v2)
    help: "Festivals send these as PNGs. Whatever you've got.", // (v2)
  },
  documents: {
    // [COPY — pending Taylor] — the second sentence is a promise and is
    // load-bearing; PORT-15 renders it wherever a document is accepted.
    label: "Documents worth having",
    help: "A deck, a one-pager, floor plans, renders, a menu, a price sheet, a brochure. We read them to understand the thing; nothing from them goes on the site unless you say so.",
  },
  logoHelp:
    "Most sites like this don't need a logo — a well-set name usually does it better.", // (v2)
  pages: [
    // (v2 list)
    { value: "home", label: "Home" },
    { value: "work", label: "Work / projects" },
    { value: "reel", label: "A reel page" },
    { value: "about", label: "About" },
    { value: "contact", label: "Contact" },
    { value: "teaching", label: "A page for teaching or services" },
    { value: "press", label: "Press / news" },
  ],
  howSeparateHelp:
    "A producer looking at your reel and a parent looking at your film camp want different things. Different pages? Different sections? Or does one of them belong on a separate site entirely?", // (v2)
  reachExtraOptions: [
    // [COPY — pending Taylor] — appended to the v2 four for non-portfolio kinds.
    { value: "application", label: "An application form" },
    { value: "requestDoc", label: "A request-a-document form" },
    { value: "bookingLink", label: "A booking link" },
  ],
  availability: {
    label: "Should the site say whether you're available?", // (v2)
    help: '"Booking for fall 2026" can prompt the email. It also needs updating — only say yes if you\'ll actually update it.', // (v2)
  },
  tools: {
    // [COPY — pending Taylor] — the "whose account" clause is the whole point:
    // a founder's personal Instagram is a different asset from the org's.
    label: "Tools you already use",
    help: "Check anything that's already running. We'd rather join what exists than replace it.",
    options: [
      { value: "emailList", label: "An email list (Mailchimp, ConvertKit…)" },
      { value: "booking", label: "Booking (Cal.com, Calendly…)" },
      { value: "payments", label: "Payments (Stripe, Square…)" },
      { value: "forms", label: "A form tool" },
      { value: "analytics", label: "Analytics" },
      { value: "crm", label: "A CRM" },
      { value: "video", label: "Vimeo or YouTube" },
      { value: "none", label: "None of these" },
    ],
    detail: {
      label: "Which ones, and whose account?",
      help: "Name the tool and say whether it's the organisation's account or somebody's personal one. Invites go to hello@tayloraucoin.com.",
    },
    // [COPY — pending Taylor]
    other: {
      label: "Anything else running?",
      help: "Whatever the list above missed — a help desk, a members area, an inventory system, something built in-house. If the site will have to live next to it, name it.",
    },
  },
  accountsHelp: "Wherever your work already lives — people will look.", // (v2)

  // [COPY — pending Taylor] — every string in `upsells`.
  upsells: UPSELLS,

  // [COPY — pending Taylor] — every string in `personProof`.
  personProof: {
    intro:
      "You told us who's involved on step 1. This is where each of them gets a background — the positions, the roles, the things they founded. One person's timeline is not the same as the group's, and a site that blurs them ends up crediting the wrong person for the best thing on it.",
    linksLabel: "Where they are online",
    linksHelp:
      "Only what you'd want linked from the site. A profile that's half-abandoned does more harm than a missing one.",
    awardsLabel: "Their awards and recognition",
    pressLabel: "Press about them",
    sharedLabel: "The organisation's own record",
    sharedHelp:
      "What belongs to the thing rather than to any one person — the company's history, its positions, what it's been part of. Anything pasted into the fast way above lands here, and you can retype it under a person if it's really theirs.",
    noRoster:
      "Add the people on step 1 and each of them gets their own background here.",
  },

  // [COPY — pending Taylor] — every string in `ask` and `claims`.
  ask: {
    blockLabel: "What you're asking people to do",
    // The scope's draft read "Holistica-shaped sites often have three"; a
    // client's name may not be a literal in shipped copy (D-PORT-14).
    blockHelp:
      "One entry per thing a visitor can do. A project raising money often has three: invest, apply, and get in touch. A coach usually has one.",
    addLabel: "Add another ask",
    askField: {
      label: "The ask",
      options: [
        { value: "invest", label: "Invest" },
        { value: "donate", label: "Donate" },
        { value: "apply", label: "Apply or join" },
        { value: "book", label: "Book" },
        { value: "buy", label: "Buy" },
        { value: "subscribe", label: "Subscribe" },
        { value: "contact", label: "Get in touch" },
        { value: "other", label: "Something else" },
      ],
    },
    forWhomLabel: "Who it's for",
    forWhomPlaceholder: "Anyone, or people we've met, or a particular group",
    getWhat: {
      label: "What they get",
      help: "In plain words. Ownership, a place, a session, a product, a reply.",
    },
    number: {
      label: "The number, if there's one",
      help: "A minimum, a price, tiers, a target. Leave it blank if it isn't public yet, and we'll ask on the call.",
    },
    mechanism: {
      label: "How it should happen",
      options: [
        { value: "form", label: "A form on the site" },
        { value: "request", label: "Request a document" },
        { value: "call", label: "Book a call" },
        { value: "link", label: "A link to somewhere else" },
        { value: "email", label: "Email" },
      ],
    },
    destination: {
      label: "Where it lands",
      help: "The inbox or tool that should receive it. If there isn't one yet, say so; setting one up is part of the build.",
    },
    visibility: {
      label: "Show it on the site?",
      options: [
        { value: "front", label: "Yes, front and centre" },
        { value: "request", label: "Yes, behind a request" },
        { value: "notYet", label: "Not yet" },
      ],
    },
  },

  // [COPY — pending Taylor]
  claims: {
    mono: "What we can say",
    intro:
      'These are the questions that stop us putting something on your site that isn\'t true. Three of them, and "not sure" is a fine answer to all three.',
    signOff: {
      label: "Who signs off on the words before they go live?",
      help: "You, a partner, a lawyer, a board. If it's more than one person, name them; the first look goes to them too.",
    },
    cantSay: {
      label: "Anything you can't say, or can't say yet?",
      help: "Returns, outcomes, guarantees, numbers that aren't public, a name under NDA. We'd rather ask than get you in trouble.",
    },
    requiredWording: {
      label: "Any wording that has to be there?",
      help: 'A disclaimer, a registration number, "this is not an offer", a line your college requires. Paste it exactly as it has to appear.',
    },
  },
};

/**
 * What each pack says differently. Everything absent falls through to `GENERIC`.
 *
 * Every string below is kinds scope §6, landed as written. A `←` in that table
 * means "the same as the column to its left", and it appears here as the same
 * literal rather than a reference — a pack is read top to bottom by whoever is
 * proofreading it, and a chain of references is not readable that way.
 *
 * **Nothing here was invented.** A blank cell in the table is a fall-through,
 * and where the table is silent this file is silent.
 */
const OVERRIDES: Record<ShowcaseFlavour, Partial<ShowcaseCopyPack>> = {
  generic: {},

  /* ── Film — the portfolio pack that predates the kinds work ──────────── */

  film: {
    workIntroLead:
      "Now the work itself — the films, videos, and projects the last step's career produced.", // (v2)
    reelLabel: "Which piece is the reel?", // (v2)
    reelHelp:
      "The one video a stranger should see first. If you don't have a current reel, say so — the site can lead with your best piece instead, and we'll note the reel needs a refresh.", // (v2)
    personVerb: "direct",
    personVerbThird: "directs",
    accountsHelp:
      "IMDb especially, if you have a page — people in film check it.", // (v2)

    /**
     * The nine forks (D-PORT-29). Every string here is `[COPY — draft]`.
     *
     * Drawn from ~44 of the 85 gallery sites loaded by eye on 2026-09-07 rather
     * than from the stored tags, because the tags could not have produced them:
     * Maurine Pagani is tagged `sparse` and arrives as a packed wall, Myrthe
     * Mosterman is tagged `sparse` and arrives as one image, and no axis in the
     * taxonomy separates those two.
     *
     * `structure` first, then `feel`, which is also the order the step renders
     * them — but placement is decided by `group`, not by position here.
     *
     * Each `means` line is what that end **turns into** on the built site. They
     * are the only prose a client reads on a fork, so they carry the whole
     * question; the ends above them are just the two short names.
     */
    tasteSpectrums: [
      {
        id: "meetFirst",
        group: "structure",
        label: "Who they meet first",
        ends: { low: "The work", high: "You" },
        means: {
          low: "They're inside a film before they know whose it is.",
          high: "Your name, your role, what you do — up front.",
        },
      },
      {
        id: "wayThrough",
        group: "structure",
        label: "How they get through it",
        ends: { low: "They roam", high: "You lead" },
        means: {
          low: "Everything's on screen at once. They pick.",
          high: "One at a time, in the order you chose.",
        },
      },
      {
        id: "aroundTheWork",
        group: "structure",
        label: "What sits around each piece",
        ends: { low: "Just the piece", high: "The whole story" },
        means: {
          low: "A title, and nothing else to read.",
          high: "Credits, client, festivals, what you did on it.",
        },
      },
      {
        id: "whereTheLookLives",
        group: "structure",
        label: "Where the personality lives",
        ends: { low: "In the work", high: "In the site" },
        means: {
          low: "The site gets out of the way. Your frames are the whole look.",
          high: "The site has a look of its own, and you'd notice it.",
        },
      },
      {
        id: "whatCarriesIt",
        group: "structure",
        label: "What carries the work",
        ends: { low: "Frames", high: "Footage" },
        means: {
          low: "Stills carry it. Video's there if they go looking.",
          high: "Something's moving the second they land.",
        },
      },

      /* ── Feel. Ungated, and vaguer on purpose — see the type's docstring. ── */

      {
        id: "temperature",
        group: "feel",
        label: "Cool or warm",
        ends: { low: "Cool", high: "Warm" },
        means: {
          low: "Keeps its distance. Still, spare, a little severe.",
          high: "Feels like there's a person in the room with you.",
        },
      },
      {
        id: "presence",
        group: "feel",
        label: "Understated or bold",
        ends: { low: "Understated", high: "Bold" },
        means: {
          low: "Says almost nothing. Lets them find it.",
          high: "Walks in and announces itself.",
        },
      },
      {
        id: "levity",
        group: "feel",
        label: "Serious or playful",
        ends: { low: "Serious", high: "Playful" },
        means: {
          low: "Straight-faced throughout. No winking.",
          high: "Has fun with it, and shows it.",
        },
      },
      {
        id: "era",
        group: "feel",
        label: "Timeless or of its moment",
        ends: { low: "Timeless", high: "Of its moment" },
        means: {
          low: "Should look the same in ten years.",
          high: "Unmistakably now.",
        },
      },
    ],

    darkOrLightHelp:
      "Most film sites run dark so the footage glows — but there is a lot of room between near-black and bright white, and the middle is where most of the good ones live. Yours doesn't have to run dark at all.", // [COPY — pending Taylor] — was v2 verbatim until the question stopped being binary (2026-09-03)
  },

  /* ── Practice — consultants, coaches, speakers, authors ──────────────── */
  /* Every string below: [COPY — pending Taylor] */

  practice: {
    audiences: [
      { value: "clients", label: "Clients" },
      { value: "companies", label: "Companies or teams" },
      { value: "organisers", label: "Event organisers" },
      { value: "readers", label: "Readers" },
      { value: "press", label: "Press" },
      { value: "peers", label: "Peers" },
      {
        value: "referrers",
        label: "Referrers (therapists, doctors, agencies)",
      },
      { value: "collaborators", label: "Prospective collaborators" },
    ],
    wantMoreOf: {
      label: "What kind of work do you want more of?",
      help: "The site's job is shaping what comes next. What do you want the inbox filling with?",
    },
    whatYouAreNotHelp:
      '"I\'m not a life coach" or "I\'m not the cheap option" — whatever\'s true.',
    afterOneVisitHelp:
      'The impression, in your own words. "Someone who\'ll tell me the truth" reads differently from "someone who\'s done this a hundred times" — both are good answers.',

    // The one flexing line of the ingestion block; the rest is the floor's.
    ingestion: {
      ...GENERIC.ingestion,
      what: "An old About page, a speaker one-sheet, the text off a deck, your services page, a bio, a CV, an email where you explained the work well. Paste it all in one go — don't tidy it.",
    },
    experiencePasteIntro:
      "Paste everything — your LinkedIn, your old site's about page, your CV, a speaker bio. One big messy blob is perfect.",
    experienceWhatPlaceholder: "Adjunct — Executive Coaching",
    experienceWherePlaceholder: "Sauder School of Business",
    experienceCategoryPlaceholder: "Teaching, consulting, speaking…",
    kindWordsHelp:
      "Things clients have said about working with you — paste from emails or texts. One or two is plenty.",

    workTitle: "What you offer",
    workIntroLead:
      "Now what you actually offer — the engagements, sessions, talks, or books people come to you for.",
    workIntroTail:
      "Add as many as you want; there's no cap. Don't aim for polished — aim for honest.",
    workPasteIntro:
      "Same trick as the last step — paste your services page, a rate card, a speaker one-sheet, or the offers off your old site, and hit the button.",
    workBlockLabel: "What you offer",
    workAddLabel: "Add another offer",
    organizationOptions: [
      { value: "audience", label: "By who it's for" },
      { value: "format", label: "By format — sessions, talks, writing" },
      { value: "onePage", label: "One page, top to bottom" },
      { value: "trust", label: "You decide — I trust the design" },
      { value: "other", label: "Something else" },
    ],

    voiceNotePrompt:
      "Record a voice memo on your phone answering two things: how did you end up doing this, and tell us about one person you helped and what changed for them. Two or three minutes is the floor, not the ceiling — if there's more in you, take up to half an hour and really tell us. Somewhere between an enthusiastic ramble and a talk you've given a hundred times is exactly the register. Don't script it. This is the single most useful thing you can give us.",
    personVerb: "work with",
    personVerbThird: "works with",
    bioHelp:
      "Paste whatever exists — old site, speaker bio, LinkedIn, a book jacket. All versions welcome.",
    writingHelp:
      "Talks, articles, a newsletter, a book chapter, a workshop handout — anything in your own words.",
    behindScenesHelp:
      "You with clients, on stage, at a desk. This is where the site gets its humanity.",
    pages: [
      { value: "home", label: "Home" },
      { value: "about", label: "About" },
      { value: "services", label: "Services or offers" },
      { value: "speaking", label: "Speaking or events" },
      { value: "writing", label: "Books or writing" },
      { value: "testimonials", label: "Testimonials" },
      { value: "contact", label: "Contact" },
      { value: "booking", label: "Booking" },
    ],
    howSeparateHelp:
      "A company booking a keynote and a person booking a session want different things. Different pages? Different sections? Or does one of them belong on a separate site entirely?",
    reachHelpSuffix:
      "The asks from step 4 get their own buttons. This is for everything else.",
    availability: {
      label: "Should the site say whether you're taking clients?",
      help: '"Taking new clients from March" can prompt the email. It also needs updating — only say yes if you\'ll actually update it.',
    },
    accountsHelp: "Wherever you already show up — LinkedIn especially.",
  },

  /* ── Entity — studios, teams, and the "something else" floor ─────────── */
  /* Every string below: [COPY — pending Taylor] */

  entity: {
    whatYouDoLabel: "What it is, in one line",
    whatYouDoHelp:
      'The line that sits under the name. "A design studio in Halifax" counts. So does "A community-owned sanctuary in the hills of Umbria." We\'ll sharpen it together.',
    nameLabel: "What it's called, as it should appear on the site",
    nameHelp:
      "The name people will search for. If the legal name is different, we'll ask about that on the last step.",
    howLongLabel: "How long it's been going",
    representation: {
      label: "Who speaks for it",
      help: "Counsel, a broker, an investor-relations contact, a board. Who they are, and whether enquiries should go through them.",
    },

    audienceIntro:
      "This site isn't for you — it's for the person deciding whether to work with you, join you, or back you. This step is about who that is.",
    audiences: [
      { value: "clients", label: "Clients" },
      { value: "agencies", label: "Agencies or brands" },
      { value: "partners", label: "Partners or suppliers" },
      { value: "press", label: "Press" },
      { value: "recruits", label: "Recruits" },
      { value: "investors", label: "Investors" },
      { value: "collaborators", label: "Prospective collaborators" },
    ],
    wantMoreOf: {
      label: "What kind of work do you want more of?",
      help: "The site's job is shaping what comes next. What do you want the inbox filling with?",
    },
    whatYouAreNotHelp:
      '"We\'re not an agency" or "we don\'t do rush jobs" — whatever\'s true.',
    afterOneVisitHelp:
      'The impression, in your own words. "A studio I\'d trust with the whole thing" reads differently from "the people who make the strange, beautiful ones" — both are good answers.',

    // The one flexing line of the ingestion block; the rest is the floor's.
    ingestion: {
      ...GENERIC.ingestion,
      what: "The About page, the team page, the text off a capability deck, case-study titles, LinkedIn for the principals, an email where you explained it well. Paste it all in one go — don't tidy it.",
    },
    experiencePasteIntro:
      "Paste everything — the about page, the team page, a capability deck, LinkedIn for the principals. One big messy blob is perfect.",
    experienceWhatPlaceholder: "Studio founded",
    experienceWherePlaceholder: "Vancouver",
    experienceCategoryPlaceholder: "Founding, partnerships, awards…",
    awards: {
      label: "Recognition, grants, and milestones",
      help: "Awards, grants, press mentions, a milestone worth a date — the first hire, the first location, the first thousand.",
    },
    kindWordsHelp:
      "Things clients, partners, or people you've worked with have said — paste from emails or texts. One or two is plenty.",

    workIntroLead: "Now the work itself — the projects the studio has made.",
    workPasteIntro:
      "Same trick — paste the studio's project list, case-study titles, or the work page off the old site.",

    darkOrLightHelp:
      "Most sites for a place or a project run light so the photography carries it — though a warm off-white usually carries it better than bright white does. Yours doesn't have to run light at all.",
    voiceNotePrompt:
      "Record a voice memo on your phone answering two things: how did this start, and what's the thing you've made together that you're proudest of. Two or three minutes is the floor, not the ceiling — if there's more in you, take up to half an hour and really tell us. Somewhere between an enthusiastic ramble and a talk you've given a hundred times is exactly the register. Don't script it. This is the single most useful thing you can give us.",
    voiceNoteSkipSuffix: "More than one of you? One each is ideal.",
    personSubject: "We",
    personVerb: "build",
    personVerbThird: "builds",
    bioHelp:
      "Paste whatever exists — old site, a deck, LinkedIn for the principals. All versions welcome.",
    writingHelp:
      "Case studies, a manifesto, proposals you're proud of — anything in your own words.",
    behindScenesHelp:
      "The team at work. This is where the site gets its humanity.",
    logos: {
      label: "Logos, badges, and certifications",
      help: "Partner logos, press logos, memberships, certifications. Only what you're allowed to show.",
    },
    logoHelp:
      "Most organisations have one. If it's fine, send the original. If it isn't, there's an add-on for that; say so and we'll talk about it.",
    pages: [
      { value: "home", label: "Home" },
      { value: "work", label: "Work" },
      { value: "about", label: "About" },
      { value: "team", label: "Team" },
      { value: "services", label: "Services" },
      { value: "press", label: "Press or news" },
      { value: "contact", label: "Contact" },
    ],
    howSeparateHelp:
      "A client looking at the work and a designer looking to join want different things. Different pages? Different sections?",
    reachHelpSuffix:
      "The asks from step 4 get their own buttons. This is for everything else.",
    availability: {
      label: "Should the site say whether you're taking work?",
      help: '"Booking for fall 2026" can prompt the email. It also needs updating — only say yes if you\'ll actually update it.',
    },
    accountsHelp:
      "Wherever the studio already lives — Instagram, Behance, LinkedIn.",
  },

  /* ── Venture — raising money, finding members, launching something ───── */
  /* Every string below: [COPY — pending Taylor] */

  venture: {
    whatYouDoLabel: "What it is, in one line",
    whatYouDoHelp:
      'The line that sits under the name. "A design studio in Halifax" counts. So does "A community-owned sanctuary in the hills of Umbria." We\'ll sharpen it together.',
    nameLabel: "What it's called, as it should appear on the site",
    nameHelp:
      "The name people will search for. If the legal name is different, we'll ask about that on the last step.",
    howLongLabel: "How long it's been going",
    basedInHelpSuffix:
      "…and where the thing itself is, if that's somewhere else.",
    stage: {
      label: "Where it stands",
      help: "Where it honestly stands today. The site says this differently at each stage, and none of them is a bad answer.",
      options: [
        { value: "idea", label: "An idea with a plan" },
        { value: "raising", label: "Raising, not yet built" },
        { value: "underway", label: "Underway" },
        { value: "operating", label: "Operating" },
      ],
      // [COPY — pending Taylor]
      detail: {
        label: "Say more about where it stands",
        help: "The part the four options can't hold: what's actually built, what's committed, what's signed, what's still a conversation, and what has to be true before the next thing happens. Ramble — this is one of the most useful boxes on the form.",
      },
    },
    representation: {
      label: "Who speaks for it",
      help: "Counsel, a broker, an investor-relations contact, a board. Who they are, and whether enquiries should go through them.",
    },

    audienceIntro:
      "This site isn't for you — it's for the person deciding whether to work with you, join you, or back you. This step is about who that is.",
    audiences: [
      { value: "investors", label: "Investors or backers" },
      { value: "members", label: "Members or applicants" },
      { value: "residents", label: "Residents or guests" },
      { value: "partners", label: "Partners" },
      { value: "funders", label: "Grant committees or funders" },
      { value: "press", label: "Press" },
      { value: "regulators", label: "Local government or regulators" },
      { value: "collaborators", label: "Prospective collaborators" },
    ],
    wantMoreOf: {
      label: "Who do you want more of?",
      help: "Backers, members, partners: the site's job is shaping who shows up next.",
    },
    stopAttracting: {
      label: "Who do you want to stop attracting?",
      help: "The enquiries you'd rather not spend an hour on, even when they're flattering.",
    },
    whatYouAreNotHelp:
      '"We\'re not a resort" or "this isn\'t a timeshare" — whatever\'s true.',
    afterOneVisitHelp:
      'The impression, in your own words. "People who\'ve actually done this before" reads differently from "a place I want to be part of" — both are good answers.',

    // The one flexing line of the ingestion block; the rest is the floor's.
    ingestion: {
      ...GENERIC.ingestion,
      what: "The text off the deck, the one-pager, the vision and amenities pages off the old site, LinkedIn for the founders, an application you wrote for a grant. Paste it all in one go — don't tidy it.",
    },
    experiencePasteIntro:
      "Paste everything — the deck's team and story slides, LinkedIn for the founders, the origin story off the old site. One big messy blob is perfect.",
    experienceWhatPlaceholder: "Founder",
    // [COPY — pending Taylor] Was "Holistica Properties" in the kinds
    // scope; a client's name may not be a literal in shipped copy (D-PORT-14).
    experienceWherePlaceholder: "Riverstone Commons",
    experienceCategoryPlaceholder: "Founding, prior ventures, advisory…",
    awards: {
      label: "Recognition, grants, and milestones",
      help: "Awards, grants, press mentions, a milestone worth a date — the first hire, the first location, the first thousand.",
    },
    kindWordsHelp:
      "Things clients, partners, or people you've worked with have said — paste from emails or texts. One or two is plenty.",
    notableNamesHelpSuffix:
      "Backers, partners, advisors, anyone whose name is already attached. And whether you're allowed to say so.",

    workTitle: "What you're building",
    workIntroLead:
      "Now the thing itself — what exists, what's planned, and what you're asking people to be part of.",
    workIntroTail:
      "Add what's real and what's planned, and say which is which. Don't aim for polished — aim for honest.",
    workPasteIntro:
      "Same trick — paste the deck's product, phases, and offering slides, or the old site's vision and amenities pages.",
    workBlockLabel: "What you're building",
    workAddLabel: "Add another piece",
    organizationOptions: [
      { value: "status", label: "By what exists vs. what's planned" },
      {
        value: "audience",
        label: "By who it's for — investors, members, visitors",
      },
      { value: "oneStory", label: "One story, top to bottom" },
      { value: "trust", label: "You decide — I trust the design" },
      { value: "other", label: "Something else" },
    ],

    darkOrLightHelp:
      "Most sites for a place or a project run light so the photography carries it — though a warm off-white usually carries it better than bright white does. Yours doesn't have to run light at all.",
    voiceNotePrompt:
      "Record a voice memo on your phone answering two things: why does this need to exist, and what does it look like if it works. Two or three minutes is the floor, not the ceiling — if there's more in you, take up to half an hour and really tell us. Somewhere between an enthusiastic ramble and a talk you've given a hundred times is exactly the register. Don't script it. This is the single most useful thing you can give us.",
    voiceNoteSkipSuffix: "More than one of you? One each is ideal.",
    personSubject: "We",
    personVerb: "build",
    personVerbThird: "builds",
    bioHelp:
      "Paste whatever exists — old site, a deck, LinkedIn for the principals. All versions welcome.",
    writingHelp:
      "The deck's story slide, a founder letter, an application you wrote for a grant or a residency — anything in your own words.",
    place: {
      label: "The place, as it is now",
      help: "The property, the land, the renders, the drone shots, the team on site. Honest beats polished.",
    },
    behindScenesHelp:
      "The team on site, at the table, in the field. This is where the site gets its humanity.",
    logos: {
      label: "Logos, badges, and certifications",
      help: "Partner logos, press logos, memberships, certifications. Only what you're allowed to show.",
    },
    logoHelp:
      "Most organisations have one. If it's fine, send the original. If it isn't, there's an add-on for that; say so and we'll talk about it.",
    pages: [
      { value: "home", label: "Home" },
      { value: "vision", label: "The vision" },
      { value: "place", label: "The place" },
      { value: "team", label: "Team" },
      { value: "offering", label: "The offering" },
      { value: "apply", label: "Apply or join" },
      { value: "faq", label: "FAQ" },
      { value: "press", label: "Press or news" },
      { value: "contact", label: "Contact" },
      { value: "legal", label: "Legal" },
    ],
    howSeparateHelp:
      "An investor reading the model and someone applying to live there want different things. Different pages? Different sections? Or does one of them belong behind a request?",
    reachHelpSuffix:
      "The asks from step 4 get their own buttons. This is for everything else.",
    availability: {
      label: "Should the site say where the raise, or the applications, stand?",
      help: '"Founding round open" or "Applications open for 2026" can prompt the click. It also needs updating — only say yes if you\'ll actually update it.',
    },
    accountsHelp:
      "Wherever the project already lives — Instagram, LinkedIn, a crowdfunding page, a newsletter.",
  },

  /* ── Service — businesses that sell services ─────────────────────────── */
  /* Every string below: [COPY — pending Taylor] */

  service: {
    whatYouDoLabel: "What it is, in one line",
    whatYouDoHelp:
      'The line that sits under the name. "Residential electricians, North Shore" counts.',
    nameLabel: "What it's called, as it should appear on the site",
    nameHelp:
      "The name people will search for. If the legal name is different, we'll ask about that on the last step.",
    howLongLabel: "How long it's been going",
    representation: {
      label: "Who speaks for it",
      help: "Counsel, a broker, an investor-relations contact, a board. Who they are, and whether enquiries should go through them.",
    },

    audienceIntro:
      "This site isn't for you — it's for the person deciding whether to call you. This step is about who that is.",
    audiences: [
      { value: "customers", label: "Customers" },
      {
        value: "propertyManagers",
        label: "Property managers or businesses",
      },
      { value: "referrers", label: "Referrers and other trades" },
      { value: "reviewers", label: "Reviewers" },
      { value: "suppliers", label: "Suppliers" },
      { value: "press", label: "Press" },
    ],
    wantMoreOf: {
      label: "What jobs do you want more of?",
      help: "The site's job is shaping what comes next. What do you want the phone ringing about?",
    },
    stopAttracting: {
      label: "What jobs do you want to stop taking?",
      help: "Work you'd rather age out of, even if it pays.",
    },
    whatYouAreNotHelp:
      '"We\'re not the cheapest" or "we don\'t do commercial" — whatever\'s true.',
    afterOneVisitHelp:
      'The impression, in your own words. "They\'ll show up when they say" reads differently from "the ones who do it properly" — both are good answers.',

    // The one flexing line of the ingestion block; the rest is the floor's.
    ingestion: {
      ...GENERIC.ingestion,
      what: "The old site's about and services pages, a Google Business description, a price list, a flyer, a quote you've sent, an email where you explained the business well. Paste it all in one go — don't tidy it.",
    },
    experiencePasteIntro:
      "Paste everything — the old site's about page, a Google Business description, a CV. One big messy blob is perfect.",
    experienceWhatPlaceholder: "Owner-operator",
    experienceWherePlaceholder: "Northshore Electric",
    experienceCategoryPlaceholder: "Trades, licences, community…",
    awards: {
      label: "Recognition, grants, and milestones",
      help: "Awards, certifications, a trade association's recognition, a milestone worth a date.",
    },
    kindWordsHelp:
      "Things customers have said — paste from emails, texts, or reviews. One or two is plenty.",

    workTitle: "What you offer",
    workIntroLead:
      "Now what you actually do — the services people call you for.",
    workIntroTail:
      "Add as many as you want; there's no cap. Rough prices are fine.",
    workPasteIntro:
      "Same trick — paste your services page, a price list, or a quote you've sent, and hit the button.",
    workBlockLabel: "Your services",
    workAddLabel: "Add another service",
    organizationOptions: [
      { value: "service", label: "By service" },
      { value: "audience", label: "By who it's for — homes, businesses" },
      { value: "oneList", label: "One list, no filters" },
      { value: "trust", label: "You decide — I trust the design" },
      { value: "other", label: "Something else" },
    ],

    darkOrLightHelp:
      "Most service sites run light; it reads as open for business. But bright white is only one way to do that, and a warm off-white usually does it better. Yours doesn't have to run light at all.",
    voiceNotePrompt:
      "Record a voice memo on your phone answering two things: how did you get into this, and tell us about a job that went exactly right. Two or three minutes is the floor, not the ceiling — if there's more in you, take up to half an hour and really tell us. Somewhere between an enthusiastic ramble and a talk you've given a hundred times is exactly the register. Don't script it. This is the single most useful thing you can give us.",
    voiceNoteSkipSuffix: "More than one of you? One each is ideal.",
    personSubject: "We",
    personVerb: "do",
    personVerbThird: "does",
    bioHelp:
      "Paste whatever exists — old site, Google Business, a flyer. All versions welcome.",
    writingHelp:
      "Quotes, a flyer, an email you send every customer — anything in your own words.",
    place: {
      label: "The place",
      help: "The shop, the van, the workshop. Wide shots and details both.",
    },
    behindScenesHelp:
      "You on the job. This is where the site gets its humanity.",
    logos: {
      label: "Logos, badges, and certifications",
      help: "Partner logos, press logos, memberships, certifications. Only what you're allowed to show.",
    },
    logoHelp:
      "Most organisations have one. If it's fine, send the original. If it isn't, there's an add-on for that; say so and we'll talk about it.",
    pages: [
      { value: "home", label: "Home" },
      { value: "services", label: "Services" },
      { value: "pricing", label: "Pricing" },
      { value: "about", label: "About" },
      { value: "reviews", label: "Reviews" },
      { value: "serviceArea", label: "Service area" },
      { value: "faq", label: "FAQ" },
      { value: "contact", label: "Contact" },
      { value: "booking", label: "Booking" },
    ],
    howSeparateHelp:
      "A homeowner and a property manager want different things. Different pages? Different sections?",
    reachHelpSuffix:
      "The asks from step 4 get their own buttons. This is for everything else.",
    availability: {
      label: "Should the site show booking availability?",
      help: '"Booking for fall 2026" can prompt the email. It also needs updating — only say yes if you\'ll actually update it.',
    },
    accountsHelp:
      "Google Business especially, if you have a listing — people check it.",
  },
};

/**
 * Every pack, resolved once at module load.
 *
 * Resolved eagerly rather than per call so a pack is a stable reference — the
 * step registry compares intros across packs, and a fresh object each call
 * would make that comparison about identity instead of content.
 */
const RESOLVED = Object.fromEntries(
  SHOWCASE_FLAVOURS.map((flavour) => [
    flavour,
    { ...GENERIC, ...OVERRIDES[flavour] },
  ]),
) as Record<ShowcaseFlavour, ShowcaseCopyPack>;

/** One pack, whole. Never a partial, never a missing slot. */
export function resolvePack(flavour: ShowcaseFlavour): ShowcaseCopyPack {
  return RESOLVED[flavour];
}

/**
 * Every required slot name, for the cartridge verifier's fall-through check.
 *
 * Derived from `GENERIC`, which is the only complete pack — so a slot added to
 * the type without a floor is a compile error, and a slot added with one is
 * automatically asserted across all six packs.
 */
export const SHOWCASE_COPY_SLOTS = Object.keys(GENERIC) as ReadonlyArray<
  keyof ShowcaseCopyPack
>;
