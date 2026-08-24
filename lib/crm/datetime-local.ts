/**
 * Values for `<input type="datetime-local">`.
 *
 * That control has no timezone. The string is the browser's wall clock —
 * Taylor's, on the laptop he is calling from — which is the same clock he
 * just agreed the time in. The server stores the instant `new Date(value)`
 * produces from that string.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** `YYYY-MM-DDTHH:mm` in the browser's local zone. */
export function toDatetimeLocalValue(at: Date): string {
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}T${pad(at.getHours())}:${pad(at.getMinutes())}`;
}

/** The top of the next hour — a callback that is not already in the past. */
export function startOfNextHour(now = new Date()): Date {
  const at = new Date(now.getTime());
  at.setSeconds(0, 0);
  at.setMinutes(0);
  at.setHours(at.getHours() + 1);
  return at;
}
