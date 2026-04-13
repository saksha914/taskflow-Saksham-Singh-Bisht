import { Request, Response, NextFunction } from 'express';
import { taskService } from './service';
import { parsePagination } from '../../utils/pagination';
import { HTTP } from '../../constants/httpStatus';

export const taskController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const filters = {
        status: req.query.status as string | undefined,
        assignee: req.query.assignee as string | undefined,
      };
      const result = await taskService.listByProject(req.params.id, filters, pagination);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.create(req.params.id, req.body);
      res.status(HTTP.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.update(req.params.id, req.user!.userId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.remove(req.params.id, req.user!.userId);
      res.status(HTTP.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  },
};
