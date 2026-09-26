import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagementProducts, engagements, products } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import type { ExtrasItem } from "@/lib/extras/cart";
import {
  ADDON_REQUIRES,
  includedBy,
  withoutBundled,
} from "@/lib/intake/addon-bundles";
import { showcaseIntakeRoutes } from "@/lib/routes";
import { extrasCheckoutInput } from "@/lib/validators/extras";
import { EXTRA_PAGES_MAX, SEO_POSTS_MAX } from "@/lib/validators/intake";
import {
  createExtrasCheckout,
  isBuildSettled,
  type ExtrasLine,
} from "./deposit";
import { findEngagementById, type Engagement } from "./engagement";
import {
  findSellableProductByKey,
  listInvoiceableProducts,
  type InvoiceableProduct,
} from "./products";

/**
 * The add-ons page (FIN-8): one engagement's self-serve checkout, reachable
 * at a static URL — `/websites/coded/intake/add-ons?engagement=<id>` with an
 * optional `&add=` pre-selection — for as long as their build is settled.
 * Taylor puts the URL wherever the client will see it (a final review page,
 * an email) once, and never writes it again.
 *
 * This file owns what the page may sell and what it shows. The money
 * mechanics — the price check against Stripe, the session, the basket rows,
 * settlement — are `deposit.ts`'s; the ledger is `orders.ts`'s. Nothing here
 * writes `engagements` or `orders`.
 *
 * The charge law holds as amended (M-PORT-4, M-PORT-38, D-FIN-1): every
 * charge is started by the client, on hosted Checkout, at the catalogue's
 * published price. The URL only pre-ticks; nothing it says is trusted.
 *
 * The engagement id is the address (M-FIN-7). It is unguessable, and what it
 * opens is deliberately small: the business name, which rows they own, and
 * a way to pay for more with their own card. No email, no contact name, no
 * answers, no amounts paid.
 */

/**
 * One catalogue row as the page sees it, for one engagement.
 *
 * `owned` — a one-time row this engagement has paid for; `includedWith` —
 * the name of an owned row that already includes it (the admin panel
 * includes its Supabase setup). Either way it cannot be sold again.
 * `counted` rows take a quantity (pages, posts); every other row is one.
 */
export type ExtrasRow = {
  key: string;
  name: string;
  description: string;
  kind: InvoiceableProduct["kind"];
  unitCents: number;
  sellable: boolean;
  owned: boolean;
  includedWith: string | null;
  counted: boolean;
  max: number;
  /** A row this one needs, owned or in the same cart (a post needs the blog). */
  requires: string | null;
};

/** One-time rows this engagement has paid for, by key. */
async function ownedOnceKeys(engagementId: string): Promise<Set<string>> {
  const rows = await getDb()
    .select({ key: products.key })
    .from(engagementProducts)
    .innerJoin(products, eq(engagementProducts.productId, products.id))
    .where(
      and(
        eq(engagementProducts.engagementId, engagementId),
        isNotNull(engagementProducts.paidAt),
        eq(engagementProducts.repeatable, false),
      ),
    );
  return new Set(rows.map((row) => row.key));
}

function maxFor(product: InvoiceableProduct): number {
  if (!product.repeatable || product.kind !== "addon") return 1;
  return product.key.endsWith("seo_post") ? SEO_POSTS_MAX : EXTRA_PAGES_MAX;
}

/** Everything this engagement's track sells after the build, with its state. */
async function catalogueFor(
  engagement: Pick<Engagement, "id" | "track">,
): Promise<{ rows: ExtrasRow[]; owned: Set<string> }> {
  const [catalogue, owned] = await Promise.all([
    listInvoiceableProducts(engagement.track),
    ownedOnceKeys(engagement.id),
  ]);
  const nameOf = (key: string) =>
    catalogue.find((row) => row.key === key)?.name ?? key;

  const rows = catalogue.map((product) => {
    const owner = includedBy(product.key, owned);
    return {
      key: product.key,
      name: product.name,
      description: product.description,
      kind: product.kind,
      unitCents: product.priceCents,
      sellable: product.stripePriceId !== null,
      owned: !product.repeatable && owned.has(product.key),
      includedWith: owner ? nameOf(owner) : null,
      counted: product.repeatable && product.kind === "addon",
      max: maxFor(product),
      requires: ADDON_REQUIRES[product.key] ?? null,
    };
  });

  return { rows, owned };
}

