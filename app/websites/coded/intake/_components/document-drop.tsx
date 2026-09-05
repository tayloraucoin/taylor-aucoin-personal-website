"use client";

import { Field } from "../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../intake/_components/file-drop";

/**
 * The step-7 drop for decks, one-pagers, floor plans, and price sheets.
 *
 * A thin composition rather than a new primitive: `FileDrop` under a label and
 * a help line that both come from the copy pack.
 *
 * **The help line carries a promise and it is not decoration.** Every pack's
 * `documents.help` ends "We read them to understand the thing; nothing from
 * them goes on the site unless you say so." A venture's deck may be
 * confidential and a price sheet may be out of date; a client who suspects
 * either might end up on their site sends neither. It lives in the pack rather
 * than as a constant here because that is where Taylor's copy pass reaches it,
 * and `yarn verify:tracks` asserts every pack still ends with it — a guard
 * rather than a second copy (kinds scope §5.5).
 *
 * Format never rejects a file here. A deck arrives as a PDF, a Keynote, a
 * Slides export, or a folder of screenshots, and the upload law is that size is
 * the only thing that may refuse one.
 */
export function DocumentDrop({
  token,
  label,
  help,
  existing,
}: {
  token: string;
  /** From the copy pack, so Taylor's pass reaches it. */
  label: string;
  help: string;
  existing: readonly ExistingFile[];
}) {
  return (
    <Field id="f-documents" label={label} help={help}>
      <FileDrop
        token={token}
        stepKey="media"
        fieldKey="documents"
        label="Add documents"
        multiple
        existing={existing}
      />
    </Field>
  );
}
