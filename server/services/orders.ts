import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/db/client";
import {
  engagementProducts,
  engagements,
  orders,
  products,
  type OrderRow,
} from "@/db/schema";
import { TERMS_VERSION } from "@/lib/legal/version";
import { findEngagementIdByContactEmail } from "./engagement";

/**
 * The ledger's one writer (M-FIN-1).
 *
 * Every payment Stripe reports becomes one `orders` row, connected to the
 * engagement it paid for. The webhook calls `recordOrder` while settling; the
 * backfill calls it over history; the admin's import calls it with a pasted
 * id. They all pass the Stripe object itself, so the row is built from
 * Stripe's fact and never from a form value or a query string.
 *
 * **Fill nulls, never overwrite.** The upsert is `coalesce(existing, incoming)`
 * on every column except `status` and `updated_at`, which take the incoming
 * value: status is Stripe's and may legitimately move (open → paid →
 * refunded). The one guard on it: Stripe does not order deliveries, and an
 * auto-charged invoice fires `invoice.finalized` (status `open`) and
 * `invoice.paid` within a second — so an incoming `open` or `failed` never
 * lands on a row that already has `paid_at`. So a replay, a backfill, and an
 * import can run over the same payment in any order and leave one correct
 * row — and an import can never erase the timestamp the webhook wrote first.
 *
 * Nothing here touches `engagements.paid_at`. That stays `fulfillDeposit`'s.
 */

type OrderStatus = OrderRow["status"];
type OrderLinkReason = OrderRow["linkReason"];

export type RecordOrderInput =
  | {
      kind: "checkout";
      session: Stripe.Checkout.Session;
      lineItems: Stripe.LineItem[];
      /**
       * When the payment is known to have settled just now (the webhook),
       * pass the moment. Absent, the session's creation time stands in —
       * within minutes of the card for a backfilled deposit.
       */
      settledAt?: Date;
    }
  | {
      kind: "invoice";
      invoice: Stripe.Invoice;
      /**
       * `invoice.payment_failed` leaves the invoice `open` in Stripe; the
       * handler names the failure explicitly so the ledger can show it.
       */
      status?: OrderStatus;
    };

export type RecordOrderOptions = {
  /** Set by the admin import; stamps `imported_at` / `imported_by`. */
  importedBy?: string;
};

export type RecordOrderResult = {
  order: OrderRow;
  /** True when the upsert inserted rather than found the row. */
  created: boolean;
};

export async function recordOrder(
  input: RecordOrderInput,
  options: RecordOrderOptions = {},
): Promise<RecordOrderResult> {
  const incoming =
    input.kind === "checkout"
      ? await fromCheckoutSession(input.session, input.settledAt)
      : await fromInvoice(input.invoice, input.status);

  const now = new Date();
  const imported = options.importedBy
    ? { importedAt: now, importedBy: options.importedBy }
    : {};

  const db = getDb();

  // `xmax = 0` is true only for a row this statement inserted — the one
  // portable way to tell insert from update inside a single upsert.
  const [row] = await db
    .insert(orders)
    .values({ ...incoming, ...imported, updatedAt: now })
    .onConflictDoUpdate({
      target: orders.stripeObjectId,
      set: {
        amountCents: sql`coalesce(${orders.amountCents}, excluded.amount_cents)`,
        currency: sql`coalesce(${orders.currency}, excluded.currency)`,
        engagementId: sql`coalesce(${orders.engagementId}, excluded.engagement_id)`,
        importedAt: sql`coalesce(${orders.importedAt}, excluded.imported_at)`,
        importedBy: sql`coalesce(${orders.importedBy}, excluded.imported_by)`,
        // The link and its reason travel together: an existing link keeps
        // its reason even if a later call would have matched differently.
        linkReason: sql`case when ${orders.engagementId} is null then excluded.link_reason else ${orders.linkReason} end`,
        paidAt: sql`coalesce(${orders.paidAt}, excluded.paid_at)`,
        // A late `open` (finalized) or `failed` (an earlier attempt) must not
        // regress a row the paid event already settled.
        status: sql`case when excluded.status in ('open', 'failed') and ${orders.paidAt} is not null then ${orders.status} else excluded.status end`,
        stripeCustomerEmail: sql`coalesce(${orders.stripeCustomerEmail}, excluded.stripe_customer_email)`,
        stripePaymentIntentId: sql`coalesce(${orders.stripePaymentIntentId}, excluded.stripe_payment_intent_id)`,
        taxCents: sql`coalesce(${orders.taxCents}, excluded.tax_cents)`,
        updatedAt: now,
      },
    })
    .returning({
      ...getTableColumns(orders),
      created: sql<boolean>`(xmax = 0)`,
    });

  if (!row) throw new Error("orders upsert returned no row.");

  const { created, ...order } = row;

  // Only a link the site's own Checkout carried may stamp a basket or fill
  // the engagement: it names the engagement that was actually charged. A
  // link by email or by hand says which client, not which basket, and an
  // add-on stamped on the wrong engagement would be a fabricated purchase.
  if (
    input.kind === "checkout" &&
    order.engagementId &&
    order.linkReason === "metadata" &&
    order.status === "paid"
  ) {
    await linkBasketRows(order, input.lineItems);
    await reconcileEngagement(order, input.session, input.lineItems);
  }

  return { order, created };
}

