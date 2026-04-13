import { query, queryOne } from '../../config/db';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { sseClients } from '../../utils/sseClients';
import { Pagination } from '../../utils/pagination';
import { CreateTaskDto, UpdateTaskDto } from './schema';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  project_id: string;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  owner_id: string;
}

interface TaskFilters {
  status?: string;
  assignee?: string;
}

export const taskService = {
  async listByProject(projectId: string, filters: TaskFilters, pagination: Pagination) {
    const conditions: string[] = ['project_id = $1'];
    const params: unknown[] = [projectId];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters.assignee) {
      params.push(filters.assignee);
      conditions.push(`assignee_id = $${params.length}`);
    }

    const where = conditions.join(' AND ');
    const { limit, offset } = pagination;

    const [rows, countRows] = await Promise.all([
      query<Task>(
        `SELECT * FROM tasks WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM tasks WHERE ${where}`,
        params,
      ),
    ]);

    return { data: rows, total: parseInt(countRows[0].count as unknown as string), page: pagination.page, limit };
  },

  async create(projectId: string, data: CreateTaskDto) {
    const task = await queryOne<Task>(
      `INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.status ?? 'todo',
        data.priority ?? 'medium',
        projectId,
        data.assignee_id ?? null,
        data.due_date ?? null,
      ],
    );
    sseClients.broadcast(projectId, 'task:created', task);
    return task;
  },

  async update(taskId: string, userId: string, data: UpdateTaskDto) {
    const task = await queryOne<Task>('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!task) throw new NotFoundError('task');

    // Check authorization: must be project owner or task assignee
    const project = await queryOne<Project>('SELECT id, owner_id FROM projects WHERE id = $1', [task.project_id]);
    if (project!.owner_id !== userId && task.assignee_id !== userId) {
      throw new ForbiddenError();
    }

    const updated = await queryOne<Task>(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assignee_id = COALESCE($5, assignee_id),
        due_date = COALESCE($6, due_date)
       WHERE id = $7 RETURNING *`,
      [
        data.title ?? null,
        data.description ?? null,
        data.status ?? null,
        data.priority ?? null,
        data.assignee_id ?? null,
        data.due_date ?? null,
        taskId,
      ],
    );
    sseClients.broadcast(updated!.project_id, 'task:updated', updated);
    return updated;
  },

  async remove(taskId: string, userId: string) {
    const task = await queryOne<Task>('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!task) throw new NotFoundError('task');

    const project = await queryOne<Project>('SELECT id, owner_id FROM projects WHERE id = $1', [task.project_id]);
    if (project!.owner_id !== userId && task.assignee_id !== userId) {
      throw new ForbiddenError();
    }

    await query('DELETE FROM tasks WHERE id = $1', [taskId]);
    sseClients.broadcast(task.project_id, 'task:deleted', { id: taskId });
  },
};