/**
 * The one check between a cart and a charge: every line a row this track
 * sells, sellable on this tier, not owned, in its quantity bounds, with its
 * prerequisite present, and nothing billed twice for a bundle. Returns a
 * sentence on refusal.
 */
function checkCart(
  rows: readonly ExtrasRow[],
  requested: readonly ExtrasItem[],
  ownedKeys: ReadonlySet<string>,
):
  | { ok: true; items: { row: ExtrasRow; quantity: number }[] }
  | { ok: false; message: string } {
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const keys = withoutBundled(requested.map((item) => item.key));
  const items: { row: ExtrasRow; quantity: number }[] = [];

  for (const item of requested) {
    if (!keys.includes(item.key)) continue;
    const row = byKey.get(item.key);
    if (!row) {
      return { ok: false, message: "Something in this cart isn't on offer." };
    }
    if (!row.sellable) {
      return { ok: false, message: `${row.name} can't be charged yet.` };
    }
    if (row.owned || row.includedWith) {
      return { ok: false, message: `${row.name} is already yours.` };
    }
    if (item.quantity < 1 || item.quantity > row.max) {
      return {
        ok: false,
        message: `That quantity for ${row.name} won't work.`,
      };
    }
    if (
      row.requires &&
      !ownedKeys.has(row.requires) &&
      !keys.includes(row.requires)
    ) {
      const needs = byKey.get(row.requires)?.name ?? row.requires;
      return { ok: false, message: `${row.name} needs the ${needs}.` };
    }
    items.push({ row, quantity: item.quantity });
  }

  if (items.length === 0) return { ok: false, message: "Nothing to pay for." };
  return { ok: true, items };
}

/** The engagement behind an id, or null when it is unknown or unsettled. */
async function settledEngagement(
  engagementId: string,
): Promise<Engagement | null> {
  try {
    const engagement = await findEngagementById(engagementId);
    return isBuildSettled(engagement) ? engagement : null;
  } catch {
    return null;
  }
}

/* ── The page ─────────────────────────────────────────────────────────── */

export type PricedLine = {
  key: string;
  name: string;
  quantity: number;
  unitCents: number;
};

export type ExtrasPage =
  | { state: "unavailable" }
  | { state: "confirming" }
  | {
      state: "paid";
      businessName: string;
      currency: string;
      bought: PricedLine[];
    }
  | {
      state: "open";
      businessName: string;
      currency: string;
      rows: ExtrasRow[];
      /** The URL's pre-selection, kept to rows that can actually be bought. */
      preselected: ExtrasItem[];
      ownedKeys: string[];
    };

/**
 * The page's read. An unknown id and an unsettled build render the same
 * quiet screen, so the page never says whether an id exists.
 *
 * With `sessionId` (Stripe's return), the page shows that payment's rows
 * once the webhook has stamped them, and the confirming screen until then.
 * The session must be this engagement's; any other id reads as confirming
 * and never shows someone else's purchase.
 */
