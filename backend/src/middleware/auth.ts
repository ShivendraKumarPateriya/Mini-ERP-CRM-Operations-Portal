import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../utils/httpError.js';
import { prisma } from '../utils/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new HttpError(401, 'UNAUTHENTICATED', 'Missing bearer token');

    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!user) throw new HttpError(401, 'UNAUTHENTICATED', 'User no longer exists');
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'UNAUTHENTICATED', 'Invalid or expired token'));
  }
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'UNAUTHENTICATED', 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
}
