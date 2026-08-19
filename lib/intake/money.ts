/**
 * Formats a deposit for display.
 *
 * Amounts live on the engagement row and nowhere else — there is no price
 * constant in this codebase, because every deal is quoted on its own call.
 * This function only renders what the row already says.
 */
export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    // Deposits are quoted in whole dollars; showing ".00" on a five-figure
    // number makes it read like a machine invoice rather than an agreement.
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
