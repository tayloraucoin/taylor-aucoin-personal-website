"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ELAPSED_NAME } from "@/components/forms/bot-check";
import { Honeypot, useFillTimer } from "@/components/forms/BotFields";
import { ErrorLine } from "@/components/forms/ErrorLine";
import { TextAreaField, TextField } from "@/components/forms/Field";
import { focusFirstInvalid } from "@/components/forms/focus-first-invalid";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { BookCallLink } from "@/components/site/BookCallLink";
import { contact } from "@/content/contact";
import { track } from "@/lib/analytics/events";
import { SITE } from "@/lib/config";
import {
  NOTE_FIELDS,
  NOTE_LIMITS,
  noteFieldErrors,
  noteSchema,
  type NoteFrom,
  type NoteScreening,
} from "@/lib/validators/note";
import type { NoteState } from "./note-action";
import { sendNoteAction } from "./send-note";

export type NoteValues = { message: string; name: string; email: string };

/** A `?state=` fixture's starting view and answers (`app/contact/_fixtures.ts`). */
export type NoteSeed = { state: NoteState; values?: Partial<NoteValues> };

const LINK =
  "inline-flex min-h-6 items-center text-meta text-(--color-ink) underline decoration-(--color-mark) underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

/**
 * Restyles the shared call link as the sent view's inline text link; the
 * `!` marks win over the button classes `BookCallLink` always carries.
 */
const CALL_AS_TEXT =
  "h-auto! min-h-6! border-0! bg-transparent! px-0! text-small! text-(--color-ink)! underline underline-offset-4 hover:bg-transparent!";

/**
 * The note: intro, hairline and form, which the sent line replaces (PP-2).
 * Posts to `sendNoteAction` on `useActionState`; the client checks with the
 * server's own schema first, so an invalid note never leaves the page. A
 * thrown action (offline) becomes the send error with every answer kept.
 *
 * `sentVariant` "with_call" offers "Prefer a call?" under the sent line
 * (`/contact`); "alone" shows the sent line only (`/book`'s not-a-fit,
 * D-SITE-202). `screening` rides in hidden fields, unseen. `startedAt` is
 * when the visitor began (the screening form's mount on `/book`), so the
 * fill-time rule counts from there and a note sent at once still goes.
 * `besideButton` replaces the "Or email" line; `messageLabel` and
 * `sentTitle` default to `/contact`'s. `holdUntilValid` (`/contact`) keeps
 * the button `aria-disabled` until the message and email pass the schema,
 * described by the field errors still standing.
 */
