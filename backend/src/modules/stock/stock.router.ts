import { Router } from 'express';
import { requireRoles } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { createStockMovementSchema } from './stock.schema.js';
import { createStockMovement } from './stock.service.js';

export const stockRouter = Router();

stockRouter.post(
  '/movement',
  requireRoles('ADMIN', 'WAREHOUSE'),
  validate(createStockMovementSchema),
  asyncHandler(async (req, res) => {
    const movement = await createStockMovement({ ...req.body, userId: req.user!.id });
    res.status(201).json({ success: true, data: movement });
  })
);
