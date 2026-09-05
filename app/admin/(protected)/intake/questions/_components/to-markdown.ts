/**
 * The rendered document, as Markdown a person can paste into Notion.
 *
 * ## Why this is a converter and not a writer
 *
 * The obvious way to produce this file is to walk the step registry and print
 * the questions. That is a second home for the copy and it is refused — the
 * whole surface exists because question copy lives in exactly one place
 * (D-ADM-6). So the input here is **the document that was already rendered by
 * the production components**: whatever a client would read is what lands in
 * the file, because it is literally the same render.
 *
 * ## Why it is a pure string function
 *
 * Mason's objection to a clipboard walker (ADM-4 §Out of scope) was that its
 * fidelity depended on a `data-md` vocabulary and a walker agreeing, with
 * nothing to check the agreement. Keeping the conversion as `htmlToMarkdown`,
 * separate from the button that calls it, is what closes that: the function
 * takes the same HTML `renderToStaticMarkup` produces, so a test can render the
 * real document, convert it, and assert that every question in the one appears
 * in the other. A broken selector fails that test instead of silently dropping
 * a step.
 *
 * ## The mapping
 *
 * Anchored on semantic elements first (`h2`, `h3`, `ul`/`li`) and on `data-md`
 * only where the markup is not semantic on its own — the component tag, the
 * answer key, a reveal's condition, an overview's kind list. Notion reads all
 * of the results natively: headings nest, `-` becomes a bulleted list, `>`
 * becomes a callout-ish quote, and backticks become inline code.
 */

/** Where the file came from, printed at the top so a stale copy is obvious. */
export type MarkdownMeta = {
  /** "Coded / showcase" or "Platform / durable". */
  track: string;
  /** The view: a kind's own label, or the all-kinds overview. */
  view: string;
  /** Which copy pack the words below are. */
  pack: string;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&apos;": "'",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&mdash;": "—",
  "&ndash;": "–",
  "&middot;": "·",
  "&hellip;": "…",
  "&nbsp;": " ",
};

