import { PRIMER_FIELDS, primerField } from "@/lib/intake/showcase-primer-fields";
import type { PrimerProposal } from "@/lib/intake/primer-proposal";
import type { GoldenCase } from "./cases";

/**
 * The graders for PORT-10's golden set, written before the prompt exists.
 *
 * Two of these are the slice. `quoteNotFound` and `unquotedCritical` are the
 * mechanical form of the grounding contract: not "the model was told not to
 * invent" but "an invention cannot survive the round trip." The service runs
 * the same check on the live path and discards what fails it, so a failure
 * here means the *service's* validator has a hole, not that the model misbehaved.
 *
 * Everything else is per-case shape: did it reach where it should have stayed
 * quiet, did it stay quiet where it should have reached.
 *
 * Recall is deliberately not graded here. Case 1 carries a hand-made key and
 * the runner prints proposals beside it for a human to grade, because "did it
 * find the important things" is a judgment and dressing it as a number would
 * be the fictional evidence this whole slice exists to prevent.
 */

/* ── Quote verification ──────────────────────────────────────────────────── */

/**
 * The one normalisation a quote is allowed, and nothing beyond it.
 *
 * Three transformations, each earned by a real artifact of the documents we
 * actually accept:
 *
 * - **Line-break hyphen joins.** A PDF text layer breaks "British" across
 *   lines as "Brit-\nish". A model quoting that sentence writes it whole, and
 *   a naive substring check would call the true quote a fabrication.
 * - **Whitespace collapse.** Tabs from a flattened DOCX table, soft wraps, and
 *   double spaces are formatting, not content.
 * - **Quote and dash characters.** Word gives curly quotes and em dashes; a
 *   model retyping the sentence may straighten them.
 *
 * Case is *not* folded and words are *not* reordered. The check stays strict
 * enough that a paraphrase fails it, which is the entire point: a model that
 * summarises rather than quotes must be caught, not accommodated.
 */
export function normalizeForQuoteMatch(text: string): string {
  return text
    .replace(/-\s*\n\s*/g, "")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Whether a quote is genuinely present in the document it claims to be from. */
export function quoteIsGrounded(document: string, quote: string): boolean {
  const haystack = normalizeForQuoteMatch(document);
  const needle = normalizeForQuoteMatch(quote);
  return needle.length > 0 && haystack.includes(needle);
}

/* ── Findings ────────────────────────────────────────────────────────────── */

export type Severity = "hard" | "soft";

export type Finding = {
  severity: Severity;
  rule: string;
  detail: string;
};

export type CaseResult = {
  caseId: string;
  proposalCount: number;
  findings: Finding[];
  /** True when no hard rule failed. Soft findings are reported, not fatal. */
  passed: boolean;
};

const KNOWN_KEYS = new Set(PRIMER_FIELDS.map((field) => field.key));

/**
 * Grades one case. Pure: same document and proposals, same findings, no clock,
 * no network, no model.
 */
export function grade(
  goldenCase: GoldenCase,
  document: string,
  proposals: readonly PrimerProposal[],
): CaseResult {
  const findings: Finding[] = [];

  for (const proposal of proposals) {
    const field = primerField(proposal.fieldKey);
    const where = `${proposal.fieldKey}`;

    if (!KNOWN_KEYS.has(proposal.fieldKey) || !field) {
      findings.push({
        severity: "hard",
        rule: "unknown-field",
        detail: `${where} is not in the primer inventory.`,
      });
      continue;
    }

    if (proposal.stepKey !== field.stepKey) {
      findings.push({
        severity: "hard",
        rule: "wrong-step",
        detail: `${where} is on step ${field.stepKey}, tagged ${proposal.stepKey}.`,
      });
    }

    if (!proposal.value.trim()) {
      findings.push({
        severity: "hard",
        rule: "empty-value",
        detail: `${where} proposed an empty value.`,
      });
    }

    if (proposal.assumed) {
      if (field.critical) {
        findings.push({
          severity: "hard",
          rule: "unquoted-critical",
          detail: `${where} is a critical field and cannot carry an assumption.`,
        });
      }
      if (proposal.quote) {
        findings.push({
          severity: "soft",
          rule: "assumed-with-quote",
          detail: `${where} is flagged assumed but carries a quote.`,
        });
      }
      continue;
    }

    if (!proposal.quote) {
      findings.push({
        severity: "hard",
        rule: field.critical ? "unquoted-critical" : "missing-quote",
        detail: `${where} carries no quote and is not flagged as an assumption.`,
      });
      continue;
    }

    if (!quoteIsGrounded(document, proposal.quote)) {
      findings.push({
        severity: "hard",
        rule: "quote-not-found",
        detail: `${where} quotes text that is not in the document: "${truncate(proposal.quote)}"`,
      });
    }
  }

  const proposedKeys = new Set(proposals.map((p) => p.fieldKey));

  for (const forbidden of goldenCase.forbiddenFields ?? []) {
    if (proposedKeys.has(forbidden)) {
      findings.push({
        severity: "hard",
        rule: "forbidden-field",
        detail: `${forbidden} must not be proposed for this document.`,
      });
    }
  }

  if (
    goldenCase.maxProposals !== undefined &&
    proposals.length > goldenCase.maxProposals
  ) {
    findings.push({
      severity: "hard",
      rule: "over-reach",
      detail: `${proposals.length} proposals; this document supports at most ${goldenCase.maxProposals}.`,
    });
  }

  if (
    goldenCase.minProposals !== undefined &&
    proposals.length < goldenCase.minProposals
  ) {
    findings.push({
      severity: "soft",
      rule: "under-reach",
      detail: `${proposals.length} proposals; expected at least ${goldenCase.minProposals}.`,
    });
  }

  // Duplicates are a shape defect rather than a grounding one: the surface
  // applies one proposal per field, so a second is silently discarded and the
  // client never learns it existed.
  const seen = new Set<string>();
  for (const proposal of proposals) {
    if (seen.has(proposal.fieldKey)) {
      findings.push({
        severity: "soft",
        rule: "duplicate-field",
        detail: `${proposal.fieldKey} proposed more than once.`,
      });
    }
    seen.add(proposal.fieldKey);
  }

  return {
    caseId: goldenCase.id,
    proposalCount: proposals.length,
    findings,
    passed: !findings.some((finding) => finding.severity === "hard"),
  };
}

function truncate(text: string, max = 60): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}