/** The Stripe id of a payment already in the ledger, or null. */
export async function findOrderByStripeObjectId(
  stripeObjectId: string,
): Promise<OrderRow | null> {
  const [row] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.stripeObjectId, stripeObjectId))
    .limit(1);

  return row ?? null;
}

// ---------------------------------------------------------------------------
// Building the incoming row
// ---------------------------------------------------------------------------

type IncomingOrder = typeof orders.$inferInsert;

async function fromCheckoutSession(
  session: Stripe.Checkout.Session,
  settledAt: Date | undefined,
): Promise<IncomingOrder> {
  const metadataEngagementId = session.metadata?.engagement_id?.trim() || null;
  const email = session.customer_details?.email ?? session.customer_email ?? null;

  const link = await resolveLink(metadataEngagementId, email);
  const status = checkoutStatus(session);

  return {
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? "cad",
    engagementId: link.engagementId,
    linkReason: link.reason,
    paidAt:
      status === "paid"
        ? (settledAt ?? new Date(session.created * 1000))
        : null,
    source: "checkout",
    status,
    stripeCustomerEmail: email,
    stripeObjectId: session.id,
    stripePaymentIntentId: idOf(session.payment_intent),
    taxCents: session.total_details?.amount_tax ?? null,
  };
}

async function fromInvoice(
  invoice: Stripe.Invoice,
  statusOverride: OrderStatus | undefined,
): Promise<IncomingOrder> {
  const metadataEngagementId = invoice.metadata?.engagement_id?.trim() || null;
  const email = invoice.customer_email ?? null;

  const link = await resolveLink(metadataEngagementId, email);
  const status = statusOverride ?? invoiceStatus(invoice);
  const paidAtSeconds = invoice.status_transitions?.paid_at ?? null;

  return {
    amountCents: invoice.total,
    currency: invoice.currency,
    engagementId: link.engagementId,
    linkReason: link.reason,
    paidAt: paidAtSeconds ? new Date(paidAtSeconds * 1000) : null,
    source: "invoice",
    status,
    stripeCustomerEmail: email,
    stripeObjectId: invoice.id,
    stripePaymentIntentId: invoicePaymentIntentId(invoice),
    taxCents:
      invoice.total_taxes?.reduce((sum, tax) => sum + tax.amount, 0) ?? null,
  };
}

/**
 * Metadata wins — a typed id is an explicit statement. Then the customer's
 * email (M-FIN-3). Then nothing: unlinked is a state the admin resolves.
 *
 * A metadata id that names no engagement records unlinked (FIN-1 § edge
 * states), not by email: the FK would reject the id, and a Checkout the site
 * created cannot carry one the site does not know unless the row was deleted
 * since — in which case the same address's other engagement did not buy
 * this, and must not be handed it.
 */
async function resolveLink(
  metadataEngagementId: string | null,
  email: string | null,
): Promise<{ engagementId: string | null; reason: OrderLinkReason }> {
  if (metadataEngagementId) {
    const [exists] = await getDb()
      .select({ id: engagements.id })
      .from(engagements)
      .where(eq(engagements.id, metadataEngagementId))
      .limit(1);

    if (exists) return { engagementId: exists.id, reason: "metadata" };

    console.warn(
      `[orders] metadata names engagement ${metadataEngagementId}, which does not exist — recording unlinked`,
    );
    return { engagementId: null, reason: null };
  }

  if (email) {
    const id = await findEngagementIdByContactEmail(email);
    if (id) return { engagementId: id, reason: "email" };
  }

  return { engagementId: null, reason: null };
}