function decode(text: string): string {
  return text.replace(/&[a-zA-Z#0-9]+;/g, (entity) => ENTITIES[entity] ?? entity);
}

/** Collapses runs of whitespace; JSX indentation is not content. */
function tidy(text: string): string {
  return decode(text).replace(/\s+/g, " ").trim();
}

/**
 * One block of output, before it is joined.
 *
 * Emitting blocks rather than appending to a string is what keeps blank-line
 * handling in one place: Markdown cares a great deal about them, and Notion
 * silently merges paragraphs that are not separated by one.
 */
type Block = string;

type OpenTag = {
  name: string;
  md: string | null;
};

const BLOCK_TAGS = new Set(["h1", "h2", "h3", "h4", "p", "li", "dt", "dd"]);

/**
 * Any element carrying `data-md` is a boundary, whatever its tag.
 *
 * The answer key is a `<span>` beside its heading. Without this it was not a
 * block, so its text stayed in the buffer after the heading closed and was
 * swallowed into whatever paragraph came next — the key vanished and a help
 * line silently gained a word. Found by the conversion test rather than by
 * reading, which is the argument for having one.
 */
function isBlock(name: string, md: string | null): boolean {
  return BLOCK_TAGS.has(name) || (md !== null && md !== SKIP);
}

/**
 * Screen-only decoration whose text must not reach the file.
 *
 * `skip` is deliberately **not** a block: the bullet glyph sits inside its list
 * item and before that item's text, so treating it as a boundary closed the
 * item early and threw the option away. It suppresses its own content and
 * leaves the block around it alone.
 */
const SKIP = "skip";

/**
 * Turns the rendered document into Markdown.
 *
 * Walks the tag stream once. Text is accumulated into whichever block-level
 * element is currently open, and the element decides how the block is prefixed.
 * Unknown elements are transparent — a `<div>` or a `<span>` contributes its
 * text to the block around it, which is why the layout wrappers in the document
 * need no knowledge of this file.
 */
export function htmlToMarkdown(html: string, meta: MarkdownMeta): string {
  const blocks: Block[] = [
    "# Intake questions",
    "",
    `**Track:** ${meta.track}  `,
    `**View:** ${meta.view}  `,
    `**Copy pack:** ${meta.pack}`,
    "",
    "> Rendered from the live intake components. Every label, help line, and" +
      " option below is the exact string a client reads — nothing here is a" +
      " transcription, so it cannot drift from the form.",
    "",
    "---",
  ];

  const stack: OpenTag[] = [];
  let buffer = "";
  /** How many nested screen-only elements we are inside. */
  let skipping = 0;
  /** Set while inside a heading/paragraph/list item; decides the prefix. */
  let current: string | null = null;
  let currentMd: string | null = null;

  /** Meta lines (`[Short text]`, `whatYouDo`) merge onto one line under a question. */
  let pendingMeta: string[] = [];

  /**
   * A band or step eyebrow, held until its title arrives.
   *
   * The accordion renders the eyebrow before the title, but a document reads
   * better with the heading leading and its label beneath. Holding one line is
   * cheaper than a second pass.
   */
  let pendingEyebrow: string | null = null;

  /** How many sections have been emitted, so only later ones get a divider. */
  let sections = 0;

  function flushMeta(): void {
    if (pendingMeta.length === 0) return;
    blocks.push(pendingMeta.join(" · "), "");
    pendingMeta = [];
  }

  function close(): void {
    const text = tidy(buffer);
    buffer = "";

    if (!text) {
      current = null;
      currentMd = null;
      return;
    }

    switch (currentMd) {
      // The component type and the answer key are annotations on the question
      // above them, so they ride together on one line rather than as two
      // paragraphs Notion would space apart.
      case "tag":
        pendingMeta.push(`\`${text}\``);
        break;
      case "key":
        pendingMeta.push(`\`${text}\``);
        break;
      case "condition":
      case "kinds":
        flushMeta();
        blocks.push(`> **${text}**`, "");
        break;
      case "hint":
        flushMeta();
        blocks.push(`_${text}_`, "");
        break;
      case "eyebrow":
        flushMeta();
        pendingEyebrow = text;
        break;
      // A flow band or a questionnaire step. `---` before it gives Notion a
      // divider, which is what makes thirteen sections skimmable.
      case "section":
        flushMeta();
        // The preamble already ends in a rule; a second one before the first
        // section is an empty band in Notion.
        if (sections > 0) blocks.push("", "---", "");
        sections += 1;
        blocks.push("", `## ${text}`, "");
        if (pendingEyebrow) {
          blocks.push(`_${pendingEyebrow}_`, "");
          pendingEyebrow = null;
        }
        break;
      default:
        flushMeta();
        if (current === "h1" || current === "h2") {
          blocks.push("", `## ${text}`, "");
        } else if (current === "h3" || current === "h4") {
          blocks.push(`### ${text}`, "");
        } else if (current === "li") {
          blocks.push(`- ${text}`);
        } else if (current === "dt") {
          blocks.push(`**${text}**`, "");
        } else {
          blocks.push(text, "");
        }
    }

    current = null;
    currentMd = null;
  }

  const TOKEN = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN.exec(html)) !== null) {
    if (skipping === 0) buffer += html.slice(index, match.index);
    index = TOKEN.lastIndex;

    const [raw, rawName = "", attrs = ""] = match;
    const name = rawName.toLowerCase();
    const closing = raw.startsWith("</");

    if (closing) {
      const open = stack.pop();
      if (open?.md === SKIP) skipping = Math.max(0, skipping - 1);
      if (open && isBlock(open.name, open.md) && open.name === current) close();
      // A list that has ended gets its blank line, or Notion runs the next
      // paragraph into the final bullet.
      if (name === "ul" || name === "ol") blocks.push("");
      continue;
    }

    const md = /data-md="([^"]*)"/.exec(attrs)?.[1] ?? null;
    if (md === SKIP) skipping += 1;

    if (isBlock(name, md)) {
      // A block opening while another is unclosed means malformed input, or a
      // `data-md` span inside a paragraph; close the outer one rather than
      // swallowing its text.
      if (current) close();
      current = name;
      currentMd = md;
      buffer = "";
    }

    stack.push({ name, md });
  }

  if (skipping === 0) buffer += html.slice(index);
  if (current) close();
  flushMeta();

  return (
    blocks
      .join("\n")
      // Three or more blank lines is Markdown noise; two is a paragraph break.
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}

/**
 * The file's name, carrying the thing that makes one download different from
 * another: what the site is for.
 *
 * `intake-questions-coded-venture.md`, `intake-questions-coded-portfolio-film.md`,
 * `intake-questions-coded-every-kind.md`, `intake-questions-platform.md`. Kebab
 * case and lowercase so it is safe on any filesystem and readable in a folder
 * of a dozen of them.
 */
export function markdownFilename(parts: {
  track: "durable" | "showcase";
  kind: string;
  film: boolean;
  everyKind: boolean;
}): string {
  const track = parts.track === "showcase" ? "coded" : "platform";

  if (parts.track !== "showcase") return `intake-questions-${track}.md`;

  const view = parts.everyKind
    ? "every-kind"
    : parts.film
      ? `${parts.kind}-film`
      : parts.kind;

  return `intake-questions-${track}-${view}.md`;
}
