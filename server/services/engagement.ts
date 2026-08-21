import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagements, type EngagementRow } from "@/db/schema";
import { readEnv, requireEnv } from "@/lib/env";
import { intakeRoutes } from "@/lib/routes";
import type { EngagementStatus, IntakeStepKey } from "@/lib/types/intake";
import {
  createEngagementInput,
  type CreateEngagementInput,
} from "@/lib/validators/intake";

const TOKEN_BYTES = 32;
const TOKEN_TTL_DAYS = 60;

/** No activity for this long, and a started form counts as abandoned. */
const ABANDON_AFTER_MS = 48 * 60 * 60 * 1000;

/**
 * What a page, an action, or the markdown generator is allowed to hold.
 *
 * An allowlist, not an exclusion list, and that direction is the point: a
 * column added to `engagements` later is invisible here until someone names it,
 * so the next sensitive field cannot leak to a surface by being forgotten. The
 * token hash and the Stripe identifiers never appear — a surface cannot render
 * or log what its type does not carry.
 */
export type Engagement = Pick<
  EngagementRow,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "answers"
  | "businessName"
  | "completedAt"
  | "contactEmail"
  | "contactName"
  | "contactPhone"
  | "currency"
  | "currentStep"
  | "depositAmountCents"
  | "depositRequired"
  | "lastActivityAt"
  | "paidAt"
  | "projectSummary"
  | "sentAt"
  | "startedAt"
  | "termsAcceptedAt"
  | "termsVersion"
  | "tokenExpiresAt"
> & { status: EngagementStatus };

/**
 * Thrown for an unknown, malformed, or expired token — all three with the same
 * message, so probing cannot distinguish a real link from a fabricated one.
 *
 * `reason` exists for our own rendering: possessing a real-but-expired token
 * means you were the client, so the expiry screen (INT-8) may say so. A random
 * token never reaches that branch.
 */
export class EngagementNotFoundError extends Error {
  readonly reason: "missing" | "expired";