function checkoutStatus(session: Stripe.Checkout.Session): OrderStatus {
  if (
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  ) {
    return "paid";
  }
  // Unpaid and the session can no longer be paid: nothing will ever settle.
  if (session.status === "expired") return "void";
  return "open";
}

function invoiceStatus(invoice: Stripe.Invoice): OrderStatus {
  switch (invoice.status) {
    case "paid":
      return "paid";
    case "void":
    case "uncollectible":
      return "void";
    default:
      // `draft` never reaches a webhook; `open` and anything unknown wait.
      return "open";
  }
}

/**
 * A Date inside a raw `sql` template reaches the driver unmapped and throws;
 * a mapped column would have serialized it. ISO text with a `::timestamptz`
 * cast is the one shape that survives both drizzle and postgres-js.
 */
function stamp(date: Date): string {
  return date.toISOString();
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * On this API version the payment intent hangs off `invoice.payments`, which
 * is only present when expanded. Absent, the column stays null and a later
 * import fills it — coalesce does the rest.
 */
function invoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  for (const payment of invoice.payments?.data ?? []) {
    const intent = payment.payment?.payment_intent;
    if (intent) return idOf(intent);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Linking what the payment bought
// ---------------------------------------------------------------------------

/**
 * Which basket rows this order bought, matched by Stripe price id against the
 * catalogue and scoped to the order's engagement.
 *
 * Fills `order_id` where null and stamps `paid_at` where null. A row the
 * webhook already stamped keeps its timestamp and gains only the link — which
 * is exactly the shape a hand-set `paid_at` with an unstamped basket leaves
 * behind, and exactly what the backfill is for.
 */
async function linkBasketRows(
  order: OrderRow,
  lineItems: Stripe.LineItem[],
): Promise<void> {
  const priceIds = lineItems
    .map((item) => item.price?.id ?? null)
    .filter((id): id is string => id !== null);

  if (priceIds.length === 0 || !order.engagementId) return;

  const db = getDb();

  const matched = await db
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.stripePriceId, priceIds));

  if (matched.length === 0) return;

  await db
    .update(engagementProducts)
    .set({
      orderId: sql`coalesce(${engagementProducts.orderId}, ${order.id})`,
      paidAt: sql`coalesce(${engagementProducts.paidAt}, ${stamp(order.paidAt ?? new Date())}::timestamptz)`,
    })
    .where(
      and(
        eq(engagementProducts.engagementId, order.engagementId),
        inArray(
          engagementProducts.productId,
          matched.map((product) => product.id),
        ),
      ),
    );
}

/**
 * Fills what `fulfillDeposit` would have written, where it is still null.
 *
 * Only for a session that bought the build: the payment intent on the
 * engagement is the deposit's, and paying the deposit is what accepts the
 * terms. An add-on session says nothing about either, and stamping terms
 * from it would be a fabricated acceptance. `paid_at` is not here.
 */
async function reconcileEngagement(
  order: OrderRow,
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
): Promise<void> {
  if (!order.engagementId) return;

  const priceIds = lineItems
    .map((item) => item.price?.id ?? null)
    .filter((id): id is string => id !== null);

  if (priceIds.length === 0) return;

  const db = getDb();

  const [build] = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(inArray(products.stripePriceId, priceIds), eq(products.kind, "build")),
    )
    .limit(1);

  if (!build) return;

  const acceptedAt = order.paidAt ?? new Date();
  const termsVersion = session.metadata?.terms_version?.trim() || TERMS_VERSION;

  await db
    .update(engagements)
    .set({
      stripePaymentIntentId: sql`coalesce(${engagements.stripePaymentIntentId}, ${order.stripePaymentIntentId})`,
      termsAcceptedAt: sql`coalesce(${engagements.termsAcceptedAt}, ${stamp(acceptedAt)}::timestamptz)`,
      termsVersion: sql`coalesce(${engagements.termsVersion}, ${termsVersion})`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(engagements.id, order.engagementId),
        // Fill only where at least one is missing, so a replay is a no-op
        // and `updated_at` does not churn on every redelivery.
        sql`(${engagements.stripePaymentIntentId} is null or ${engagements.termsAcceptedAt} is null or ${engagements.termsVersion} is null)`,
      ),
    );
}
