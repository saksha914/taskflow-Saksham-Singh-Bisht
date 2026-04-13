import { Request, Response, NextFunction } from 'express';
import { authService } from './service';
import { HTTP } from '../../constants/httpStatus';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(HTTP.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(HTTP.OK).json(result);
    } catch (err) {
      next(err);
    }
  },
};
