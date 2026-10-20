import { notes } from "@/content/home";
import { NotesForm, type NotesSeed } from "./NotesForm";

/**
 * Home's one notes block (house-design.md, amended 2026-10-15): the heading
 * and its line left, the signup right; stacked at 390.
 */
export function NotesSignup({ seed }: { seed?: NotesSeed }) {
  return (
    <section
      aria-labelledby="notes-heading"
      className="mt-16 grid gap-8 border-t border-(--color-line-soft) pt-12 md:mt-24 md:grid-cols-2 md:gap-12 md:pt-16"
    >
      <div>
        <h2
          id="notes-heading"
          className="font-display text-(length:--text-h3) leading-[1.2] font-semibold tracking-(--tracking-h3) text-(--color-ink)"
        >
          {notes.heading}
        </h2>
        <p className="mt-3 max-w-[48ch] text-(length:--text-body) leading-[1.6] text-(--color-body)">
          {notes.line}
        </p>
      </div>
      <NotesForm seed={seed} />
    </section>
  );
}
