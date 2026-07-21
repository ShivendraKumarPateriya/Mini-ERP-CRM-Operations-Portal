import { Router } from 'express';
import { requireRoles } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  cancelChallan,
  confirmChallan,
  createChallan,
  getChallan,
  listChallans,
  updateDraftChallan
} from './challans.service.js';
import {
  challanIdSchema,
  createChallanSchema,
  listChallansSchema,
  updateDraftChallanSchema
} from './challans.schema.js';

export const challansRouter = Router();

challansRouter.get(
  '/',
  requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(listChallansSchema),
  asyncHandler(async (req, res) => {
    const result = await listChallans(req.query as never);
    res.json({ success: true, data: result.rows, meta: result.meta });
  })
);

challansRouter.post(
  '/',
  requireRoles('ADMIN', 'SALES'),
  validate(createChallanSchema),
  asyncHandler(async (req, res) => {
    const challan = await createChallan({ ...req.body, userId: req.user!.id });
    res.status(201).json({ success: true, data: challan });
  })
);

challansRouter.get(
  '/:id',
  requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(challanIdSchema),
  asyncHandler(async (req, res) => res.json({ success: true, data: await getChallan(String(req.params.id)) }))
);

challansRouter.put(
  '/:id',
  requireRoles('ADMIN', 'SALES'),
  validate(updateDraftChallanSchema),
  asyncHandler(async (req, res) => res.json({ success: true, data: await updateDraftChallan(String(req.params.id), req.body) }))
);

challansRouter.put(
  '/:id/confirm',
  requireRoles('ADMIN', 'SALES'),
  validate(challanIdSchema),
  asyncHandler(async (req, res) => {
    const challan = await confirmChallan(String(req.params.id), req.user!.id);
    res.json({ success: true, data: challan });
  })
);

challansRouter.put(
  '/:id/cancel',
  requireRoles('ADMIN', 'SALES'),
  validate(challanIdSchema),
  asyncHandler(async (req, res) => {
    const challan = await cancelChallan(String(req.params.id), req.user!.id);
    res.json({ success: true, data: challan });
  })
);
