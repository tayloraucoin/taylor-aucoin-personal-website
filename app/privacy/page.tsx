import type { Metadata } from "next";
import ConsentControl from "@/components/analytics/ConsentControl";
import RootField from "@/components/field/RootField";
import Footer from "@/components/sections/Footer";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";

const description =
  "What this site measures, what it does not, and how to turn it off. Google Analytics only, no advertising, no data sold.";

export const metadata: Metadata = {
  title: "Privacy",
  description,
  ...socialCard({ title: `Privacy — ${SITE.name}`, description }),
};

/** Rows share the hairline idiom used by How-I-Work and About. */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-(--color-faint) py-5 md:grid md:grid-cols-[180px_1fr] md:gap-8">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[.24em] text-(--color-c2) md:mb-0">
        {label}
      </span>
      <div className="max-w-[62ch] text-[14px] leading-[1.65] text-(--color-body)">
        {children}
      </div>
    </div>
  );
}

/**
 * Minimal disclosure page. Exists because Google's Analytics terms require
 * telling visitors that GA is running, and because GDPR Art. 13 expects it in
 * writing for anyone served in the EU/EEA/UK.
 *
 * Copy is placeholder pending Taylor's pass. Keep it dry — this is a
 * disclosure, not a trust-badge page.
 */
export default function PrivacyPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      <RootField />

      <div className="mb-6 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>What this site measures</span>
        <span
          aria-hidden
          className="h-px max-w-[220px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
          }}
        />
      </div>

      <h1 className="mb-8 font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-.03em] text-(--color-ink)">
        Privacy
      </h1>

      <p className="mb-10 max-w-[62ch] text-[15px] leading-[1.65] text-(--color-body)">
        This is a personal portfolio site. It runs one analytics tool, shows no
        advertising, has no account system, and sells nothing to anyone.
      </p>

      <Row label="What runs">
        Google Analytics 4, and nothing else. There is no advertising pixel, no
        session recorder, no heatmap, no chat widget, no A/B testing tool.
      </Row>

      <Row label="What it collects">
        Pages viewed, approximate location from IP (city level, not the IP
        itself), device and browser type, and referring site. Enhanced
        Measurement is on, which adds scroll depth, outbound link clicks, site
        search, and file downloads such as the résumé PDF. None of it is tied to
        a name, and there is no account here to tie it to.
      </Row>

      <Row label="Who sees it">
        Taylor, in aggregate. Google processes the data as a service provider
        under its own terms. It is not sold, shared for advertising, or passed
        to anyone else.
      </Row>

      <Row label="When you get asked">
        Visitors in places whose law requires prior consent — the EU and EEA,
        the UK, and Quebec — are asked before anything loads, and the script is
        not inserted until they accept. Everywhere else, analytics runs by
        default and can be turned off below. Global Privacy Control is honoured
        everywhere, regardless of location.
      </Row>

      <Row label="Retention">
        Google Analytics is set to its default retention window for event data.
        Aggregate reports persist beyond that.
      </Row>

      <Row label="Turning it off">
        Use the control below, send Global Privacy Control from your browser, or
        block{" "}
        <span className="font-mono text-[13px]">googletagmanager.com</span>
        . Any of the three works; none of them breaks the site.
        <ConsentControl />
      </Row>

      <Row label="Contact">
        <a
          href={`mailto:${SITE.email}`}
          className="text-(--color-c2) underline underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          {SITE.email}
        </a>
      </Row>

      <Footer />
    </main>
  );
}
