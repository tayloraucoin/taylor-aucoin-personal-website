import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import Analytics from "@/components/analytics/Analytics";
import SiteChrome from "@/components/ui/SiteChrome";
import SiteHeader from "@/components/ui/SiteHeader";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-manrope",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

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
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <SiteChrome>
          <SiteHeader />
        </SiteChrome>
        {children}
        {modal}
        <Analytics />
      </body>
    </html>
  );
}