export function NoteForm({
  from,
  sentVariant,
  intro,
  prefill,
  screening,
  seed,
  startedAt,
  messageLabel = contact.fields.message.label,
  besideButton,
  sentTitle = contact.sentTitle,
  holdUntilValid = false,
}: {
  from: NoteFrom;
  sentVariant: "with_call" | "alone";
  intro: ReactNode;
  prefill?: Partial<NoteValues>;
  screening?: NoteScreening;
  seed?: NoteSeed;
  startedAt?: number;
  messageLabel?: string;
  besideButton?: ReactNode;
  sentTitle?: string;
  holdUntilValid?: boolean;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const fromAction = useRef(false);
  const stampElapsed = useFillTimer();

  const [values, setValues] = useState<NoteValues>({
    message: "",
    name: "",
    email: "",
    ...prefill,
    ...seed?.values,
  });
  const [clientErrors, setClientErrors] = useState<NoteState | null>(null);

  const [actionState, dispatch, pending] = useActionState<NoteState, FormData>(
    async (previous, formData) => {
      try {
        return await sendNoteAction(previous, formData);
      } catch {
        return { status: "error" };
      } finally {
        inFlight.current = false;
      }
    },
    seed?.state ?? { status: "idle" },
  );

  const state = clientErrors ?? actionState;
  const invalid = state.status === "invalid" ? state.fields : {};

  // A view the server confirmed: focus, title and the event, once each.
  useEffect(() => {
    if (actionState.status === "invalid" && fromAction.current) {
      if (formRef.current)
        focusFirstInvalid(formRef.current, NOTE_FIELDS, actionState.fields);
    }
    if (actionState.status !== "sent" || !fromAction.current) return;
    document.title = sentTitle;
    sentRef.current?.focus();
    track("contact_note_sent", { surface: "services", from });
  }, [actionState, from, sentTitle]);

  function update(field: keyof NoteValues) {
    return (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [field]: event.target.value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || inFlight.current) return;
    const form = event.currentTarget;

    const checked = noteSchema.safeParse({ ...values, from, screening });
    if (!checked.success) {
      const fields = noteFieldErrors(checked.error);
      setClientErrors({ status: "invalid", fields });
      focusFirstInvalid(form, NOTE_FIELDS, fields);
      return;
    }

    setClientErrors(null);
    const formData = new FormData(form);
    if (startedAt === undefined) stampElapsed(formData);
    else formData.set(ELAPSED_NAME, String(Date.now() - startedAt));
    inFlight.current = true;
    fromAction.current = true;
    startTransition(() => dispatch(formData));
  }

  if (state.status === "sent") {
    return (
      <div>
        <hr className="mt-10 border-(--color-line-soft)" />
        <p
          ref={sentRef}
          tabIndex={-1}
          className="mt-10 text-lede leading-[1.6] text-(--color-ink) focus:outline-none"
        >
          {contact.sent(state.email)}
        </p>
        {sentVariant === "with_call" ? (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-small text-(--color-dim)">
            <span>{contact.preferCall}</span>
            <BookCallLink
              surface="services"
              placement="contact_sent"
              className={CALL_AS_TEXT}
            />
          </p>
        ) : null}
      </div>
    );
  }

  const fieldId = (name: string) => `${id}-${name}`;

  const live = noteSchema.safeParse({ ...values, from, screening });
  const standing = live.success ? {} : noteFieldErrors(live.error);
  const blocked = holdUntilValid && !live.success;

  return (
    <div>
      <div className="mt-4 text-lede leading-[1.6] text-(--color-body)">
        {intro}
      </div>
      <hr className="mt-10 border-(--color-line-soft)" />

      <form
        ref={formRef}
        method="post"
        onSubmit={submit}
        noValidate
        className="relative mt-10"
      >
        <input type="hidden" name="from" value={from} />
        {screening ? (
          <>
            <input
              type="hidden"
              name="screening_budget"
              value={screening.budget}
            />
            <input
              type="hidden"
              name="screening_start"
              value={screening.start}
            />
            <input type="hidden" name="screening_role" value={screening.role} />
          </>
        ) : null}
        <Honeypot />

        <TextAreaField
          id={fieldId("message")}
          name="message"
          label={messageLabel}
          hint={contact.fields.message.hint}
          error={invalid.message ? contact.errors.message : undefined}
          value={values.message}
          onChange={update("message")}
          maxLength={NOTE_LIMITS.message}
        />

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-4">
          <TextField
            id={fieldId("name")}
            name="name"
            label={contact.fields.name.label}
            autoComplete="name"
            value={values.name}
            onChange={update("name")}
            maxLength={NOTE_LIMITS.name}
          />
          <TextField
            id={fieldId("email")}
            name="email"
            type="email"
            label={contact.fields.email.label}
            hint={contact.fields.email.hint}
            autoComplete="email"
            error={invalid.email ? contact.errors.email : undefined}
            value={values.email}
            onChange={update("email")}
            maxLength={NOTE_LIMITS.email}
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <SubmitButton
            label={contact.button}
            busyLabel={contact.sending}
            busy={pending}
            blockedBy={blocked ? fieldId("why-blocked") : undefined}
          />
          {holdUntilValid ? (
            <span id={fieldId("why-blocked")} className="sr-only">
              {standing.message ? contact.errors.message : ""}{" "}
              {standing.email ? contact.errors.email : ""}
            </span>
          ) : null}
          {besideButton ?? (
            <a href={`mailto:${SITE.email}`} className={LINK}>
              {contact.orEmail}
            </a>
          )}
        </div>

        {state.status === "error" ? (
          <ErrorLine role="alert" className="mt-4">
            {contact.sendError.before}{" "}
            <a href={`mailto:${SITE.email}`} className={LINK}>
              {SITE.email}
            </a>{" "}
            {contact.sendError.after}
          </ErrorLine>
        ) : null}
      </form>
    </div>
  );
}
