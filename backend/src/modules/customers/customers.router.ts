import { Router } from 'express';
import { requireRoles } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  addFollowUp,
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer
} from './customers.service.js';
import {
  createCustomerSchema,
  createFollowUpSchema,
  customerIdSchema,
  listCustomersSchema,
  updateCustomerSchema
} from './customers.schema.js';

export const customersRouter = Router();

customersRouter.get(
  '/',
  requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(listCustomersSchema),
  asyncHandler(async (req, res) => {
    const result = await listCustomers(req.query as never);
    res.json({ success: true, data: result.rows, meta: result.meta });
  })
);

customersRouter.post(
  '/',
  requireRoles('ADMIN', 'SALES'),
  validate(createCustomerSchema),
  asyncHandler(async (req, res) => {
    const customer = await createCustomer({
      ...req.body,
      followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null
    });
    res.status(201).json({ success: true, data: customer });
  })
);

customersRouter.get(
  '/:id',
  requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(customerIdSchema),
  asyncHandler(async (req, res) => res.json({ success: true, data: await getCustomer(String(req.params.id)) }))
);

customersRouter.put(
  '/:id',
  requireRoles('ADMIN', 'SALES'),
  validate(updateCustomerSchema),
  asyncHandler(async (req, res) => {
    const customer = await updateCustomer(String(req.params.id), {
      ...req.body,
      followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : req.body.followUpDate
    });
    res.json({ success: true, data: customer });
  })
);

customersRouter.delete(
  '/:id',
  requireRoles('ADMIN'),
  validate(customerIdSchema),
  asyncHandler(async (req, res) => res.json({ success: true, data: await deleteCustomer(String(req.params.id)) }))
);

customersRouter.post(
  '/:id/followups',
  requireRoles('ADMIN', 'SALES'),
  validate(createFollowUpSchema),
  asyncHandler(async (req, res) => {
    const followUp = await addFollowUp(String(req.params.id), req.user!.id, req.body.note);
    res.status(201).json({ success: true, data: followUp });
  })
);

customersRouter.get(
  '/:id/followups',
  requireRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  validate(customerIdSchema),
  asyncHandler(async (req, res) => {
    const customer = await getCustomer(String(req.params.id));
    res.json({ success: true, data: customer.followUps });
  })
);
