import { z } from 'zod';

export const createStockMovementSchema = z.object({
  body: z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().positive(),
    type: z.enum(['IN', 'OUT']),
    reason: z.string().min(1)
  })
});
