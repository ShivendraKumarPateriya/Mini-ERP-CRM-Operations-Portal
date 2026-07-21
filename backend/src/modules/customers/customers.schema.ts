import { z } from 'zod';

const mobile = z.string().regex(/^\+91[6-9]\d{9}$/, 'Use Indian mobile format +91XXXXXXXXXX');
const gst = z
  .string()
  .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Invalid GST number')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const customerBody = z.object({
  name: z.string().min(1),
  mobile,
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  businessName: z.string().min(1),
  gstNumber: gst,
  type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(1),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  followUpDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional()
});

export const listCustomersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
    type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).optional(),
    search: z.string().optional()
  })
});

export const createCustomerSchema = z.object({ body: customerBody });
export const updateCustomerSchema = z.object({ params: z.object({ id: z.string() }), body: customerBody.partial() });
export const customerIdSchema = z.object({ params: z.object({ id: z.string() }) });
export const createFollowUpSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ note: z.string().min(1) })
});
