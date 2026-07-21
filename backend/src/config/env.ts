import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15d'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
export const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
