/** True when `NODE_ENV` is `development` (local `next dev`). */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}
