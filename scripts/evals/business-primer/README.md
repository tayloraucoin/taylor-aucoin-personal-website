# Business primer — golden set (PORT-10)

Eleven documents and the graders that score what the model does with them.
Written **before** the prompt, which is the point: the criteria cannot be tuned
to flatter an output that does not exist yet.

## Nothing here is real

Every business, person, address, domain, and number in `documents/` is
invented. Domains use the reserved `.example` TLD or resolve to nothing. This
is house law rather than tidiness — fabricated or real client material is a
legal posture on this project (`docs/intake/ADMIN-HANDOFF.md` § Cautions), and
a plausible-looking fake is the worse of the two failures. If you add a case,
invent it; never paste a real client's document, and never paste your own.

## The two rules that are the slice

`grade.ts` enforces them mechanically on every case:

1. **Every proposal's quote is literally present in the document.** Normalised
   for line-break hyphens, whitespace, and curly quotes — not for case, not for
   word order. A paraphrase fails.
2. **No critical field carries an unquoted value.** Criticality is decided in
   `lib/intake/showcase-primer-fields.ts`, never by the model. Three fields are
   non-critical and may carry a labelled assumption.

Both also run inside the service on the live path, which is what makes them a
mechanism instead of a promise. A hard failure here means the *validator* has a
hole — not merely that the model reached.

## Recall is graded by a human

Case 1 carries a hand-made key. The runner prints it beside what came back and
a person decides. Reporting recall as a number would be exactly the fictional
evidence this slice exists to prevent.

## Running it

    yarn eval:primer --inventory   # drift check on the field inventory, no API calls
    yarn eval:primer --self-test   # proves the graders catch what they claim to
    yarn eval:primer               # the live run (needs the service and an API key)

Report every result with its n. Three good samples is not a pass.
