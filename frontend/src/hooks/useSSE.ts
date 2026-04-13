import { useEffect } from 'react';
import { API_URL } from '../api/client';

export function useSSE(projectId: string, onEvent: (type: string, data: unknown) => void) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = `${API_URL}/projects/${projectId}/events?token=${token}`;
    const es = new EventSource(url);

    es.addEventListener('task:created', (e) => onEvent('task:created', JSON.parse(e.data)));
    es.addEventListener('task:updated', (e) => onEvent('task:updated', JSON.parse(e.data)));
    es.addEventListener('task:deleted', (e) => onEvent('task:deleted', JSON.parse(e.data)));

    es.onerror = () => es.close();

    return () => es.close();
  }, [projectId]);
}
