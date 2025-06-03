import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalApiError,
  handleError,
  createErrorResponse,
  withErrorHandling
} from '../../lib/utils/error-handler';
import { logger } from '../../lib/utils/logger';
import { NextResponse } from 'next/server';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      status: options?.status || 200,
    })),
  },
}));

// Mock logger
vi.mock('../../lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock process.env
vi.stubGlobal('process', {
  env: {
    NODE_ENV: 'development',
  },
});

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Classes', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 400, true, 'TEST_ERROR', { foo: 'bar' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toEqual({ foo: 'bar' });
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });

    it('should create ValidationError with correct defaults', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create AuthenticationError with correct defaults', () => {
      const error = new AuthenticationError('Login failed');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Login failed');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should create AuthorizationError with correct defaults', () => {
      const error = new AuthorizationError('Permission denied');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Permission denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should create NotFoundError with correct defaults', () => {
      const error = new NotFoundError('User not found');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create ConflictError with correct defaults', () => {
      const error = new ConflictError('User already exists');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('User already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });

    it('should create RateLimitError with correct defaults', () => {
      const error = new RateLimitError('Too many requests');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should create ExternalApiError with correct defaults', () => {
      const error = new ExternalApiError('API unavailable');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('API unavailable');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_API_ERROR');
    });
  });

  describe('handleError', () => {
    it('should log operational errors as warnings', () => {
      const error = new ValidationError('Invalid input', 'INVALID_FIELD', { field: 'email' });
      const req = new Request('https://example.com/api/users');
      
      handleError(error, req);
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Operational error: Invalid input',
        expect.objectContaining({
          url: 'https://example.com/api/users',
          method: 'GET',
          field: 'email',
        }),
        error
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log non-operational errors as errors', () => {
      const error = new Error('Unexpected error');
      const req = new Request('https://example.com/api/users');
      
      handleError(error, req);
      
      expect(logger.error).toHaveBeenCalledWith(
        'Unhandled error: Unexpected error',
        expect.objectContaining({
          url: 'https://example.com/api/users',
          method: 'GET',
        }),
        error
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should handle missing request object', () => {
      const error = new ValidationError('Invalid input');
      
      handleError(error);
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Operational error: Invalid input',
        expect.objectContaining({}),
        error
      );
    });
  });

  describe('createErrorResponse', () => {
    it('should create response for AppError', () => {
      const error = new ValidationError('Invalid input', 'INVALID_FIELD', { field: 'email' });
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Invalid input',
            code: 'INVALID_FIELD',
            details: { field: 'email' },
          },
        },
        { status: 400 }
      );
    });

    it('should create response for validation library errors', () => {
      const error = {
        name: 'ZodError',
        issues: [
          { path: ['email'], message: 'Invalid email format' },
        ],
      };
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: [
              { path: ['email'], message: 'Invalid email format' },
            ],
          },
        },
        { status: 400 }
      );
    });

    it('should create response for database errors', () => {
      const error = {
        code: 'P2002',
        message: 'Unique constraint failed',
      };
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Database error',
            code: 'P2002',
            stack: undefined,
          },
        },
        { status: 500 }
      );
    });

    it('should create response for JWT errors', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Token expired',
            code: 'TOKEN_EXPIRED',
          },
        },
        { status: 401 }
      );
    });

    it('should create response for fetch/network errors', () => {
      const error = {
        name: 'FetchError',
        message: 'Failed to fetch',
      };
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Service unavailable',
            code: 'SERVICE_UNAVAILABLE',
            details: { originalError: 'Failed to fetch' },
          },
        },
        { status: 503 }
      );
    });

    it('should create response for rate limiting errors', () => {
      const error = {
        name: 'RateLimitError',
        message: 'Too many requests',
      };
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
        { status: 429 }
      );
    });

    it('should create response for unknown errors', () => {
      const error = new Error('Something went wrong');
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
            stack: error.stack,
          },
        },
        { status: 500 }
      );
    });

    it('should not include stack trace in production', () => {
      // Change NODE_ENV to production
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Something went wrong');
      
      const response = createErrorResponse(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
          },
        },
        { status: 500 }
      );
      
      // Reset NODE_ENV
      process.env.NODE_ENV = 'development';
    });
  });

  describe('withErrorHandling', () => {
    it('should wrap handler and return response on success', async () => {
      const mockResponse = { data: 'success' };
      const handler = vi.fn().mockResolvedValue(mockResponse);
      const wrappedHandler = withErrorHandling(handler);
      const req = new Request('https://example.com/api/users');
      
      const result = await wrappedHandler(req);
      
      expect(handler).toHaveBeenCalledWith(req);
      expect(result).toBe(mockResponse);
    });

    it('should catch errors and return error response', async () => {
      const error = new NotFoundError('User not found');
      const handler = vi.fn().mockRejectedValue(error);
      const wrappedHandler = withErrorHandling(handler);
      const req = new Request('https://example.com/api/users/123');
      
      await wrappedHandler(req);
      
      expect(handler).toHaveBeenCalledWith(req);
      expect(logger.warn).toHaveBeenCalledWith(
        'Operational error: User not found',
        expect.objectContaining({
          url: 'https://example.com/api/users/123',
        }),
        error
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    });
  });
});