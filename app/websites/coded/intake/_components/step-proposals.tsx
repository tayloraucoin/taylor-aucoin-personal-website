"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PrimerProposal } from "@/lib/intake/primer-proposal";
import { labelFor } from "@/lib/intake/tracks";
import {
  acceptPrimerProposal,
  dismissPrimerProposal,
} from "../_actions/primer";

/**
 * The suggestions the primer made for *this* step, met where the questions are.
 *
 * **Per step, never in one wall.** A single accept-all screen would be faster
 * and is the wrong shape: it is a client approving claims about their own
 * business in bulk, which is exactly how a wrong one gets through. Here each
 * suggestion sits beside the step that asks it, with the sentence it came from,
 * and is taken or waved off one at a time.
 *
 * **Nothing here is an answer until the client takes it.** "Use this" is the
 * one server-side write the seen-first law permits, because seeing is exactly
 * what happened: they read the suggestion and the sentence behind it, and
 * pressed the button. The value is looked up server-side from what was actually
 * proposed, so the browser names a field and never dictates a value.
 *
 * **A proposal never appears over an answer.** The server drops any whose field
 * the client has since filled themselves, so this component cannot offer to
 * replace someone's own words.
 *
 * **Confidence is never a number.** The model returns one and it is used to
 * decide whether a suggestion is offered at all; a percentage on screen invites
 * a client to trust the high ones without reading, which defeats the quote.
 */
export function StepProposals({
  token,
  proposals,
}: {
  token: string;
  proposals: readonly PrimerProposal[];
}) {
  const router = useRouter();
  const [handled, setHandled] = useState<Set<string>>(new Set());

  const open = proposals.filter((p) => !handled.has(p.fieldKey));
  if (open.length === 0) return null;

  const close = (fieldKey: string) =>
    setHandled((previous) => new Set(previous).add(fieldKey));

  return (
    <section
      aria-labelledby="primer-proposals"
      className="mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5"
    >
      <h2
        id="primer-proposals"
        className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)"
      >
        From what you pasted
      </h2>

      {/* [COPY — pending Taylor] */}
      <p className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
        Suggestions, not answers. Nothing below is saved until you take it.
      </p>

      <ul className="mt-4 space-y-4">
        {open.map((proposal) => (
          <li
            key={proposal.fieldKey}
            className="border-t border-(--color-faint) pt-4"
          >
            <p className="font-body text-[13.5px] font-light text-(--color-dim)">
              {labelFor("showcase", proposal.fieldKey)}
            </p>

            <p className="mt-1 font-body text-[16px] font-light leading-[1.5] text-(--color-ink)">
              {proposal.value}
            </p>

            {/* The sentence it came from, or an honest admission that there
                isn't one. A guess that looks like a quote is the failure this
                whole feature is arranged against. */}
            {proposal.quote ? (
              <p className="mt-2 border-l border-(--color-faint) pl-3 font-body text-[13.5px] font-light italic leading-[1.5] text-(--color-dim)">
                {proposal.quote}
              </p>
            ) : (
              <p className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                A guess from what you pasted, not something you said.
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  close(proposal.fieldKey);
                  void acceptPrimerProposal(token, proposal.fieldKey).then(
                    // The field above re-renders filled. A failed accept costs
                    // the suggestion, never an answer.
                    () => router.refresh(),
                  );
                }}
                className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                Use this
              </button>

              <button
                type="button"
                onClick={() => {
                  close(proposal.fieldKey);
                  // Best effort: a failed dismissal costs a suggestion
                  // reappearing on the next load, never an answer.
                  void dismissPrimerProposal(token, proposal.fieldKey);
                }}
                className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                Not that
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
