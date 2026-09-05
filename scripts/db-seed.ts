import { applyTierEnv } from "./_env";

applyTierEnv();

/**
 * Entry point for `yarn db:seed`.
 *
 * The catalogue itself lives in `seed-products.ts`, which is the one file to
 * edit when a product, price, description, or tax code changes. That module is
 * imported by `setup-stripe-catalogue.ts` too, so it deliberately has no
 * top-level side effects — this file supplies the side effect.
 *
 * `applyTierEnv` runs before the import so the module's tier-aware reads see a
 * populated environment.
 */
async function main(): Promise<void> {
  const { seedProducts } = await import("./seed-products");
  await seedProducts();
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
