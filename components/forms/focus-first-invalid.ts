/**
 * Moves focus to the first invalid field in the order given (services-build
 * Access: no summary box, focus goes to the field). Names are the controls'
 * `name` attributes; returns whether anything was focused.
 */
export function focusFirstInvalid(
  form: HTMLFormElement,
  order: readonly string[],
  invalid: Partial<Record<string, unknown>>,
): boolean {
  for (const name of order) {
    if (!invalid[name]) continue;
    const control = form.elements.namedItem(name);
    if (control instanceof HTMLElement) {
      control.focus();
      return true;
    }
  }
  return false;
}
