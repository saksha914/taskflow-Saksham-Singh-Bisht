export interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: Record<string, unknown>): Pagination {
  const page = Math.max(1, parseInt(String(query.page ?? 1)));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? 20))));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
