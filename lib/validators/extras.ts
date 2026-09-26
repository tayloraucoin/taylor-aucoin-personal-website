import { z } from "zod";
import { EXTRAS_MAX_LINES } from "@/lib/extras/cart";

/**
 * The add-ons page's pay press (FIN-8), validated at the edge. Shape and
 * bounds only: which keys this engagement may buy is answered in
 * `server/services/extras.ts` against its own track and basket.
 */
export const extrasCheckoutInput = z.object({
  engagementId: z.uuid(),
  items: z
    .array(
      z.object({
        key: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9_]+$/),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(EXTRAS_MAX_LINES)
    .refine((list) => new Set(list.map((i) => i.key)).size === list.length, {
      message: "A line appears twice",
    }),
});

export type ExtrasCheckoutInput = z.infer<typeof extrasCheckoutInput>;
