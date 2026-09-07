import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ExampleSet } from "@/content/intake-examples";
import {
  galleryFlavourOf,
  hostOf,
  picksOf,
  siteByKey,
} from "@/lib/intake/taste-picks";
import { loadExampleSet } from "./example-sites";
import {
  claimRun,
  ExtractionUnavailableError,
  getClient,
  MODEL,
} from "./extract";
import { readStepAnswers } from "./submission";

/**
 * "Find more like it" — real websites that feel like what a client described.
 *
 * The fourth third-party data path on this track, and it follows the three
 * before it rather than inventing a fourth posture.
 *
 * ## What leaves, and what does not
 *
 * The extractor sends an anonymous blob; `come-across` sends nothing at all and
 * reads an allow-list of answers server-side. This does both, for a reason in
 * each direction. The **brief is posted** from the browser, so a client need
 * not wait for autosave before pressing a button about the sentence they just
 * typed. **Everything else is read here** from the stored answers, so a
 * fabricated request cannot put words in the model's mouth about who this
 * person is and get them handed back looking like the client's own.
 *
 * `SOURCES` is that allow-list and the whole of it: the three words, the never
 * line, and what they said about the sites they picked. No display name, no
 * contact column, no token, no engagement id, no upload, no brain dump — the
 * brain dump is a client's unfiltered thinking about their own business and it
 * has no business in a search query.
 *
 * ## Nothing here is an answer
 *
 * Links come back, the client presses one into their own list, and it reaches
 * the answers document through their own autosave. The same seen-first law the
 * extractor, the primer, and the prediction follow. What the machine offered
 * and they declined is not stored anywhere.
 *
 * ## Two calls, not one
 *
 * The search runs as a **server tool**, on Anthropic's infrastructure — so a
 * client's typed description never becomes an outbound request from one of our
 * functions, and the SSRF surface does not exist. Structured output cannot ride
 * that same request, so a second, cheap call turns what the search found into
 * the typed list this returns (M-PORT-37).
 */

export const MAX_RESULTS = 6;

/** The brief is the one thing posted from the browser, and it is bounded. */
export const MAX_BRIEF_CHARS = 2000;

/** How many times a paused server-tool turn is resumed before giving up. */
const MAX_RESUMES = 3;

/**
 * The whole search's wall-clock budget.
 *
 * There was none, which on a path of up to four model turns and fourteen
 * server-side web searches meant the only ceiling was the route's own
 * `maxDuration` of 300s — and a client watching a button that says "Looking…"
 * had no way to tell a slow run from a hung one (Taylor, 2026-09-05). Set
 * under that ceiling so this fails as itself, with its own sentence, rather
 * than as a function timeout.
 *
 * `[PROVISIONAL — a live run measured 90s to four minutes; this is the far
 * end of that plus room, not a measured optimum]`
 */
const SEARCH_BUDGET_MS = 240_000;

/**
 * How many searches one run may make.
 *
 * Six was the first value and the first live run spent it on round-up articles
 * before it had opened a single candidate, then said so and returned nothing —
 * a correct refusal, and a useless feature. Judging whether a site is *dark but
 * warm with oversized type* takes more looking than judging whether a fact is
 * true. `[PROVISIONAL — measured against one live run, not a set]`
 */
const MAX_SEARCHES = 14;

/**
 * Places that are not somebody's website.
 *
 * A client asks for sites and, left alone, a search returns the galleries and
 * template stores that index them — which they can already browse and which
 * tell us nothing about their taste. Extended from what actually comes back on
 * live runs. `[PROVISIONAL]`
 */
const BLOCKED_DOMAINS = [
  "pinterest.com",
  "instagram.com",
  "facebook.com",
  "dribbble.com",
  "behance.net",
  "awwwards.com",
  "siteinspire.com",
  "land-book.com",
];

/**
 * **Do not add the hosting platforms to the list above.**
 *
 * Blocking a domain blocks its subdomains, and a great many of the sites this
 * search exists to find *are* subdomains of one: `format.com`, `fabrik.io`,
 * `squarespace.com`, `wix.com`, `webflow.com`. The research library that
 * seeded this feature lists `bryancooperdp.format.com` and
 * `corradoserri.format.com` as exactly the kind of practitioner site a client
 * should meet. An earlier version of this list blocked all five and threw away
 * most of the good answers to keep out the marketing pages — the instruction
 * handles those, and it is the right tool for a judgement about what a page
 * *is*.
 */

/**
 * Which answers the search may read.
 *
 * An allow-list, and the reason it is one is above. A field added to the taste
 * step is not added here unless somebody adds it here.
 */
const SOURCES: readonly string[] = [
  "wordOne",
  "wordTwo",
  "wordThree",
  "neverFeelLike",
];

const LABELS: Readonly<Record<string, string>> = {
  wordOne: "Feel word",
  wordTwo: "Feel word",
  wordThree: "Feel word",
  neverFeelLike: "Must never feel like",
};

