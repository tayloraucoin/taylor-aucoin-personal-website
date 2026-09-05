/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Document, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { DECK_PAGES } from "./fixtures";

/*
 * The pragmas above pin the automatic JSX runtime, for the reason
 * `invoice-pdf.tsx` carries them: a `tsx` script falls back to the classic
 * transform and would throw without them.
 *
 * Split from `fixtures.ts` so the eval's pure mode — the one that runs
 * constantly and costs nothing — never loads a PDF renderer it has no use for.
 */

/** A multi-page PDF with a text layer, built from `DECK_PAGES`. */
export async function buildDeckPdf(): Promise<Uint8Array> {
  const buffer = await renderToBuffer(
    <Document>
      {DECK_PAGES.map((lines, index) => (
        <Page key={index} size="A4" style={{ padding: 48 }}>
          <View>
            {lines.map((line, lineIndex) => (
              <Text key={lineIndex} style={{ fontSize: lineIndex === 0 ? 24 : 12, marginBottom: 12 }}>
                {line}
              </Text>
            ))}
          </View>
        </Page>
      ))}
    </Document>,
  );
  return new Uint8Array(buffer);
}
