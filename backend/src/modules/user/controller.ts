import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/db';

export const userController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await query('SELECT id, name, email FROM users ORDER BY name ASC');
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};
