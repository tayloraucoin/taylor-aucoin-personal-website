"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { CircleCheck } from "lucide-react";
import { Honeypot, useFillTimer } from "@/components/forms/BotFields";
import { ErrorLine } from "@/components/forms/ErrorLine";
import { CONTROL } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { notes } from "@/content/home";
import {
  NOTE_SIGNUP_MAX,
  noteSignupSchema,
} from "@/lib/validators/note-signup";
import type { NoteSignupState } from "./note-signup-action";
import { signUpForNotes } from "./sign-up-for-notes";

/** A `?state=` fixture's starting view (`app/_fixtures.ts`). */
export type NotesSeed = {
  state: NoteSignupState;
  email?: string;
  /** notes-sending: hold the button busy. */
  busy?: boolean;
};

/**
 * The signup form (D-SITE-223, 169): the client checks with the server's own
 * schema first, so an invalid address never leaves the page. Sending keeps
 * the address and the button's width, busy and never disabled. A thrown
 * action (offline) is the error view with the address kept (D-SITE-9). Done
 * replaces the form with one line that takes focus; the polite row says the
 * same. Nothing here fires an event or puts the address in a URL.
 */
export function NotesForm({ seed }: { seed?: NotesSeed }) {
  const id = useId();
  const fieldId = `${id}-email`;
  const lineId = `${id}-line`;
  const doneRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const fromAction = useRef(false);
  const stampElapsed = useFillTimer();

  const [email, setEmail] = useState(seed?.email ?? "");
  const [clientInvalid, setClientInvalid] = useState(false);

  const [actionState, dispatch, pending] = useActionState<
    NoteSignupState,
    FormData
  >(
    async (previous, formData) => {
      try {
        return await signUpForNotes(previous, formData);
      } catch {
        return { status: "error" };
      } finally {
        inFlight.current = false;
      }
    },
    seed?.state ?? { status: "idle" },
  );

  const state: NoteSignupState = clientInvalid
    ? { status: "invalid" }
    : actionState;
  const busy = pending || seed?.busy === true;

  useEffect(() => {
    if (!fromAction.current) return;
    if (actionState.status === "done") doneRef.current?.focus();
    if (actionState.status === "invalid") inputRef.current?.focus();
  }, [actionState]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || inFlight.current) return;
    if (!noteSignupSchema.safeParse({ email }).success) {
      setClientInvalid(true);
      inputRef.current?.focus();
      return;
    }
    setClientInvalid(false);
    const formData = new FormData(event.currentTarget);
    stampElapsed(formData);
    inFlight.current = true;
    fromAction.current = true;
    startTransition(() => dispatch(formData));
  }

  const message =
    state.status === "done"
      ? notes.done(state.email)
      : state.status === "error"
        ? notes.error
        : state.status === "invalid"
          ? notes.invalid
          : "";

  return (
    <div>
      <p aria-live="polite" className="sr-only">
        {message}
      </p>
      {state.status === "done" ? (
        <p
          ref={doneRef}
          tabIndex={-1}
          className="flex items-start gap-3 text-(length:--text-body) leading-[1.6] text-(--color-ink) focus:outline-none"
        >
          <CircleCheck
            aria-hidden
            size={20}
            strokeWidth={1.5}
            className="mt-[3px] shrink-0"
          />
          {notes.done(state.email)}
        </p>
      ) : (
        <form method="post" onSubmit={submit} noValidate className="relative">
          <Honeypot />
          <label
            htmlFor={fieldId}
            className="mb-2.5 block text-(length:--text-small) font-medium text-(--color-ink)"
          >
            {notes.label}
          </label>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              ref={inputRef}
              id={fieldId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={notes.placeholder}
              value={email}
              maxLength={NOTE_SIGNUP_MAX}
              onChange={(e) => {
                setEmail(e.target.value);
                setClientInvalid(false);
              }}
              aria-invalid={state.status === "invalid" ? true : undefined}
              aria-describedby={lineId}
              className={`${CONTROL} h-11 min-w-0 md:flex-1`}
            />
            <SubmitButton
              label={state.status === "error" ? notes.retry : notes.button}
              busyLabel={notes.sending}
              busy={busy}
              variant="ghost"
            />
          </div>
          {state.status === "error" || state.status === "invalid" ? (
            <ErrorLine id={lineId} className="mt-3">
              {message}
            </ErrorLine>
          ) : (
            <p
              id={lineId}
              className="mt-3 text-(length:--text-meta) text-(--color-dim)"
            >
              {notes.hint}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
