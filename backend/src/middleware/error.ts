import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { error: err.message };
    if (err.fields) body.fields = err.fields;
    return res.status(err.statusCode).json(body);
  }

  logger.error(err, 'Unhandled error');
  res.status(500).json({ error: 'internal server error' });
}
