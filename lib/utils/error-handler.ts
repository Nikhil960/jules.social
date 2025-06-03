import { NextResponse } from 'next/server';
import { logger } from './logger';

// Base error class for application errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  context?: Record<string, any>;

  constructor(message: string, statusCode: number, isOperational = true, code?: string, context?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.context = context;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, 400, true, code || 'VALIDATION_ERROR', context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, 401, true, code || 'AUTHENTICATION_ERROR', context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, 403, true, code || 'AUTHORIZATION_ERROR', context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, 404, true, code || 'NOT_FOUND', context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, 409, true, code || 'CONFLICT', context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, 429, true, code || 'RATE_LIMIT_EXCEEDED', context);
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string, statusCode = 502, code?: string, context?: Record<string, any>) {
    super(message, statusCode, true, code || 'EXTERNAL_API_ERROR', context);
  }
}

/**
 * Global error handler for processing errors and generating appropriate responses
 */
export function handleError(error: any, req?: Request): NextResponse {
  // Log the error with appropriate context
  const errorContext = {
    url: req?.url,
    method: req?.method,
    headers: Object.fromEntries(req?.headers || []),
    ...(error.context || {}),
  };

  // Log operational errors as warnings, programming errors as errors
  if (error instanceof AppError && error.isOperational) {
    logger.warn(`Operational error: ${error.message}`, errorContext, error);
  } else {
    logger.error(`Unhandled error: ${error.message || 'Unknown error'}`, errorContext, error);
  }

  // Create standardized error response
  return createErrorResponse(error);
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: any): NextResponse {
  // Default values for unknown errors
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_SERVER_ERROR';
  let details = undefined;
  let isOperational = false;

  // Handle AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || `ERROR_${statusCode}`;
    isOperational = error.isOperational;
    details = error.context;
  }
  // Handle validation library errors (e.g., Zod, Yup)
  else if (error.name === 'ZodError' || error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    isOperational = true;
    details = error.errors || error.issues || error.message;
  }
  // Handle database errors
  else if (error.code && (error.code.startsWith('P') || error.code.startsWith('DB'))) {
    statusCode = 500;
    message = 'Database error';
    code = error.code;
    isOperational = false;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    isOperational = true;
  }
  // Handle fetch/network errors
  else if (error.name === 'FetchError' || error.name === 'NetworkError') {
    statusCode = 503;
    message = 'Service unavailable';
    code = 'SERVICE_UNAVAILABLE';
    isOperational = true;
    details = { originalError: error.message };
  }
  // Handle rate limiting errors
  else if (error.name === 'RateLimitError' || error.code === 'RATE_LIMIT_EXCEEDED') {
    statusCode = 429;
    message = 'Too many requests';
    code = 'RATE_LIMIT_EXCEEDED';
    isOperational = true;
  }

  // Create the error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: error.stack }),
    },
  };

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Middleware for handling errors in API routes
 */
export function withErrorHandling(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleError(error, req);
    }
  };
}
