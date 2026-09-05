import { zipSync, strToU8 } from "fflate";

/**
 * Fixtures for the source-reading eval (PORT-21), built at run time.
 *
 * **Nothing here is committed as a binary and nothing here is real.** Every
 * fixture is generated from the text beside it, so the eval knows the true
 * contents of the file it is grading — which is the only way to grade a
 * transcription for invention rather than for plausibility. It also means no
 * opaque blob enters the repository, and house law about fabricated client
 * material is satisfied by construction: the business below does not exist,
 * its domain is reserved, and its numbers are invented.
 *
 * The one case that cannot be built this way is a scan. A photographed page
 * has artifacts no generator reproduces, and a real one cannot be committed,
 * so it is graded by hand — see the README.
 */

/** The truth every generated fixture is built from and graded against. */
export const DECK_PAGES: readonly (readonly string[])[] = [
  [
    "Marrow & Vane",
    "A two-person brand studio in Halifax, Nova Scotia.",
    "Capability deck, spring",
  ],
  [
    "What we do",
    "We build identities for food producers and small manufacturers.",
    "Naming, marks, packaging, and the words on the box.",
  ],
  [
    "How we work",
    "Two people, start to finish. No account layer.",
    "Most projects run eight to twelve weeks.",
  ],
  [
    "Who we work with",
    "Producers who make one thing well and sell it themselves.",
    "We are not an agency and we do not pitch.",
  ],
  [
    "Recent work",
    "Bell & Bough, a cider maker in the Annapolis Valley.",
    "Tidewater Salt, packaging for eleven products.",
  ],
  [
    "What it costs",
    "Identity work starts at $18,000.",
    "Packaging is quoted per product after a call.",
  ],
  [
    "Where we are",
    "Halifax, Nova Scotia. We work across the Maritimes and remotely.",
    "hello@marrowandvane.example",
  ],
  [
    "What we need from you",
    "One person who can decide, and an hour a week.",
    "Everything else is ours.",
  ],
];

/** Every line of the deck, in reading order. The recall key. */
export const DECK_LINES: readonly string[] = DECK_PAGES.flat();

/* ── Office fixtures ─────────────────────────────────────────────────────────
   Minimal but structurally real OOXML: the reader is pointed at the same part
   names and the same leaf elements a file from Word or PowerPoint carries, so
   a change that breaks real documents breaks these too. A fixture that faked
   the shape would pass while the reader failed on everything a client sends.
   ──────────────────────────────────────────────────────────────────────────── */

function paragraph(runs: string[]): string {
  return `<w:p>${runs.map((run) => `<w:r><w:t xml:space="preserve">${run}</w:t></w:r>`).join("<w:r><w:tab/></w:r>")}</w:p>`;
}

/** What the DOCX fixture should read back as, exactly. */
export const DOCX_EXPECTED = [
  "Marrow & Vane — <capability> deck",
  "Founded\t2019",
  "Based in\tHalifax, Nova Scotia",
  "Team\tTwo people",
].join("\n");

/**
 * A `.docx` whose body includes an ampersand, an angle bracket, and a
 * tab-separated table row — the three things that break a naive reader.
 */
export function buildDocx(): Uint8Array {
  const body = [
    paragraph(["Marrow &amp; Vane — &lt;capability&gt; deck"]),
    paragraph(["Founded", "2019"]),
    paragraph(["Based in", "Halifax, Nova Scotia"]),
    paragraph(["Team", "Two people"]),
    // A field code, which carries text a strip-every-tag reader would collect
    // as prose. It must not appear in the output.
    `<w:p><w:r><w:instrText>PAGE \\* MERGEFORMAT</w:instrText></w:r></w:p>`,
  ].join("");

  return zipSync({
    "[Content_Types].xml": strToU8('<?xml version="1.0"?><Types/>'),
    "word/document.xml": strToU8(
      `<?xml version="1.0"?><w:document xmlns:w="x"><w:body>${body}</w:body></w:document>`,
    ),
  });
}

/** What the PPTX fixture should read back as, exactly. */
export const PPTX_EXPECTED = [
  "--- slide 1 ---\nFirst slide",
  "--- slide 2 ---\nSecond slide",
  "--- slide 10 ---\nTenth slide",
].join("\n\n");

/**
 * A `.pptx` with slides 1, 2, and 10 — the ordering trap. `slide10` sorts
 * before `slide2` as a string, which would hand the run a deck in the wrong
 * order and never say so.
 */
export function buildPptx(): Uint8Array {
  const slide = (text: string) =>
    strToU8(
      `<?xml version="1.0"?><p:sld xmlns:a="x"><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:sld>`,
    );

  return zipSync({
    "[Content_Types].xml": strToU8('<?xml version="1.0"?><Types/>'),
    "ppt/slides/slide1.xml": slide("First slide"),
    "ppt/slides/slide2.xml": slide("Second slide"),
    "ppt/slides/slide10.xml": slide("Tenth slide"),
  });
}

/** A file that is not any of the readable kinds. Bytes, not a real Keynote. */
export function buildOpaque(): Uint8Array {
  return new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
}
