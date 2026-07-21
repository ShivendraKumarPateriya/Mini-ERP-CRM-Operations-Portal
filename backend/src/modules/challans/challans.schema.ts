import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().int().positive()
});

export const listChallansSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional(),
    customerId: z.string().optional()
  })
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string(),
    status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
    items: z.array(itemSchema).min(1)
  })
});

export const updateDraftChallanSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    customerId: z.string().optional(),
    items: z.array(itemSchema).min(1).optional()
  })
});

export const challanIdSchema = z.object({ params: z.object({ id: z.string() }) });
