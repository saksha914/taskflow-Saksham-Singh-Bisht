import { query, queryOne } from '../../config/db';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { Pagination } from '../../utils/pagination';
import { CreateProjectDto, UpdateProjectDto } from './schema';

interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

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

export const projectService = {
  async listForUser(userId: string, pagination: Pagination) {
    const { limit, offset } = pagination;
    const [rows, countRows] = await Promise.all([
      query<Project>(
        `SELECT DISTINCT p.* FROM projects p
         LEFT JOIN tasks t ON t.project_id = p.id
         WHERE p.owner_id = $1 OR t.assignee_id = $1
         ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      ),
      query<{ count: string }>(
        `SELECT COUNT(DISTINCT p.id) AS count FROM projects p
         LEFT JOIN tasks t ON t.project_id = p.id
         WHERE p.owner_id = $1 OR t.assignee_id = $1`,
        [userId],
      ),
    ]);
    return { data: rows, total: parseInt(countRows[0].count), page: pagination.page, limit };
  },

  async getById(projectId: string) {
    const project = await queryOne<Project>('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (!project) throw new NotFoundError('project');
    const tasks = await query<Task>(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId],
    );
    return { ...project, tasks };
  },

  async create(userId: string, data: CreateProjectDto) {
    return queryOne<Project>(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.description ?? null, userId],
    );
  },

  async update(projectId: string, userId: string, data: UpdateProjectDto) {
    const project = await queryOne<Project>('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (!project) throw new NotFoundError('project');
    if (project.owner_id !== userId) throw new ForbiddenError();

    return queryOne<Project>(
      `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id = $3 RETURNING *`,
      [data.name ?? null, data.description ?? null, projectId],
    );
  },

  async remove(projectId: string, userId: string) {
    const project = await queryOne<Project>('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (!project) throw new NotFoundError('project');
    if (project.owner_id !== userId) throw new ForbiddenError();
    await query('DELETE FROM projects WHERE id = $1', [projectId]);
  },

  async getStats(projectId: string) {
    const project = await queryOne<Project>('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (!project) throw new NotFoundError('project');

    const [byStatus, byAssignee] = await Promise.all([
      query<{ status: string; count: number }>(
        `SELECT status, COUNT(*)::int AS count
         FROM tasks WHERE project_id = $1 GROUP BY status`,
        [projectId],
      ),
      query<{ assignee_id: string; name: string; count: number }>(
        `SELECT t.assignee_id, u.name, COUNT(*)::int AS count
         FROM tasks t
         JOIN users u ON u.id = t.assignee_id
         WHERE t.project_id = $1 AND t.assignee_id IS NOT NULL
         GROUP BY t.assignee_id, u.name`,
        [projectId],
      ),
    ]);
    return { by_status: byStatus, by_assignee: byAssignee };
  },
};
