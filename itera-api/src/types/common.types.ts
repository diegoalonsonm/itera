// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
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
