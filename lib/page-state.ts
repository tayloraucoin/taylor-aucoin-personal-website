import { isProductionDeployment } from "@/lib/env";

/** A page's `searchParams` prop: a Promise in Next 15. */
export type PageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

/**
 * Every synthetic fixture carries this string somewhere in its data (an
 * address like `sam@fixture.invalid`, a link to `https://fixture.invalid`).
 * `.invalid` can never resolve, so the value is recognisably fake, and
 * `yarn check:build-output` fails a production build whose HTML holds it.
 */
export const FIXTURE_SENTINEL = "fixture.invalid";

/**
 * The `?state=` key a page should render (canon C-P08).
 *
 * Returns the requested key when it is one of the page's own States, else
 * `default`. On a production deployment it returns `default` without awaiting
 * `searchParams`, so the page prerenders static and no fixture renders there.
 */
export async function readPageState<K extends string>(
  searchParams: PageSearchParams | undefined,
  keys: readonly K[],
): Promise<K | "default"> {
  if (isProductionDeployment() || searchParams === undefined) return "default";

  const raw = (await searchParams).state;
  const requested = Array.isArray(raw) ? raw[0] : raw;
  return keys.find((key) => key === requested) ?? "default";
}
