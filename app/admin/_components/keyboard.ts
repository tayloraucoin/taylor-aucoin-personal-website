/**
 * The guards that keep a keystroke from logging a call by accident.
 *
 * One home rather than one copy per listener: call mode has two keyboard
 * handlers (j/k on the list, digits on the disposition row) and every past
 * defect here came from the two disagreeing about when a key was safe to act
 * on. Adding a guard should mean editing one function.
 */

/**
 * True when the keystroke belongs to something the user is typing in.
 *
 * The notes box sits directly above the disposition row and gets used
 * mid-call: "call back at 5" must put a 5 in the note, not log a fifth
 * disposition.
 */
export function isTypingTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * True when a modifier is held.
 *
 * Cmd+1 switches browser tabs; without this it would also have logged a
 * no-answer on whichever lead happened to be selected.
 */
export function hasModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}
