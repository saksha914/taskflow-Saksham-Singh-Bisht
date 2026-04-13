import client from './client';
import { Task, PaginatedResponse } from '../types';

export const taskApi = {
  list(projectId: string, params?: { status?: string; assignee?: string; page?: number; limit?: number }) {
    return client.get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks`, { params });
  },
  create(projectId: string, data: { title: string; description?: string; status?: string; priority?: string; assignee_id?: string | null; due_date?: string | null }) {
    return client.post<Task>(`/projects/${projectId}/tasks`, data);
  },
  update(taskId: string, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignee_id' | 'due_date'>>) {
    return client.patch<Task>(`/tasks/${taskId}`, data);
  },
  remove(taskId: string) {
    return client.delete(`/tasks/${taskId}`);
  },
};
