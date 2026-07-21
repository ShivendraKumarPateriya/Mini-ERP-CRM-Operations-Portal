import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { allowedOrigins } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.router.js';
import { customersRouter } from './modules/customers/customers.router.js';
import { productsRouter } from './modules/products/products.router.js';
import { stockRouter } from './modules/stock/stock.router.js';
import { challansRouter } from './modules/challans/challans.router.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const isVercelPreview = Boolean(origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin));
      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/customers', requireAuth, customersRouter);
app.use('/api/v1/products', requireAuth, productsRouter);
app.use('/api/v1/stock', requireAuth, stockRouter);
app.use('/api/v1/challans', requireAuth, challansRouter);

app.use(errorHandler);