const resultSchema = z.object({
  results: z
    .array(
      z.object({
        url: z.string(),
        /** One line on why it came back, in plain words. */
        why: z.string(),
      }),
    )
    .max(MAX_RESULTS),
});

export type StyleSearchResult = { url: string; host: string; why: string };

/**
 * What one run found, and what it found that the client has already met.
 *
 * `familiar` counts results dropped for being in this pack's own gallery. It
 * exists so the surface can tell "we looked and found nothing like it" apart
 * from "what we found, you have already been shown" — two different sentences
 * that the old `StyleSearchResult[]` return could not distinguish.
 */
export type StyleSearchFindings = {
  results: StyleSearchResult[];
  familiar: number;
};

const SEARCH_INSTRUCTION = [
  "You are finding real websites that feel like a description someone gave.",
  "",
  "Search the web and open enough results to judge them. What you are looking",
  "for is the personal or studio website of a working practitioner — a",
  "photographer, a director, a designer, a studio, a small firm. Their own",
  "site.",
  "",
  "Not results:",
  "- Galleries, showcases, and award sites that merely list other sites.",
  "- Template shops, theme stores, and website-builder marketing pages.",
  "- Articles, listicles, and 'best 30 portfolio sites' round-ups.",
  "- Social profiles and portfolio-hosting profiles.",
  "",
  "When you are done, list the exact URLs you actually visited that match,",
  "each with one plain sentence about why it matches the description. Six at",
  "the very most, and fewer is better than padding. If nothing convincing",
  "came back, say so plainly instead of offering something close.",
].join("\n");

const SELECT_INSTRUCTION = [
  "You are turning search notes into a short list of links.",
  "",
  "Return only sites that are a working practitioner's or studio's own",
  "website, with the exact URL as it was visited. Drop anything that is a",
  "gallery, a template store, an article, or a social profile. Drop anything",
  "whose URL you are not certain was actually visited.",
  "",
  "Each 'why' is one plain sentence naming what about the site matches the",
  "description. No marketing adjectives.",
  "",
  "Return an empty list rather than padding it.",
].join("\n");

/**
 * The material this search is allowed to read, as labelled lines.
 *
 * The picks come with the client's own note and score, because "6/7 — the
 * hover previews, not the type" is the sharpest thing anyone has written about
 * their own taste on this form, and it is the reason the search is worth
 * running at all.
 */
function digest(answers: unknown, gallery: ExampleSet): string[] {
  const taste = readStepAnswers("showcase", answers, "taste" as never);
  const lines: string[] = [];

  for (const field of SOURCES) {
    const value = taste[field];
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (text) lines.push(`${LABELS[field] ?? field}: ${text}`);
  }

  for (const pick of picksOf(taste)) {
    const site = siteByKey(gallery, pick.siteKey);
    if (!site) continue;

    const parts = [
      `Liked: ${site.name} (${hostOf(site.url)})`,
      pick.score === undefined ? null : `${pick.score}/7`,
      pick.note?.trim() ? `"${pick.note.trim()}"` : null,
    ].filter(Boolean);

    lines.push(parts.join(" — "));
  }

  return lines;
}

/**
 * Finds real sites that feel like the brief. Returns them; stores nothing.
 *
 * Takes the answers document rather than an engagement, for the same reason
 * `predictComeAcross` does: a function that is never handed a contact column
 * cannot send one.
 */
export async function searchForStyle(
  engagementId: string,
  answers: unknown,
  brief: string,
): Promise<StyleSearchFindings> {
  // An empty brief costs no run. Refusing is cheaper than counting.
  if (!brief.trim()) throw new ExtractionUnavailableError("empty");

  if (!(await claimRun(engagementId))) {
    throw new ExtractionUnavailableError("rate_limited");
  }

  // Loaded here rather than inside `findSites`, so that function keeps the
  // property its own docblock claims: no database, runnable against a fixture
  // (M-PORT-41).
  const gallery = await loadExampleSet(galleryFlavourOf(answers));

  return findSites(answers, brief, gallery);
}

/**
 * The search itself: a brief and some answers in, links out. No database, no
 * run counter.
 *
 * Split from `searchForStyle` for the reason `sortDocument` is split from
 * `extractEntries` — so the part that can be graded can be run against a
 * fixture, without a seeded engagement to spend somebody's budget on.
 *
 * **This is not a bypass.** The cap is a property of an engagement rather than
 * of the model call, and nothing client-reachable imports this: the action
 * calls `searchForStyle` and only that.
 */
