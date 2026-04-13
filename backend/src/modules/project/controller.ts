import { Request, Response, NextFunction } from 'express';
import { projectService } from './service';
import { parsePagination } from '../../utils/pagination';
import { HTTP } from '../../constants/httpStatus';

export const projectController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await projectService.listForUser(req.user!.userId, pagination);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.getById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.create(req.user!.userId, req.body);
      res.status(HTTP.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.update(req.params.id, req.user!.userId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.remove(req.params.id, req.user!.userId);
      res.status(HTTP.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  },

  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.getStats(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
