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
import Link from "next/link";
import { Honeypot, useFillTimer } from "@/components/forms/BotFields";
import { ErrorLine } from "@/components/forms/ErrorLine";
import { TextAreaField, TextField } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { buttonVariants } from "@/components/ui/Button";
import { book, bookTitle } from "@/content/book";
import { track } from "@/lib/analytics/events";
import { siteRoutes } from "@/lib/routes";
import {
  BOOK_FIELDS,
  BOOK_LIMITS,
  bookFieldErrors,
  bookSchema,
  type BookInput,
  type Budget,
  type Role,
  type Start,
} from "@/lib/validators/book";
import { screenAction } from "../_actions/screen";
import type { ScreeningState } from "../_lib/state";
import { ChipGroup } from "./ChipGroup";
import { focusFirstField } from "./focus-first-field";

export type ScreeningValues = {
  building: string;
  budget: Budget | "";
  start: Start | "";
  role: Role | "";
  name: string;
  email: string;
};

/** A `?state=` fixture's starting view and answers (`app/book/_fixtures.ts`). */
export type ScreeningSeed = {
  state: ScreeningState;
  values?: Partial<ScreeningValues>;
};

const EMPTY: ScreeningValues = {
  building: "",
  budget: "",
  start: "",
  role: "",
  name: "",
  email: "",
};

const LINK =
  "inline-flex min-h-6 items-center text-(--color-ink) underline decoration-(--color-mark) underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

const H1 =
  "font-display text-[48px] leading-none font-semibold tracking-(--tracking-display) text-(--color-ink) focus:outline-none";

/**
 * The screening at `/book`: four questions, then the server's outcome on the
 * same URL (D-SITE-166, 167). Posts to `screenAction` on `useActionState`;
 * the client checks with the server's own schema first, never the fit rule.
 * A thrown action (offline) becomes the send error with every answer kept.
 * Each new view takes focus on its H1, the document title, and one
 * `screening_outcome` carrying the outcome only.
 */
