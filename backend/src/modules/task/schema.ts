import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants/enums';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  status: z.enum(TASK_STATUS).optional(),
  priority: z.enum(TASK_PRIORITY).optional(),
  assignee_id: z.string().uuid('invalid assignee_id').optional().nullable(),
  due_date: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'title is required').optional(),
  description: z.string().optional().nullable(),
  status: z.enum(TASK_STATUS).optional(),
  priority: z.enum(TASK_PRIORITY).optional(),
  assignee_id: z.string().uuid('invalid assignee_id').optional().nullable(),
  due_date: z.string().optional().nullable(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
