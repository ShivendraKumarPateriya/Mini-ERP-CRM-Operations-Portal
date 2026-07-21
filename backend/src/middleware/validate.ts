import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issue = error.issues[0];
        return next(new HttpError(400, 'VALIDATION_ERROR', issue?.message ?? 'Invalid input', issue?.path.join('.')));
      }
      next(error);
    }
  };
