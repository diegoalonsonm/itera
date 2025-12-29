// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response format
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: ApiError;
}

// Error structure
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Custom error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message: string, details?: any): AppError {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Unauthorized', details?: any): AppError {
    return new AppError(401, 'UNAUTHORIZED', message, details);
  }

  static forbidden(message = 'Forbidden', details?: any): AppError {
    return new AppError(403, 'FORBIDDEN', message, details);
  }

  static notFound(resource: string, details?: any): AppError {
    return new AppError(404, 'NOT_FOUND', `${resource} not found`, details);
  }

  static conflict(message: string, details?: any): AppError {
    return new AppError(409, 'CONFLICT', message, details);
  }

  static validation(message: string, details?: any): AppError {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static internal(message = 'Internal server error', details?: any): AppError {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message, details);
  }
}

// Auth-related types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}

// Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
