/**
 * Domain types for the engagement pipeline (PIPE).
 */

/**
 * The values Taylor has typed for one engagement at send time, by variable
 * name: `{ reviewUrl: "https://…", reviewCode: "…", domain: "…" }`.
 *
 * Stored on the engagement so a value entered for one step's email prefills
 * the next step that uses the same name, and a saved value overrides the
 * record's own value of that name — which is how a domain corrected in one
 * email reaches the next (M-PIPE-2). Operational data only: never a
 * credential, never logged.
 */
export type PipelineValues = Record<string, string>;
