/**
 * Moves focus to the first invalid field in the order given, a radio group
 * included: its checked radio, else its first (the kit's
 * `focusFirstInvalid` reaches single controls only).
 */
export function focusFirstField(
  form: HTMLFormElement,
  order: readonly string[],
  invalid: Partial<Record<string, unknown>>,
): void {
  for (const name of order) {
    if (!invalid[name]) continue;
    const control = form.elements.namedItem(name);
    if (control instanceof RadioNodeList) {
      const radios = Array.from(control) as HTMLInputElement[];
      (radios.find((r) => r.checked) ?? radios[0])?.focus();
      return;
    }
    if (control instanceof HTMLElement) {
      control.focus();
      return;
    }
  }
}
