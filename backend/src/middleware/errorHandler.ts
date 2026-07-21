import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/httpError.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message, field: error.field }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'A record with this unique value already exists' }
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' }
  });
}