  constructor(reason: "missing" | "expired") {
    super("No intake engagement matches that link.");
    this.name = "EngagementNotFoundError";
    this.reason = reason;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function mintToken(): { token: string; tokenHash: string } {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

function expiryFrom(now: Date): Date {
  return new Date(now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Encrypts the URL token so the reminder sweep can rebuild a client's link.
 *
 * Stored at creation, because reminder 1 goes to clients who have never opened
 * their link — there is no later moment when the plaintext exists. AES-256-GCM
 * with a random IV per row, IV and auth tag prepended.
 *
 * Weaker than the hash alone, and knowingly so: whoever holds both the
 * database and `INTAKE_LINK_KEY` holds the links. The key lives only in the
 * environment, never in the repository or a backup of this table. See
 * TECHNICAL-DECISIONS M-INT-19.
 */
function encryptToken(token: string): string | null {
  const key = readEnv("INTAKE_LINK_KEY");
  if (!key) return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "base64"), iv);
  const enc = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);

  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64");
}

/** Recovers a link token for the reminder sweep. Null if it cannot be read. */
export function decryptToken(ciphertext: string | null): string | null {
  const key = readEnv("INTAKE_LINK_KEY");
  if (!key || !ciphertext) return null;

  try {
    const raw = Buffer.from(ciphertext, "base64");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      Buffer.from(key, "base64"),
      raw.subarray(0, 12),
    );
    decipher.setAuthTag(raw.subarray(12, 28));

    return Buffer.concat([
      decipher.update(raw.subarray(28)),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // A rotated key or a corrupt value: the sweep skips this engagement
    // rather than mailing a broken link.
    return null;
  }
}

/**
 * The display vocabulary, derived from facts.
 *
 * Precedence is the semantics, so it is written as one ordered read: finished
 * beats in-flight, in-flight beats not-started, and money state only describes
 * an engagement that has not begun answering.
 */
export function getEngagementStatus(
  row: Pick<
    EngagementRow,
    | "completedAt"
    | "depositRequired"
    | "lastActivityAt"
    | "paidAt"
    | "sentAt"
    | "startedAt"
  >,
  now: Date = new Date(),
): EngagementStatus {
  if (row.completedAt) return "complete";

  if (row.startedAt) {
    const last = row.lastActivityAt ?? row.startedAt;
    if (now.getTime() - last.getTime() > ABANDON_AFTER_MS) return "abandoned";
    return row.lastActivityAt ? "in_progress" : "started";
  }

  if (row.paidAt) return "paid";
  if (!row.depositRequired) return "waived";
  if (row.sentAt) return "sent";
  return "created";
}

function toEngagement(row: EngagementRow, now: Date = new Date()): Engagement {
  return {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    answers: row.answers,
    businessName: row.businessName,
    completedAt: row.completedAt,
    contactEmail: row.contactEmail,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    currency: row.currency,
    currentStep: row.currentStep,
    depositAmountCents: row.depositAmountCents,
    depositRequired: row.depositRequired,
    lastActivityAt: row.lastActivityAt,
    paidAt: row.paidAt,
    projectSummary: row.projectSummary,
    sentAt: row.sentAt,
    startedAt: row.startedAt,
    termsAcceptedAt: row.termsAcceptedAt,
    termsVersion: row.termsVersion,
    tokenExpiresAt: row.tokenExpiresAt,
    status: getEngagementStatus(row, now),
  };
}

/** The absolute link a client receives. Server-side only. */
export function buildIntakeUrl(token: string): string {
  return `${siteOrigin()}${intakeRoutes.entry(token)}`;
}

/** Deep link to one step, for a reminder that should resume where they were. */
export function buildIntakeStepUrl(token: string, step: IntakeStepKey): string {
  return `${siteOrigin()}${intakeRoutes.step(token, step)}`;
}

function siteOrigin(): string {
  return requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
}

/**
 * The only path from a token to engagement data.
 *
 * Everything downstream — pages, actions, the upload route — comes through
 * here, which is what makes "is this caller allowed to see this?" a question
 * with exactly one answer (M-INT-8).
 */
export async function requireEngagement(token: string): Promise<Engagement> {
  const now = new Date();

  const [row] = await getDb()
    .select()
    .from(engagements)
    .where(eq(engagements.tokenHash, hashToken(token)))
    .limit(1);

  if (!row) throw new EngagementNotFoundError("missing");
  if (row.tokenExpiresAt.getTime() <= now.getTime()) {
    throw new EngagementNotFoundError("expired");
  }

  return toEngagement(row, now);
}

/**
 * Creates an engagement and returns its link token.
 *
 * The plaintext token is returned once and never stored; only its hash is
 * persisted (M-INT-6). If the caller loses it, the link is gone and the
 * engagement must be re-issued.
 */
export async function createEngagement(
  input: CreateEngagementInput,
): Promise<{ engagement: Engagement; token: string }> {
  const parsed = createEngagementInput.parse(input);
  const { token, tokenHash } = mintToken();
  const now = new Date();

  const [row] = await getDb()
    .insert(engagements)
    .values({
      businessName: parsed.businessName,
      contactEmail: parsed.contactEmail.trim().toLowerCase(),
      contactName: parsed.contactName,
      contactPhone: parsed.contactPhone,
      currency: parsed.currency,
      depositRequired: parsed.depositRequired,
      projectSummary: parsed.projectSummary,
      // Taylor sends the link himself the moment it is created, so creation
      // and sending are the same event here (D-INT-7).
      sentAt: now,
      resumeTokenCiphertext: encryptToken(token),
      tokenExpiresAt: expiryFrom(now),
      tokenHash,
    })
    .returning();

  if (!row) throw new Error("Engagement insert returned no row.");

  return { engagement: toEngagement(row, now), token };
}

/**
 * Issues a fresh link for an existing engagement, killing the previous one.
 *
 * This is the lost-link path. The old token cannot be recovered — it was never
 * stored — so rotation is the only honest answer.
 */
export async function reissueEngagementToken(
  engagementId: string,
): Promise<{ engagement: Engagement; token: string }> {
  const { token, tokenHash } = mintToken();
  const now = new Date();

  const [row] = await getDb()
    .update(engagements)
    .set({
      resumeTokenCiphertext: encryptToken(token),
      tokenExpiresAt: expiryFrom(now),
      tokenHash,
      updatedAt: now,
    })
    .where(eq(engagements.id, engagementId))
    .returning();

  if (!row) throw new EngagementNotFoundError("missing");

  return { engagement: toEngagement(row, now), token };
}

/**
 * Finds an unfinished engagement for an email address.
 *
 * The public start form is open to anyone, so a client who fills it twice —
 * lost the tab, tried again tomorrow — would otherwise end up with two records
 * and two deposits to reconcile. Reusing their existing one is both tidier and
 * kinder: they land back where they were rather than starting over.
 *
 * Only unfinished engagements are reused. Someone coming back months later for
 * a second website is a genuinely new engagement.
 */
export async function findResumableByEmail(
  contactEmail: string,
): Promise<{ engagement: Engagement; token: string | null } | null> {
  const [row] = await getDb()
    .select()
    .from(engagements)
    .where(
      and(
        eq(engagements.contactEmail, contactEmail.trim().toLowerCase()),
        isNull(engagements.completedAt),
      ),
    )
    .orderBy(desc(engagements.createdAt))
    .limit(1);

  if (!row) return null;
  if (row.tokenExpiresAt.getTime() <= Date.now()) return null;

  return {
    engagement: toEngagement(row),
    token: decryptToken(row.resumeTokenCiphertext),
  };
}

/** Reads an engagement by id. Local tooling only — never a request path. */
export async function findEngagementById(
  engagementId: string,
): Promise<Engagement> {
  const [row] = await getDb()
    .select()
    .from(engagements)
    .where(eq(engagements.id, engagementId))
    .limit(1);

  if (!row) throw new EngagementNotFoundError("missing");

  return toEngagement(row);
}

/**
 * Records that the client reached a step.
 *
 * `startedAt` is stamped once and never moved — it is the anchor the reminder
 * sweep and the status derivation both read. `currentStep` only ever advances,
 * so walking Back does not rewind where a resume link lands them.
 */
export async function markStepReached(
  engagementId: string,
  stepNumber: number,
): Promise<void> {
  const now = new Date();

  await getDb()
    .update(engagements)
    .set({
      currentStep: sql`greatest(${engagements.currentStep}, ${stepNumber}::integer)`,
      lastActivityAt: now,
      // `now()` rather than the JavaScript date: a raw `sql` template carries
      // no column type, so Drizzle cannot map a Date to a timestamptz the way
      // the typed `.set()` fields above are mapped, and postgres.js receives
      // an unserialisable Date. Letting Postgres supply the value sidesteps
      // the conversion entirely.
      startedAt: sql`coalesce(${engagements.startedAt}, now())`,
      updatedAt: now,
    })
    .where(eq(engagements.id, engagementId));
}

/** Stamps activity so the reminder sweep can tell working from abandoned. */
export async function touchEngagementActivity(
  engagementId: string,
): Promise<void> {
  const now = new Date();

  await getDb()
    .update(engagements)
    .set({ lastActivityAt: now, updatedAt: now })
    .where(eq(engagements.id, engagementId));
}
