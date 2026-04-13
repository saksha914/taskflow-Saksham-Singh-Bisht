import { Router } from 'express';
import { taskController } from './controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema } from './schema';

const router = Router();

// Nested under /projects/:id/tasks
router.get('/projects/:id/tasks', authenticate, taskController.list);
router.post('/projects/:id/tasks', authenticate, validate(createTaskSchema), taskController.create);

// Top-level /tasks/:id
router.patch('/tasks/:id', authenticate, validate(updateTaskSchema), taskController.update);
router.delete('/tasks/:id', authenticate, taskController.remove);

export default router;
