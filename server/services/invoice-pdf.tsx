/** @jsxRuntime automatic */
/** @jsxImportSource react */
import path from "node:path";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  formatInvoiceDate,
  invoiceSubtotalCents,
  type InvoiceDocument,
} from "@/lib/invoices/document";
import { PAPER, PAPER_FONT } from "@/lib/invoices/paper";
import { formatMoney } from "@/lib/intake/money";

/*
 * The pragmas above pin the automatic JSX runtime. This module is rendered
 * both by Next (which supplies it) and by `tsx` scripts (which fall back to
 * the classic `React.createElement` transform and would throw without it).
 */

/**
 * The PDF invoice — the document a client keeps, prints, and hands to a
 * bookkeeper.
 *
 * Rendered with `@react-pdf/renderer` rather than headless Chrome because
 * this runs inside a Stripe webhook: a Chromium cold start on the money path
 * is latency Stripe reads as a failure, and a ~50MB binary is a dependency
 * this repo would carry forever for one document. Pure JS, no binaries.
 *
 * The layout is the site's own grammar translated to paper (D-DOC-1): the
 * mono masthead with its gold hairline trailing right, display type for the
 * title and the total, mono for labels and every amount so the numbers align
 * as a ledger. Colors come from `lib/invoices/paper.ts` — no hex here.
 */

const FONT_DIR = path.join(process.cwd(), "server/assets/fonts");

let registered = false;

/**
 * Registers the vendored families, once per process.
 *
 * `next/font/google` cannot serve this path: it emits hashed `.woff2`, which
 * fontkit cannot read. The subset TTFs in `server/assets/fonts` exist for
 * exactly this reason — see the README beside them.
 */
