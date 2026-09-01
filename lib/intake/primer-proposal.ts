/**
 * What the business primer produces, and what the client reviews (PORT-10).
 *
 * Lives in `lib/` because three layers read it — the service that produces it,
 * the action that returns it, and the step components that render it — and
 * none of them may own the shape. No framework, DOM, or transport binding
 * here; it is a plain data type describing one suggestion about one field.
 *
 * **A proposal is not an answer.** It is never written to the `answers`
 * document by the code that produces it and it never reaches the intake
 * markdown. It becomes an answer only when the client has met it in place on
 * the step that asks the question, at which point their own autosave commits
 * it — the same mechanism PORT-6's extracted entries use, at field granularity
 * rather than entry granularity (D-PORT-3, M-PORT-16).
 */

/** One suggestion for one field, and the sentence that justifies it. */
export type PrimerProposal = {
  /** A key from `PRIMER_FIELDS`. Anything else is dropped by the validator. */
  fieldKey: string;
  /** The showcase step the field lives on, so proposals can be met in place. */
  stepKey: string;
  /** What the primer suggests the answer is. Free text, in the client's words. */
  value: string;
  /**
   * The sentence from the document that supports the value, verbatim.
   *
   * Null **only** when `assumed` is true. Every other proposal carries one, and
   * a quote that cannot be found in the document is not a warning — the
   * proposal is discarded before it is ever persisted or rendered.
   */
  quote: string | null;
  /**
   * The one licensed inference: a reasonable reading the document supports
   * without stating, permitted only on the enumerated non-critical fields
   * (Taylor, 2026-09-01). Rendered as a guess, never as something they said.
   */
  assumed: boolean;
};

/** A proposal's lifecycle. Only `proposed` is ever shown to a client. */
export type PrimerProposalStatus = "proposed" | "dismissed";

/**
 * The stored set, as it sits in `engagements.primer_proposals`.
 *
 * `dismissedFieldKeys` outlives any one run on purpose: re-reading the document
 * must not resurrect a suggestion the client has already waved off, and a
 * client who re-pastes after an edit should not have to dismiss the same
 * sentence twice.
 */
export type PrimerProposalSet = {
  /** When the read that produced these ran. ISO 8601. */
  readAt: string;
  proposals: PrimerProposal[];
  dismissedFieldKeys: string[];
};

/** The empty set, for an engagement that has never run the primer. */
export const EMPTY_PROPOSAL_SET: PrimerProposalSet = {
  readAt: "",
  proposals: [],
  dismissedFieldKeys: [],
};