export function ScreeningForm({ seed }: { seed?: ScreeningSeed }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inFlight = useRef(false);
  const fromAction = useRef(false);
  const stampElapsed = useFillTimer();

  const [values, setValues] = useState<ScreeningValues>({
    ...EMPTY,
    ...seed?.values,
  });
  const [clientErrors, setClientErrors] = useState<ScreeningState | null>(null);

  const [actionState, dispatch, pending] = useActionState<
    ScreeningState,
    FormData
  >(
    async (previous, formData) => {
      try {
        return await screenAction(previous, formData);
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

  useEffect(() => {
    if (!fromAction.current) return;
    if (actionState.status === "invalid" && formRef.current) {
      focusFirstField(formRef.current, BOOK_FIELDS, actionState.fields);
    }
    if (actionState.status !== "outcome") return;
    const h1 = actionState.outcome === "fit" ? book.fit.h1 : book.notAFit.h1;
    document.title = bookTitle(h1);
    headingRef.current?.focus();
    track("screening_outcome", { outcome: actionState.outcome });
  }, [actionState]);

  function set<F extends keyof ScreeningValues>(field: F) {
    return (value: ScreeningValues[F]) =>
      setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || inFlight.current) return;
    const form = event.currentTarget;

    const checked = bookSchema.safeParse({
      ...values,
      budget: values.budget || undefined,
      start: values.start || undefined,
      role: values.role || undefined,
    });
    if (!checked.success) {
      const fields = bookFieldErrors(checked.error);
      setClientErrors({ status: "invalid", fields });
      focusFirstField(form, BOOK_FIELDS, fields);
      return;
    }

    setClientErrors(null);
    const formData = new FormData(form);
    stampElapsed(formData);
    inFlight.current = true;
    fromAction.current = true;
    startTransition(() => dispatch(formData));
  }

  if (state.status === "outcome") {
    const isFit = state.outcome === "fit";
    return (
      <div>
        <h1 ref={headingRef} tabIndex={-1} className={H1}>
          {isFit ? book.fit.h1 : book.notAFit.h1}
        </h1>
        <p className="mt-4 text-lede leading-[1.6] text-(--color-body)">
          {isFit
            ? book.fit.intro(state.firstName)
            : book.notAFit.intro(state.firstName)}
        </p>
        <hr className="mt-10 border-(--color-line-soft)" />
        {isFit && state.answers ? <FitActions answers={state.answers} /> : null}
      </div>
    );
  }

  const fieldId = (name: string) => `${id}-${name}`;
  const fieldError = (name: keyof typeof book.errors) =>
    invalid[name] ? book.errors[name] : undefined;

  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className={H1}>
        {book.h1}
      </h1>
      <p className="mt-4 text-lede leading-[1.6] text-(--color-body)">
        {book.intro}
      </p>
      <hr className="mt-10 border-(--color-line-soft)" />

      <form
        ref={formRef}
        method="post"
        onSubmit={submit}
        noValidate
        className="relative mt-10 space-y-10"
      >
        <Honeypot />

        <TextAreaField
          id={fieldId("building")}
          name="building"
          label={book.fields.building.label}
          hint={book.fields.building.hint}
          error={fieldError("building")}
          value={values.building}
          onChange={(e) => set("building")(e.target.value)}
          maxLength={BOOK_LIMITS.building}
        />
        <ChipGroup
          id={fieldId("budget")}
          name="budget"
          label={book.fields.budget.label}
          options={book.budgets}
          value={values.budget}
          onChange={set("budget")}
          error={fieldError("budget")}
        />
        <ChipGroup
          id={fieldId("start")}
          name="start"
          label={book.fields.start.label}
          options={book.starts}
          value={values.start}
          onChange={set("start")}
          error={fieldError("start")}
        />
        <ChipGroup
          id={fieldId("role")}
          name="role"
          label={book.fields.role.label}
          options={book.roles}
          value={values.role}
          onChange={set("role")}
          error={fieldError("role")}
        />

        <div className="grid gap-10 md:grid-cols-2 md:gap-4">
          <TextField
            id={fieldId("name")}
            name="name"
            label={book.fields.name.label}
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            maxLength={BOOK_LIMITS.name}
          />
          <TextField
            id={fieldId("email")}
            name="email"
            type="email"
            label={book.fields.email.label}
            hint={book.fields.email.hint}
            autoComplete="email"
            error={fieldError("email")}
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
            maxLength={BOOK_LIMITS.email}
          />
        </div>

        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <SubmitButton
              label={book.button}
              busyLabel={book.sending}
              busy={pending}
            />
            <p className="text-meta text-(--color-dim)">{book.replyLine}</p>
          </div>
          {state.status === "error" ? (
            <ErrorLine role="alert" className="mt-4">
              {book.sendError.before}{" "}
              <a href={`mailto:${book.address}`} className={LINK}>
                {book.address}
              </a>{" "}
              {book.sendError.after}
            </ErrorLine>
          ) : null}
        </div>
      </form>
    </div>
  );
}

/**
 * The fit's call: a POST to the hand-off (SITE-22) with the answers in
 * hidden fields, so nothing typed enters a URL on this origin; beside it,
 * the note for those who would rather write first. The press sends
 * `book_call_click` and never waits on it: gtag queues the hit and sends it
 * when the page turns hidden, which leaving normally does.
 */
function FitActions({ answers }: { answers: BookInput }) {
  return (
    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <form method="post" action={siteRoutes.bookHandoff}>
        <input type="hidden" name="building" value={answers.building} />
        <input type="hidden" name="budget" value={answers.budget} />
        <input type="hidden" name="start" value={answers.start} />
        <input type="hidden" name="role" value={answers.role} />
        <input type="hidden" name="name" value={answers.name ?? ""} />
        <input type="hidden" name="email" value={answers.email} />
        <button
          type="submit"
          className={`${buttonVariants()} w-full md:w-auto`}
          onClick={() =>
            track("book_call_click", {
              surface: "services",
              placement: "screening_fit",
            })
          }
        >
          {book.fit.call}
        </button>
      </form>
      <p className="flex flex-wrap items-center gap-x-2 text-small text-(--color-dim)">
        <span>{book.fit.ratherWrite}</span>
        <Link href={siteRoutes.contact} className={LINK}>
          {book.fit.sendNote}
        </Link>
      </p>
    </div>
  );
}
