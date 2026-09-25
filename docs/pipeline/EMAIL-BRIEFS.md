# PIPE — Email briefs

What each client email in the pipeline must carry. **Facts and obligations only.** The words are Taylor's: he writes each template in `/admin/pipeline` (PIPE-5), and nothing here is draft copy to be pasted. Every template passes `docs/TASTE-PROFILE.md` § voice and the human-hand copy standard: no urgency, no exclamation marks, no startup voice.

Variable names below are the ones the templates should use, so the values carry from one email to the next on the same engagement (M-PIPE-2). Names marked *record* fill themselves from the engagement; the rest are asked for at send time and remembered.

---

## 1. Review is ready

**When:** the three directions (kits, layouts, mock home pages) are deployed to the client site's review layer and the gate is on.

**Must carry:**

- Where to look: `{{reviewUrl}}`.
- How to get in: `{{reviewCode}}` — the client site's `REVIEW_ACCESS_CODE`.
- What is being asked: choose between the directions and leave comments where something lands or doesn't. They are choosing one, not approving all three.
- How to finish: submit the feedback form once, when done. Comments can be left before and after.

**Record:** `{{firstName}}`, `{{businessName}}`.

---

## 2. The site is up — the final included round

**When:** the build is deployed to its Vercel URL and ready for the client's one round of changes.

**Must carry:**

- Where to look: `{{previewUrl}}`.
- **This is the last round of changes included in what they have paid for.** It has to be unmistakable, and it must agree with the terms they accepted, not add to them. The terms (`content/legal.ts`, "Changes and further work") say every round is prepaid and quoted — Standard $500, Small $250, Taylor's own mistakes free within 14 days — and that one round is one consolidated list; requests that trickle in are collected into the next round. **The terms do not promise an included round.** This one is Taylor's courtesy (his words, 2026-09-25), so the email offers it as such rather than citing it as an entitlement. Say plainly: everything goes into one reply; anything after this round is a paid round under the terms. The public pages speak of "the revision round" (`content/websites-coded.ts`, FAQ "What if I don't like it?") — Taylor checks the engagement's `terms_version` before relying on either wording.
- **The balance.** The terms say "the balance is only ever asked for after you've seen your finished site as a live preview" ("The deposit, and refunds"). This email is that moment. Whether the balance invoice travels with it, before it, or after the round is Taylor's call; the brief only notes the timing.
- **What happens next:** once this round is done, the site moves to their domain. They will get the records to set in a separate email.
- **Confirm the domain:** `{{domain}}` fills from their intake answer (access step, `domainName`) and Taylor corrects it at send time if it is empty or changed. Ask them to confirm it, or tell him the right one. When the intake left it blank, Taylor rewrites that paragraph in the send dialog — there is no conditional text.

**Record:** `{{firstName}}`, `{{businessName}}`, `{{domain}}`, `{{registrar}}`.

---

## 3. Domain handoff

**When:** the final round is done and the site is ready to move to their domain.

**Must carry:**

- The domain, confirmed: `{{domain}}`.
- The records to set, exactly as Vercel gives them: `{{dnsRecords}}` (type, name, value — one per line).
- How to set them at their registrar: `{{dnsInstructions}}`, pasted per send (registrar library is roadmap).
- What they will see and when: records can take time to take effect; Taylor confirms when the site is live on the domain.
- **Money:** the terms say "the balance launches the site" (`content/legal.ts`, "Price and payment"). The send dialog shows the engagement's money state beside the button (PIPE-4). It is a reminder for Taylor, not a gate and not something the email mentions.

**Record:** `{{firstName}}`, `{{businessName}}`, `{{registrar}}`.
