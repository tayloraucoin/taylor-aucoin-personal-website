/**
 * How to work the queue, in the operator's own words.
 *
 * Written to be read once by someone who has never made a sales call, and then
 * referred to mid-block when a prospect says something unexpected. Every
 * branch the buttons offer is named here, and every branch says what the
 * software does afterwards — the questions that keep coming up are "what
 * happens if I press this" and "when does this come back".
 *
 * Kept as one string rather than an MDX route because it is one document with
 * one reader, and a build pipeline for it would be machinery nobody needs.
 */
export const CALL_SOP = `
## The short version

Work the queue top to bottom. Every call ends with one button press, and the
system schedules the follow-up for you. You never have to remember anyone.

**Overdue callbacks first, then today's, then fresh leads.** The order is the
job — if you only do what is above the fold, you are still doing it right.

---

## Before you dial

The card on the right has everything the opener needs: their name, their trade,
their rating and review count, and the number.

The honest reason you are calling is the opener: **they have good reviews and no
real website.** That is true, it is checkable, and it is why this is worth their
minute. Say it plainly in the first sentence.

**Watch the window line.** It tells you whether this trade is reachable right
now. Auto shops answer between the drop-off and pickup rushes — roughly 10 to
11:30 and 1:30 to 3:30. Field trades are on a roof from 8 until late afternoon,
so you get them at 7am or from 4:30 on. Calling a roofer at 10am is the single
easiest way to waste a morning.

**Watch the season line** when it appears. A roofer in August is booked into
October and does not want to hear about getting more calls — lead with looking
credible against competitors who have real sites. Same trade in November is
hungry and the usual pitch lands.

---

## After the call — what each button means

You press exactly one of these. The note box above them is saved with it.

**No answer** — nobody picked up. Comes back in 2 business days at a different
time of day. After 4 tries with no conversation it rests for 60 days rather
than being dialled forever.

**Voicemail** — same as no answer, but you left a message. Same schedule.

**Busy — callback** — they answered and asked you to call back. This is the
one that asks *when*, because they told you. Pick the chip that matches what
they said. A promised callback jumps the queue on its date and is never
reordered by the window model — a promise outranks a model.

**Conversation** — you actually talked. This asks what came of it. See below.

**Wrong number** — the number is dead or it is not them. Closes the lead as a
bad lead. It stops appearing in the queue and stays findable in Leads.

**Not interested** — a real no. Asks why, then closes the lead.

**Do not call** — they asked not to be contacted again. This is permanent and
it is the one exclusion nothing can override — no filter, no "show everyone",
no future import brings them back. Use it when they ask, always.

---

## "What came of it?" — after a conversation

**Wants info** — they asked you to send something. The system stops and offers
the intro email right there, prefilled. Send it while you are still on their
mind. Ticking the promo box adds a free small round of changes after launch and
puts the code in their link.

**Talk to the boss** — you reached someone who is not the decision maker. Logged
as a blocker on the lead so you know what you are walking into next time. Comes
back in 3 business days.

**Price talk** — they are asking what it costs. That is a buying signal. The
price is the price: $1,200 + GST, half to start. Do not discount — if it is not
a fit at that price it is not a fit, and the next referral will ask for the same
deal you just gave.

**Ready for intake** — they said yes. The system stops and offers to create
their personal link. That link takes the deposit and asks the questions you need
to build from. Copy it when it appears: **it is shown once and never stored.**

**Not now** — timing, not interest. Asks when to come back — a month, three
months, or a date you pick. This is the difference between a lead you will call
again and one you will lose.

---

## Every lead has a next action

That is the rule the whole system runs on. Whatever you press, the lead comes
back on a date or it is closed with a reason. Nothing sits in limbo.

The Scoreboard shows **worked leads with no next action**. It should be zero. If
it is not, those are the ones about to go quiet.

---

## Looking someone up

Click any lead, or **Full record** on the card, and their record opens over what
you were doing. History, contact details, and the two conversion actions live
there. Close it and you are exactly where you were.

Add an email address on the record and the intro email becomes available for
that lead.

---

## When the queue is empty

It is telling you something real. If you filtered to **Ready to call now** at
9am, everyone is either in a drop-off rush or on a roof — it names what opens
next and how many are waiting. Either wait for the window, switch trades, or
press **Show everyone anyway** and work the list regardless.

Running out of fresh leads is different: run \`yarn leadgen export --crm\` and
import the file on the Sync page. Importing again never touches your notes,
history, schedules, or rulings — it only refreshes what Google knows.
`.trim();
