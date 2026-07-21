import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { loginSchema } from './auth.schema.js';
import { login } from './auth.service.js';

export const authRouter = Router();

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const data = await login(req.body.email, req.body.password);
    res.json({ success: true, data });
  })
);

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
