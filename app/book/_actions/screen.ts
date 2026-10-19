"use server";

import { screen } from "../_lib/screen";
import type { ScreeningState } from "../_lib/state";

/** The screening form's server action: `screen` on the posted answers. */
export async function screenAction(
  _previous: ScreeningState,
  formData: FormData,
): Promise<ScreeningState> {
  return screen(formData);
}
