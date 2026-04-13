import { Response } from 'express';

const clients = new Map<string, Set<Response>>();

export const sseClients = {
  add(projectId: string, res: Response) {
    if (!clients.has(projectId)) clients.set(projectId, new Set());
    clients.get(projectId)!.add(res);
  },
  remove(projectId: string, res: Response) {
    clients.get(projectId)?.delete(res);
  },
  broadcast(projectId: string, event: string, data: unknown) {
    clients.get(projectId)?.forEach((res) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });
  },
};
