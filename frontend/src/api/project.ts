import client from './client';
import { Project, PaginatedResponse, ProjectStats } from '../types';

export const projectApi = {
  list(page = 1, limit = 20) {
    return client.get<PaginatedResponse<Project>>('/projects', { params: { page, limit } });
  },
  getById(id: string) {
    return client.get<Project>(`/projects/${id}`);
  },
  create(name: string, description?: string) {
    return client.post<Project>('/projects', { name, description });
  },
  update(id: string, data: { name?: string; description?: string }) {
    return client.patch<Project>(`/projects/${id}`, data);
  },
  remove(id: string) {
    return client.delete(`/projects/${id}`);
  },
  getStats(id: string) {
    return client.get<ProjectStats>(`/projects/${id}/stats`);
  },
};
