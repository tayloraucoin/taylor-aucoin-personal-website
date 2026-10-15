import type { Metadata } from "next";
import { Albert_Sans, Fragment_Mono, Instrument_Sans } from "next/font/google";
import Analytics from "@/components/analytics/Analytics";
import SiteChrome from "@/components/ui/SiteChrome";
import SiteHeader from "@/components/ui/SiteHeader";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";
import "./globals.css";

// Three faces, three jobs (brand kit §3).
const display = Instrument_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-instrument",
  display: "swap",
});
const body = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-albert",
  display: "swap",
});
const code = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fragment",
  display: "swap",
});

/**
 * Both colour directions are live until Taylor chooses on the real site
 * (brand kit §0). `?direction=b` switches to Patina and is remembered;
 * `?direction=a` switches back. Runs before paint so the accent never flashes.
 */
const DIRECTION_SCRIPT = `(function(){try{var k="ta-direction",q=new URLSearchParams(location.search).get("direction");if(q==="a"||q==="b")localStorage.setItem(k,q);var d=localStorage.getItem(k);if(d==="b")document.documentElement.setAttribute("data-direction","b");}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.metaDescription,
  // Routes that set their own `openGraph`/`twitter` replace these wholesale;
  // routes that don't (the home page) inherit them.
  ...socialCard({
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.metaDescription,
  }),
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${code.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: DIRECTION_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <SiteChrome>
            <SiteHeader />
          </SiteChrome>
          {children}
          {modal}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
