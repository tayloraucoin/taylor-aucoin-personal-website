import {
  Banknote,
  ClipboardList,
  ContactRound,
  CreditCard,
  FileText,
  Handshake,
  Images,
  ListChecks,
  PhoneCall,
  RefreshCw,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { adminRoutes } from "@/lib/routes";

/**
 * One nav entry. `ready: false` renders the label without a link.
 *
 * Items are listed before they exist on purpose: the shape of the tool is
 * useful information, and a dimmed label is honest where a link to a 404 is
 * not. Flip `ready` as each surface lands — that flag is the only edit a later
 * ticket needs to make here (D-ADM-7, M-ADM-5).
 */
export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  ready: boolean;
};

export type AdminNavSection = {
  label: string;
  icon: LucideIcon;
  items: AdminNavItem[];
};

/**
 * The admin's taxonomy, adapted from Conscious Connections' `constants.ts`.
 *
 * Two ordering rules, and they answer different questions (D-ADM-2):
 *
 * - **Sections follow the flow of a job**, not the alphabet. A name arrives as
 *   a lead, is asked questions by the intake, becomes an engagement that gets
 *   built, and settles as money. CC's sections are alphabetical because nothing
 *   sequences them; ours are sequenced, and sorting Finances above Intake would
 *   describe a business that does not exist. Taylor's call.
 * - **Items inside a section are alphabetical**, which is CC's rule verbatim.
 *   Within one stage there is no order to preserve, so the alphabet is the
 *   cheapest thing to agree on and the easiest to scan.
 *
 * Every href comes from `adminRoutes`. A path written inline here is a path
 * that drifts from the one the page is served at.
 */
export const NAV_SECTIONS: AdminNavSection[] = [
  {
    label: "Leads",
    icon: ContactRound,
    items: [
      {
        title: "Call queue",
        href: adminRoutes.queue,
        icon: PhoneCall,
        ready: true,
      },
      {
        title: "Leads",
        href: adminRoutes.leads,
        icon: ContactRound,
        ready: true,
      },
      {
        title: "Scoreboard",
        href: adminRoutes.scoreboard,
        icon: Trophy,
        ready: true,
      },
      { title: "Sync", href: adminRoutes.sync, icon: RefreshCw, ready: true },
      {
        title: "Transcripts",
        href: adminRoutes.transcripts,
        icon: FileText,
        ready: true,
      },
    ],
  },
  {
    label: "Intake",
    icon: ClipboardList,
    items: [
      {
        // "Example sites", not "Taste gallery": it matches the type name, and —
        // the reason that decides it — it matches the words a client reads on
        // the step when a set is absent. One vocabulary, tool to client.
        title: "Example sites",
        href: adminRoutes.intakeExamples,
        icon: Images,
        ready: true,
      },
      {
        title: "Questions",
        href: adminRoutes.intakeQuestions,
        icon: ListChecks,
        ready: true,
      },
    ],
  },
  {
    label: "Engagements",
    icon: Handshake,
    items: [
      {
        title: "Engagements",
        href: adminRoutes.engagements,
        icon: Handshake,
        ready: true,
      },
    ],
  },
  {
    label: "Finances",
    icon: CreditCard,
    items: [
      {
        title: "Revenue",
        href: adminRoutes.revenue,
        icon: Banknote,
        // No ticket yet. Named because Taylor named it as the fourth stage.
        ready: false,
      },
    ],
  },
];

/**
 * Exact match, or a descendant.
 *
 * The plain `startsWith(href)` this replaces marked `/admin/leads` active for
 * any route merely sharing its prefix. Carried from CC's `isPathActive`
 * (M-ADM-3).
 */
export function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