function registerFonts(): void {
  if (registered) return;

  Font.register({
    family: PAPER_FONT.display,
    fonts: [
      { src: path.join(FONT_DIR, "SpaceGrotesk-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "SpaceGrotesk-Medium.ttf"), fontWeight: 500 },
    ],
  });

  Font.register({
    family: PAPER_FONT.body,
    fonts: [
      { src: path.join(FONT_DIR, "Manrope-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "Manrope-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "Manrope-SemiBold.ttf"), fontWeight: 600 },
    ],
  });

  Font.register({
    family: PAPER_FONT.mono,
    fonts: [
      { src: path.join(FONT_DIR, "JetBrainsMono-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "JetBrainsMono-Medium.ttf"), fontWeight: 500 },
    ],
  });

  // Business names and service descriptions are not prose to be hyphenated;
  // react-pdf hyphenates by default and would break "Detailing" across lines.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAPER.paper,
    color: PAPER.body,
    fontFamily: PAPER_FONT.body,
    fontSize: 10,
    paddingHorizontal: 56,
    paddingTop: 52,
    paddingBottom: 64,
  },

  mastheadRule: { borderTopWidth: 2, borderTopColor: PAPER.ink },
  masthead: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingTop: 11,
  },
  mastheadName: {
    color: PAPER.ink,
    fontFamily: PAPER_FONT.mono,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 2.1,
  },
  // The site's Eyebrow: a gold hairline running off to the right.
  mastheadHairline: { backgroundColor: PAPER.gold, flexGrow: 1, height: 1 },

  title: {
    color: PAPER.ink,
    fontFamily: PAPER_FONT.display,
    fontSize: 27,
    fontWeight: 500,
    letterSpacing: -0.4,
    marginTop: 34,
  },

  statusRow: { flexDirection: "row", marginTop: 9 },
  statusChip: {
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusChipPaid: { backgroundColor: PAPER.gold },
  statusChipDue: { borderColor: PAPER.hairline, borderWidth: 1 },
  statusText: { fontFamily: PAPER_FONT.mono, fontSize: 7.5, letterSpacing: 1.5 },
  statusTextPaid: { color: PAPER.ink, fontWeight: 500 },
  statusTextDue: { color: PAPER.dim },

  meta: {
    backgroundColor: PAPER.tint,
    borderRadius: 3,
    marginTop: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  metaLabel: {
    color: PAPER.dim,
    fontFamily: PAPER_FONT.mono,
    fontSize: 7.5,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  metaValue: { color: PAPER.ink, fontSize: 10, fontWeight: 500 },

  linesHeader: {
    borderBottomColor: PAPER.ink,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingBottom: 7,
  },
  columnLabel: {
    color: PAPER.dim,
    fontFamily: PAPER_FONT.mono,
    fontSize: 7.5,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  line: {
    borderBottomColor: PAPER.hairline,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  lineLabel: { color: PAPER.ink, flexShrink: 1, fontSize: 11, paddingRight: 24 },
  amount: {
    color: PAPER.ink,
    fontFamily: PAPER_FONT.mono,
    fontSize: 10,
  },

  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  totalsLabel: { color: PAPER.dim, fontSize: 10 },
  totalsValue: { color: PAPER.body, fontFamily: PAPER_FONT.mono, fontSize: 10 },

  grandRow: {
    borderTopColor: PAPER.ink,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 11,
  },
  grandLabel: {
    color: PAPER.ink,
    fontFamily: PAPER_FONT.display,
    fontSize: 13,
    fontWeight: 500,
  },
  grandValue: {
    color: PAPER.ink,
    fontFamily: PAPER_FONT.display,
    fontSize: 15,
    fontWeight: 500,
  },

  payBlock: { marginTop: 26 },
  payLabel: {
    color: PAPER.dim,
    fontFamily: PAPER_FONT.mono,
    fontSize: 7.5,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  payUrl: { color: PAPER.ink, fontSize: 9.5, marginTop: 5 },

  note: { color: PAPER.body, fontSize: 10, lineHeight: 1.6, marginTop: 26 },

  footer: {
    borderTopColor: PAPER.hairline,
    borderTopWidth: 1,
    bottom: 38,
    left: 56,
    paddingTop: 10,
    position: "absolute",
    right: 56,
  },
  footerText: {
    color: PAPER.dim,
    fontFamily: PAPER_FONT.mono,
    fontSize: 7.5,
    letterSpacing: 0.9,
    lineHeight: 1.7,
  },
});

function InvoicePage({ doc }: { doc: InvoiceDocument }) {
  const subtotal = invoiceSubtotalCents(doc);
  const money = (cents: number) => formatMoney(cents, doc.currency);

  return (
    <Document
      title={`${doc.title} — ${doc.billToName}`}
      author="Agora Network Technologies Inc."
      subject={doc.reference}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.mastheadRule} />
        <View style={styles.masthead}>
          <Text style={styles.mastheadName}>
            AGORA · NETWORK TECHNOLOGIES
          </Text>
          <View style={styles.mastheadHairline} />
        </View>

        <Text style={styles.title}>{doc.title}</Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusChip,
              doc.paid ? styles.statusChipPaid : styles.statusChipDue,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                doc.paid ? styles.statusTextPaid : styles.statusTextDue,
              ]}
            >
              {doc.paid ? "PAID IN FULL" : "DUE ON RECEIPT"}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Billed to</Text>
            <Text style={styles.metaValue}>
              {doc.billToName}
              {doc.billToContact ? ` · ${doc.billToContact}` : ""}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>
              {formatInvoiceDate(doc.issuedAt)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reference</Text>
            <Text style={styles.metaValue}>{doc.reference}</Text>
          </View>
          {doc.gstNumber ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>GST / HST no.</Text>
              <Text style={styles.metaValue}>{doc.gstNumber}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.linesHeader}>
          <Text style={styles.columnLabel}>Description</Text>
          <Text style={styles.columnLabel}>Amount</Text>
        </View>

        {doc.lines.map((line, index) => (
          <View key={`${line.label}-${index}`} style={styles.line}>
            <Text style={styles.lineLabel}>{line.label}</Text>
            <Text style={styles.amount}>{money(line.amountCents)}</Text>
          </View>
        ))}

        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>{money(subtotal)}</Text>
        </View>

        {doc.taxCents !== null ? (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>GST</Text>
            <Text style={styles.totalsValue}>{money(doc.taxCents)}</Text>
          </View>
        ) : null}

        <View style={styles.grandRow}>
          <Text style={styles.grandLabel}>
            {doc.paid ? "Total paid" : "Total due"}
          </Text>
          <Text style={styles.grandValue}>{money(doc.totalCents)}</Text>
        </View>

        {!doc.paid && doc.payUrl ? (
          <View style={styles.payBlock}>
            <Text style={styles.payLabel}>Pay online</Text>
            <Text style={styles.payUrl}>{doc.payUrl}</Text>
          </View>
        ) : null}

        {doc.note ? <Text style={styles.note}>{doc.note}</Text> : null}

        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>
            AGORA NETWORK TECHNOLOGIES INC. · BRITISH COLUMBIA, CANADA
          </Text>
          <Text style={styles.footerText}>HELLO@TAYLORAUCOIN.COM</Text>
        </View>
      </Page>
    </Document>
  );
}

/** The invoice as PDF bytes, ready to attach or upload. */
export async function renderInvoicePdf(doc: InvoiceDocument): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(<InvoicePage doc={doc} />);
}
