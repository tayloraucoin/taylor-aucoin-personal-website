"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Collapsible bands for the review scroll.
 *
 * The whole intake in one scroll is the point of this surface, and it is also
 * what makes it thirteen screens long: four flow bands, nine questionnaire
 * steps. Reviewing the wording of step 7 meant scrolling past six steps of
 * fields to reach it, and comparing step 3 against step 4 meant losing one to
 * find the other (Taylor, 2026-09-03).
 *
 * **Everything starts open.** A review surface that hides questions by default
 * is a review surface that hides the question nobody remembered to open. The
 * accordion is a way to get *out* of a section you have finished reading, not
 * a way in.
 *
 * ## Why sections register themselves
 *
 * "Collapse all" needs to know every section on the page, and the page does
 * not: the questionnaire's steps come from the step registry, resolved inside
 * `QuestionStack` from the track and the copy pack. Passing a hand-written id
 * list down from the page would be a second copy of that registry, which is
 * the same duplication `Reveal` refused for the same reason. So each section
 * registers on mount and the provider collapses whatever is present.
 *
 * Collapsing a parent unmounts its children, which deregisters them — but
 * their ids stay in the closed set, so reopening a flow band gives back
 * exactly the state it had. That is the honest behaviour: "collapse all" was
 * about every section, not only the ones that happened to be visible.
 */

type AccordionApi = {
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  register: (id: string) => () => void;
  openAll: () => void;
  closeAll: () => void;
  /** Hide a closed body instead of unmounting it. See the provider. */
  keepMounted: boolean;
};

const AccordionContext = createContext<AccordionApi | null>(null);

export function AccordionProvider({
  keepMounted = false,
  children,
}: Readonly<{
  /**
   * Keep closed bodies in the DOM, hidden, rather than unmounting them.
   *
   * Document mode's Markdown export is the rendered document's own HTML — that
   * is what stops the file disagreeing with the page. An unmounted section is
   * not in that HTML, so collapsing one before pressing Download would quietly
   * drop a whole step from the export. Hiding rather than unmounting keeps the
   * export complete whatever is collapsed, and document mode is prose rather
   * than nine live autosave forms, so nothing is being paid to keep it there.
   */
  keepMounted?: boolean;
  children: ReactNode;
}>) {
  // Open is the default, so the state tracks the exception. A section that has
  // never been touched is simply absent from this set.
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set());
  const [ids, setIds] = useState<readonly string[]>([]);

  const register = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => setIds((prev) => prev.filter((entry) => entry !== id));
  }, []);

  const api = useMemo<AccordionApi>(
    () => ({
      isOpen: (id) => !closed.has(id),
      toggle: (id) =>
        setClosed((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      register,
      openAll: () => setClosed(new Set()),
      closeAll: () => setClosed(new Set(ids)),
      keepMounted,
    }),
    [closed, ids, register, keepMounted],
  );

  return (
    <AccordionContext.Provider value={api}>
      {children}
    </AccordionContext.Provider>
  );
}

/**
 * The two buttons.
 *
 * Deliberately not a single "toggle all" that flips: with thirteen sections in
 * mixed states there is no honest answer to what one button should do next,
 * and a control whose effect depends on state you cannot see is a control you
 * press twice.
 */
export function AccordionControls() {
  const api = useContext(AccordionContext);
  if (!api) return null;

  return (
    <div className="flex items-center gap-1 rounded-(--radius) border border-(--color-faint) p-1">
      <ControlButton onClick={api.openAll}>Expand all</ControlButton>
      <ControlButton onClick={api.closeAll}>Collapse all</ControlButton>
    </div>
  );
}

function ControlButton({
  onClick,
  children,
}: Readonly<{ onClick: () => void; children: ReactNode }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-9 items-center rounded-sm px-3 text-sm text-(--color-body) transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
    >
      {children}
    </button>
  );
}

/**
 * One collapsible band: a heading that is entirely a button, and a body.
 *
 * `header` is the band's own eyebrow and title, rendered by the caller so this
 * component carries none of their typography and none of their words. It must
 * be phrasing content — spans, not paragraphs — because it renders inside the
 * button, and a `<p>` or an `<h2>` in there is markup the parser rewrites out
 * from under React. The heading level lives here instead, wrapping the button,
 * which is the pattern that keeps the sections navigable by heading.
 *
 * `note` sits below the button rather than inside it, and only while the band
 * is open: it is the band's explanatory line, not part of the name of a
 * toggle, and thirteen of them stacked is not the compact index that
 * "collapse all" is for.
 *
 * The state word on the right is the only string this file contributes, and it
 * names what pressing does.
 *
 * The body is unmounted when closed rather than hidden. These are live form
 * components with autosave hooks and file drops in them; keeping nine steps'
 * worth mounted behind `display: none` would be paying for every one of them
 * to review one. Document mode is the exception, and the provider says why.
 */
export function AccordionSection({
  header,
  note,
  children,
  className = "",
}: Readonly<{
  /** Phrasing content only — it renders inside the toggle. */
  header: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}>) {
  const api = useContext(AccordionContext);
  const id = useId();
  const bodyId = `${id}-body`;

  const register = api?.register;
  useEffect(() => register?.(id), [register, id]);

  // Outside a provider this is an ordinary always-open section, which is what
  // any non-admin consumer would want if one ever appeared.
  if (!api) {
    return (
      <div className={className}>
        <div>{header}</div>
        {note}
        {children}
      </div>
    );
  }

  const open = api.isOpen(id);

  return (
    <div className={className}>
      <h2 className="m-0">
        <button
          type="button"
          onClick={() => api.toggle(id)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="group flex w-full items-start justify-between gap-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-c2)"
        >
          <span className="min-w-0 grow">{header}</span>
          {/* A control's state word, not content: `data-md="skip"` keeps it
              out of the Markdown export, which reads this rendered DOM. */}
          <span
            data-md="skip"
            className="mt-1 shrink-0 font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors group-hover:text-(--color-c2)"
          >
            {open ? "Hide" : "Show"}
          </span>
        </button>
      </h2>

      {open || api.keepMounted ? (
        <div id={bodyId} hidden={!open}>
          {note}
          {children}
        </div>
      ) : null}
    </div>
  );
}