export async function findSites(
  answers: unknown,
  brief: string,
  gallery: ExampleSet,
): Promise<StyleSearchFindings> {
  const description = brief.trim();
  if (!description) throw new ExtractionUnavailableError("empty");

  const context = [
    `What they are picturing: ${description.slice(0, MAX_BRIEF_CHARS)}`,
    ...digest(answers, gallery),
  ].join("\n");

  const startedAt = Date.now();
  const deadline = startedAt + SEARCH_BUDGET_MS;
  console.info(
    `[style-search] start · brief=${description.length} chars · gallery=${gallery.sites.length} sites · model=${MODEL}`,
  );

  try {
    const notes = await runSearch(context, deadline);
    if (!notes.trim()) {
      console.info("[style-search] search turn returned no text");
      return { results: [], familiar: 0 };
    }

    const response = await getClient().messages.parse(
      {
        model: MODEL,
        max_tokens: 2000,
        system: SELECT_INSTRUCTION,
        messages: [{ role: "user", content: notes }],
        output_config: { format: zodOutputFormat(resultSchema) },
      },
      { timeout: Math.max(deadline - Date.now(), 1) },
    );

    // A refusal or an unparseable structured output arrives as no results at
    // all, which is indistinguishable from an honest empty list unless it is
    // said out loud.
    if (!response.parsed_output) {
      console.info("[style-search] select turn returned no parsable output");
    }

    const findings = keepUsable(response.parsed_output?.results ?? [], gallery);
    console.info(`[style-search] done in ${Date.now() - startedAt}ms`);
    return findings;
  } catch (error) {
    if (error instanceof ExtractionUnavailableError) throw error;

    // The message, never the payload. The brief is a client's own words.
    console.error(
      "[style-search] request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    throw new ExtractionUnavailableError("failed");
  }
}

/**
 * The search turn, resumed when the server-tool loop pauses.
 *
 * `pause_turn` means the loop hit its iteration ceiling with work still to do.
 * Returning it as a finished answer is the failure mode this exists to prevent:
 * the response looks fine, the text is short, and the client is told nothing
 * came back. Three resumes, then it is a failure and says so.
 */
async function runSearch(context: string, deadline: number): Promise<string> {
  const client = getClient();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: context },
  ];

  const turn = (): Promise<Anthropic.Message> => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new ExtractionUnavailableError("failed");

    return client.messages.create(
      {
        model: MODEL,
        max_tokens: 4000,
        system: SEARCH_INSTRUCTION,
        messages,
        tools: [
          {
            type: "web_search_20260209",
            name: "web_search",
            max_uses: MAX_SEARCHES,
            blocked_domains: BLOCKED_DOMAINS,
          },
        ],
      },
      // Whatever is left of the budget, so the last turn cannot outlive it.
      { timeout: remaining },
    );
  };

  let response = await turn();
  let resumes = 0;

  while (response.stop_reason === "pause_turn" && resumes < MAX_RESUMES) {
    messages.push({ role: "assistant", content: response.content });
    response = await turn();
    resumes += 1;
  }

  console.info(
    `[style-search] search turns=${resumes + 1} · stop=${response.stop_reason} · searches=${
      response.usage?.server_tool_use?.web_search_requests ?? "?"
    }`,
  );

  if (response.stop_reason === "pause_turn") {
    throw new ExtractionUnavailableError("failed");
  }

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

/**
 * What survives before a client ever sees it.
 *
 * http(s) only, no duplicates, nothing already in their own gallery — showing
 * someone a site they were shown two sections ago reads as the machine not
 * having looked — and never more than the ceiling, whatever came back.
 */
function keepUsable(
  results: readonly { url: string; why: string }[],
  set: ExampleSet,
): StyleSearchFindings {
  const gallery = galleryHosts(set);
  const seen = new Set<string>();
  const kept: StyleSearchResult[] = [];
  let familiar = 0;
  let unusable = 0;

  for (const result of results) {
    let url: URL;
    try {
      url = new URL(result.url.trim());
    } catch {
      unusable += 1;
      continue;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      unusable += 1;
      continue;
    }

    const host = hostOf(url.toString());
    if (seen.has(host)) continue;

    // Anything already in this pack's gallery is not a discovery — showing
    // someone a site they were shown two sections ago reads as not having
    // looked. Counted rather than merely skipped: a brief whose every good
    // answer is already in the gallery is a *hit*, and reporting it as
    // "nothing convincing came back" is the search calling its own success a
    // failure (Taylor, 2026-09-05).
    if (gallery.has(url.hostname.replace(/^www\./, ""))) {
      familiar += 1;
      continue;
    }

    seen.add(host);
    kept.push({ url: url.toString(), host, why: result.why.trim() });
    if (kept.length >= MAX_RESULTS) break;
  }

  console.info(
    `[style-search] model returned ${results.length} · kept ${kept.length} · already in gallery ${familiar} · unusable ${unusable}`,
  );

  return { results: kept, familiar };
}

/** The hosts already in this pack's gallery, so a result cannot repeat one. */
function galleryHosts(set: ExampleSet): ReadonlySet<string> {
  const hosts = new Set<string>();

  for (const site of set.sites) {
    try {
      hosts.add(new URL(site.url).hostname.replace(/^www\./, ""));
    } catch {
      // A malformed URL never publishes: the gate refuses a blank link and
      // `yarn verify:tracks` owns the rest.
    }
  }

  return hosts;
}
