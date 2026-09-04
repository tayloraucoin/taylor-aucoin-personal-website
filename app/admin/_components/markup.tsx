/**
 * The one renderer for both operator documents: the SOP dialog's in-code
 * string (`lib/crm/sop.ts`) and the call sheet on disk
 * (`docs/crm/CALL-SHEET.md`, D-CRM-28). No markdown dependency — the grammar
 * below is exactly what those two documents use and nothing more: `#`/`##`
 * headings, `---` rules, `-` lists, `>` blockquotes, pipe tables, inline
 * `**bold**` and `` `code` ``, and paragraphs. Anything else renders as
 * plain text rather than throwing — an operator document must never fail to
 * display because someone used a syntax this renderer doesn't know.
 *
 * No "use client" here on purpose: nothing below touches state, an effect,
 * or a browser API, so this renders equally well from a client dialog (the
 * SOP) or a server-rendered column (the call sheet) without pulling either
 * consumer's boundary onto the other.
 */

const TABLE_SEPARATOR = /^\|(\s*:?-+:?\s*\|)+$/;

/** Inline `**bold**` and `` `code` ``, in source order. */
function inline(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-medium text-(--color-ink)">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="font-(family-name:--font-mono) text-xs text-(--color-c2)"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderBlock(text: string, key: string) {
  if (text === "") return null;

  if (text === "---") {
    return <hr key={key} className="border-(--color-line-soft)" />;
  }

  if (text.startsWith("# ")) {
    return (
      <h2
        key={key}
        className="font-(family-name:--font-display) text-lg text-(--color-ink)"
      >
        {inline(text.slice(2), key)}
      </h2>
    );
  }

  if (text.startsWith("## ")) {
    return (
      <h3
        key={key}
        className="mt-2 font-(family-name:--font-display) text-base text-(--color-ink)"
      >
        {inline(text.slice(3), key)}
      </h3>
    );
  }

  const lines = text.split("\n");

  if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
    return (
      <ul
        key={key}
        className="flex flex-col gap-1.5 pl-4 text-sm leading-relaxed text-(--color-body)"
      >
        {lines.map((line, index) => (
          <li
            key={`${key}-${index}`}
            className="list-disc marker:text-(--color-dim)"
          >
            {inline(line.slice(2), `${key}-${index}`)}
          </li>
        ))}
      </ul>
    );
  }

  if (lines.length > 0 && lines.every((line) => line.startsWith("> "))) {
    return (
      <blockquote
        key={key}
        className="flex flex-col gap-1 border-l-2 border-(--color-c2)/40 pl-3 text-sm leading-relaxed text-(--color-ink) italic"
      >
        {lines.map((line, index) => (
          <p key={`${key}-${index}`}>
            {inline(line.slice(2), `${key}-${index}`)}
          </p>
        ))}
      </blockquote>
    );
  }

  if (
    lines.length >= 2 &&
    lines[0]!.trim().startsWith("|") &&
    TABLE_SEPARATOR.test(lines[1]!.trim())
  ) {
    const header = tableCells(lines[0]!);
    const rows = lines.slice(2).map(tableCells);

    return (
      <div key={key} className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {header.map((cell, index) => (
                <th
                  key={`${key}-h${index}`}
                  scope="col"
                  className="border-b border-(--color-line) px-3 py-2 text-left text-xs tracking-wide text-(--color-dim) uppercase"
                >
                  {inline(cell, `${key}-h${index}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${key}-r${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${key}-r${rowIndex}-${cellIndex}`}
                    className="border-b border-(--color-line-soft)/50 px-3 py-2 align-top leading-relaxed text-(--color-body)"
                  >
                    {inline(cell, `${key}-r${rowIndex}-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <p key={key} className="text-sm leading-relaxed text-(--color-body)">
      {inline(text.replace(/\n/g, " "), key)}
    </p>
  );
}

export function Markup({ source }: { source: string }) {
  if (source === "") return null;

  const blocks = source.split(/\n{2,}/);

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => renderBlock(block.trim(), `b${index}`))}
    </div>
  );
}
