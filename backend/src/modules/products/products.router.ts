import { Router } from 'express';
import { requireRoles } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema
} from './products.schema.js';
import { createProduct, getProduct, listProducts, updateProduct } from './products.service.js';

export const productsRouter = Router();

productsRouter.get(
  '/',
  requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(listProductsSchema),
  asyncHandler(async (req, res) => {
    const result = await listProducts(req.query as never);
    res.json({ success: true, data: result.rows, meta: result.meta });
  })
);

productsRouter.post(
  '/',
  requireRoles('ADMIN', 'WAREHOUSE'),
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await createProduct(req.body, req.user!.id);
    res.status(201).json({ success: true, data: product });
  })
);

productsRouter.get(
  '/:id',
  requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(productIdSchema),
  asyncHandler(async (req, res) => res.json({ success: true, data: await getProduct(String(req.params.id)) }))
);

productsRouter.put(
  '/:id',
  requireRoles('ADMIN', 'WAREHOUSE'),
  validate(updateProductSchema),
  asyncHandler(async (req, res) => res.json({ success: true, data: await updateProduct(String(req.params.id), req.body) }))
);

productsRouter.get(
  '/:id/movements',
  requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(productIdSchema),
  asyncHandler(async (req, res) => {
    const product = await getProduct(String(req.params.id));
    res.json({ success: true, data: product.stockMovements });
  })
);