export async function loadExtrasPage(input: {
  engagementId: string;
  preselect: ExtrasItem[];
  sessionId?: string;
}): Promise<ExtrasPage> {
  const engagement = await settledEngagement(input.engagementId);
  if (!engagement) return { state: "unavailable" };

  if (input.sessionId) {
    const bought = await getDb()
      .select({
        key: products.key,
        name: products.name,
        quantity: engagementProducts.quantity,
        unitCents: engagementProducts.amountCents,
      })
      .from(engagementProducts)
      .innerJoin(products, eq(engagementProducts.productId, products.id))
      .where(
        and(
          eq(engagementProducts.engagementId, engagement.id),
          eq(engagementProducts.checkoutSessionId, input.sessionId),
          isNotNull(engagementProducts.paidAt),
        ),
      )
      .orderBy(products.sortOrder);

    return bought.length > 0
      ? {
          state: "paid",
          businessName: engagement.businessName,
          currency: engagement.currency,
          bought,
        }
      : { state: "confirming" };
  }

  const { rows, owned } = await catalogueFor(engagement);
  const buyable = new Set(
    rows
      .filter((row) => row.sellable && !row.owned && !row.includedWith)
      .map((row) => row.key),
  );

  return {
    state: "open",
    businessName: engagement.businessName,
    currency: engagement.currency,
    rows,
    preselected: input.preselect
      .filter((item) => buyable.has(item.key))
      .map((item) => {
        const max = rows.find((row) => row.key === item.key)?.max ?? 1;
        return { key: item.key, quantity: Math.min(item.quantity, max) };
      }),
    ownedKeys: [...owned],
  };
}

/**
 * The page's pay press: re-reads the engagement, re-checks the cart against
 * its own catalogue and basket, and opens Checkout. The browser sends keys
 * and counts — never a price.
 */
export async function startExtrasCheckout(input: {
  engagementId: string;
  items: ExtrasItem[];
}): Promise<
  | { status: "redirect"; url: string }
  | { status: "in_flight" }
  | { status: "refused"; message: string }
> {
  const parsed = extrasCheckoutInput.safeParse(input);
  if (!parsed.success) {
    return {
      status: "refused",
      message: "That cart didn't make sense. Reload and try again.",
    };
  }

  const engagement = await settledEngagement(parsed.data.engagementId);
  if (!engagement) {
    return { status: "refused", message: "This page can't take a payment." };
  }

  const { rows, owned } = await catalogueFor(engagement);
  const cart = checkCart(rows, parsed.data.items, owned);
  if (!cart.ok) return { status: "refused", message: cart.message };

  const lines: ExtrasLine[] = [];
  for (const { row, quantity } of cart.items) {
    const product = await findSellableProductByKey(row.key);
    if (!product) {
      return {
        status: "refused",
        message: `${row.name} can't be charged yet.`,
      };
    }
    lines.push({ product, quantity });
  }

  // Back to the same page, which reads this session's rows. The literal
  // `{CHECKOUT_SESSION_ID}` is Stripe's own placeholder, filled on return.
  const origin = requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
  const page = `${origin}${showcaseIntakeRoutes.addOns(engagement.id)}`;

  const opened = await createExtrasCheckout({
    engagement,
    lines,
    successUrl: `${page}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${page}&canceled=1`,
  });

  return opened.status === "in_flight"
    ? { status: "in_flight" }
    : { status: "redirect", url: opened.url };
}

/* ── Admin: the link builder ──────────────────────────────────────────── */

export type ExtrasEngagement = Pick<
  Engagement,
  "id" | "businessName" | "contactEmail" | "track" | "currency"
>;

/** Engagements an add-ons link works for: the build settled, paid or waived. */
export async function listExtrasEngagements(): Promise<ExtrasEngagement[]> {
  return getDb()
    .select({
      id: engagements.id,
      businessName: engagements.businessName,
      contactEmail: engagements.contactEmail,
      track: engagements.track,
      currency: engagements.currency,
    })
    .from(engagements)
    .where(
      sql`(${engagements.paidAt} is not null or ${engagements.depositRequired} = false)`,
    )
    .orderBy(desc(engagements.createdAt));
}

/** One engagement's rows, for the builder's ticks. Null if unsettled. */
export async function loadExtrasBuilder(engagementId: string): Promise<{
  engagement: ExtrasEngagement;
  rows: ExtrasRow[];
  origin: string;
} | null> {
  const engagement = await settledEngagement(engagementId);
  if (!engagement) return null;

  const { rows } = await catalogueFor(engagement);
  return {
    engagement: {
      id: engagement.id,
      businessName: engagement.businessName,
      contactEmail: engagement.contactEmail,
      track: engagement.track,
      currency: engagement.currency,
    },
    rows,
    origin: requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, ""),
  };
}
