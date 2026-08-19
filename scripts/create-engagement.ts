import { parseArgs } from "node:util";
import { createEngagementInput } from "@/lib/validators/intake";
import {
  buildIntakeUrl,
  createEngagement,
  findEngagementById,
  getEngagementStatus,
  reissueEngagementToken,
} from "@/server/services/engagement";

/**
 * Creates a client intake link after a sales call.
 *
 * Local tooling, run by Taylor. There is deliberately no admin route and no
 * password anywhere in this system (M-INT-5): the only credential is the link
 * itself, and it is printed here exactly once.
 *
 *   yarn intake:create --business "Clean Coast" --contact "Sam" \
 *     --email sam@example.com --deposit 50000 --summary "Five-page site..."
 *
 *   yarn intake:create --reissue <engagement-id>
 *   yarn intake:create --status  <engagement-id>
 *   yarn intake:create --self-check
 */
const USAGE = `
Create:      --business <name> --contact <name> --email <address>
             [--phone <number>] [--summary <text>]
             [--no-deposit] [--currency cad]

The deposit is the standard price from Stripe (STRIPE_PRICE_DEPOSIT).
Pass --no-deposit only for an engagement that skips payment entirely.

Re-issue:    --reissue <engagement-id>     (kills the previous link)
Inspect:     --status <engagement-id>
Verify:      --self-check                  (status derivation, no database)
`;

function fail(message: string): never {
  console.error(`\n${message}\n${USAGE}`);
  process.exit(1);
}

/**
 * Prints the link and says plainly that it will not be shown again — the
 * plaintext token is never persisted, so this really is the only copy.
 */
function announce(token: string, label: string): void {
  console.log(`\n${label}\n\n  ${buildIntakeUrl(token)}\n`);
  console.log(
    "This link is shown once and is not recoverable — send it before closing\n" +
      "this terminal. If it is lost, re-issue with --reissue <engagement-id>.\n",
  );
}

/**
 * Exercises `getEngagementStatus` across every reachable state using synthetic
 * rows, so the derivation can be verified with no database and no test file.
 */
function selfCheck(): void {
  const now = new Date("2026-08-18T12:00:00Z");
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  const base = {
    completedAt: null,
    depositRequired: true,
    lastActivityAt: null,
    paidAt: null,
    sentAt: null,
    startedAt: null,
  };

  const cases: Array<[string, Parameters<typeof getEngagementStatus>[0]]> = [
    ["created", base],
    ["sent", { ...base, sentAt: hoursAgo(1) }],
    ["waived", { ...base, depositRequired: false, sentAt: hoursAgo(1) }],
    ["paid", { ...base, sentAt: hoursAgo(2), paidAt: hoursAgo(1) }],
    ["started", { ...base, paidAt: hoursAgo(2), startedAt: hoursAgo(1) }],
    [
      "in_progress",
      { ...base, startedAt: hoursAgo(3), lastActivityAt: hoursAgo(1) },
    ],
    [
      "abandoned",
      { ...base, startedAt: hoursAgo(96), lastActivityAt: hoursAgo(72) },
    ],
    ["abandoned", { ...base, startedAt: hoursAgo(96) }],
    [
      "complete",
      { ...base, startedAt: hoursAgo(96), completedAt: hoursAgo(50) },
    ],
  ];

  let failures = 0;

  for (const [expected, row] of cases) {
    const actual = getEngagementStatus(row, now);
    const ok = actual === expected;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "ok  " : "FAIL"}  expected ${expected}, got ${actual}`,
    );
  }

  console.log(
    failures === 0
      ? "\nStatus derivation: all states correct.\n"
      : `\nStatus derivation: ${failures} incorrect.\n`,
  );

  process.exit(failures === 0 ? 0 : 1);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      business: { type: "string" },
      contact: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      summary: { type: "string" },
      currency: { type: "string" },
      "no-deposit": { type: "boolean" },
      reissue: { type: "string" },
      status: { type: "string" },
      "self-check": { type: "boolean" },
    },
  });

  if (values["self-check"]) selfCheck();

  // A link printed with the wrong origin is a support call, so refuse early
  // rather than emit one.
  buildIntakeUrl("preflight");

  if (values.status) {
    const engagement = await findEngagementById(values.status);
    console.log(
      `\n${engagement.businessName} — ${engagement.status}` +
        `\n  created ${engagement.createdAt.toISOString()}` +
        `\n  link expires ${engagement.tokenExpiresAt.toISOString()}\n`,
    );
    return;
  }

  if (values.reissue) {
    const { token, engagement } = await reissueEngagementToken(values.reissue);
    announce(token, `New link for ${engagement.businessName}:`);
    return;
  }

  const parsed = createEngagementInput.safeParse({
    businessName: values.business,
    contactName: values.contact,
    contactEmail: values.email,
    contactPhone: values.phone,
    projectSummary: values.summary,
    currency: values.currency ?? "cad",
    depositRequired: !values["no-deposit"],
  });

  if (!parsed.success) {
    fail(parsed.error.issues.map((issue) => `- ${issue.message}`).join("\n"));
  }

  const { token, engagement } = await createEngagement(parsed.data);
  announce(token, `Intake link for ${engagement.businessName}:`);
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
