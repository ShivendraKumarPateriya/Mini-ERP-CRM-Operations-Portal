import { z } from 'zod';

export const productBody = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.coerce.number().positive(),
  currentStock: z.coerce.number().int().min(0).default(0),
  minStockAlert: z.coerce.number().int().positive().default(10),
  warehouseLocation: z.string().optional().or(z.literal('').transform(() => undefined))
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStock: z.coerce.boolean().optional()
  })
});

export const createProductSchema = z.object({ body: productBody });
export const updateProductSchema = z.object({ params: z.object({ id: z.string() }), body: productBody.partial() });
export const productIdSchema = z.object({ params: z.object({ id: z.string() }) });
