import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError());
  }
  try {
    req.user = verifyJwt(header.slice(7));
    next();
  } catch {
    next(new UnauthorizedError());
  }
}

export function sseAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = (req.query.token as string) ?? req.headers.authorization?.split(' ')[1];
  if (!token) return next(new UnauthorizedError());
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    next(new UnauthorizedError());
  }
}
