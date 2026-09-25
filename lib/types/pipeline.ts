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

/**
 * Where a step's prompt is meant to run (PIPE-6): a regular Claude chat, or a
 * Claude Code session in a repo. The values are the database enum's
 * (`pipeline_prompt_target`), declared once here so the schema, the
 * validator and the page cannot disagree.
 */
export const PROMPT_TARGETS = ["claude", "claude_code"] as const;

export type PromptTarget = (typeof PROMPT_TARGETS)[number];

/** How each target reads on the page — the product names, nothing added. */
export const PROMPT_TARGET_LABELS: Record<PromptTarget, string> = {
  claude: "Claude",
  claude_code: "Claude Code",
};
