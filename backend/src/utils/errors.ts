export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'resource') {
    super(404, `${resource} not found`);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super(403, 'forbidden');
  }
}

export class ValidationError extends AppError {
  constructor(fields: Record<string, string>) {
    super(400, 'validation failed', fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'unauthorized') {
    super(401, message);
  }
}
