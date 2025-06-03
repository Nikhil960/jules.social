import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { logger, LogLevel } from '../../lib/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  appendFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(() => []),
  statSync: vi.fn(() => ({ size: 1024, isDirectory: () => false })),
  unlinkSync: vi.fn(),
}));

// Mock path module
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
}));

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.debug = vi.fn();
  console.info = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.debug = originalConsole.debug;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  vi.clearAllMocks();
});

describe('Logger', () => {
  beforeEach(() => {
    // Reset logger configuration before each test
    logger.configure({
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      logFilePath: '/logs/app.log',
      maxLogFileSizeBytes: 10 * 1024 * 1024, // 10MB
      maxLogFiles: 5,
    });
  });

  describe('Log Levels', () => {
    it('should respect log level hierarchy', () => {
      // Set log level to WARN
      logger.configure({ level: LogLevel.WARN });

      // These should not be logged
      logger.debug('Debug message');
      logger.info('Info message');

      // These should be logged
      logger.warn('Warning message');
      logger.error('Error message');
      logger.fatal('Fatal message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'Warning message');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Error message');
      expect(console.error).toHaveBeenCalledWith('[FATAL]', 'Fatal message');
    });
  });

  describe('Console Logging', () => {
    it('should log to console when enabled', () => {
      logger.configure({ enableConsole: true });
      logger.info('Test message');
      expect(console.info).toHaveBeenCalledWith('[INFO]', 'Test message');
    });

    it('should not log to console when disabled', () => {
      logger.configure({ enableConsole: false });
      logger.info('Test message');
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe('File Logging', () => {
    beforeEach(() => {
      // Mock fs.existsSync to return false for directory and true for file
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        if (path === '/logs') return false;
        return true;
      });
    });

    it('should create log directory if it does not exist', () => {
      logger.configure({ enableFile: true, logFilePath: '/logs/app.log' });
      logger.info('Test message');

      expect(fs.existsSync).toHaveBeenCalledWith('/logs');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/logs', { recursive: true });
    });

    it('should write to log file when file logging is enabled', () => {
      logger.configure({ enableFile: true, logFilePath: '/logs/app.log' });
      logger.info('Test message');

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/logs/app.log',
        expect.stringContaining('[INFO] Test message')
      );
    });

    it('should not write to log file when file logging is disabled', () => {
      logger.configure({ enableFile: false });
      logger.info('Test message');

      expect(fs.appendFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Log Rotation', () => {
    beforeEach(() => {
      // Mock file size to be larger than maxLogFileSizeBytes
      vi.mocked(fs.statSync).mockReturnValue({
        size: 15 * 1024 * 1024, // 15MB
        isDirectory: () => false,
      } as any);

      // Mock directory read to return existing log files
      vi.mocked(fs.readdirSync).mockReturnValue([
        'app.log',
        'app.1.log',
        'app.2.log',
        'app.3.log',
        'app.4.log',
        'app.5.log',
      ]);
    });

    it('should rotate log files when max size is reached', () => {
      logger.configure({
        enableFile: true,
        logFilePath: '/logs/app.log',
        maxLogFileSizeBytes: 10 * 1024 * 1024, // 10MB
        maxLogFiles: 5,
      });

      logger.info('Test message');

      // Check if the oldest log file is deleted
      expect(fs.unlinkSync).toHaveBeenCalledWith('/logs/app.5.log');

      // Check if files are rotated
      for (let i = 4; i >= 1; i--) {
        expect(fs.renameSync).toHaveBeenCalledWith(
          `/logs/app.${i}.log`,
          `/logs/app.${i + 1}.log`
        );
      }

      // Check if current log is renamed
      expect(fs.renameSync).toHaveBeenCalledWith(
        '/logs/app.log',
        '/logs/app.1.log'
      );

      // Check if new log file is created
      expect(fs.writeFileSync).toHaveBeenCalledWith('/logs/app.log', '');
    });
  });

  describe('Context and Error Logging', () => {
    it('should log context object', () => {
      const context = { userId: '123', action: 'login' };
      logger.info('User action', context);

      expect(console.info).toHaveBeenCalledWith(
        '[INFO]',
        'User action',
        context
      );
    });

    it('should log error objects with stack trace', () => {
      const error = new Error('Test error');
      logger.error('An error occurred', { userId: '123' }, error);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR]',
        'An error occurred',
        { userId: '123' },
        error
      );
    });
  });

  describe('Helper Methods', () => {
    it('should log API requests', () => {
      const req = {
        method: 'GET',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
      };

      logger.logApiRequest(req);

      expect(console.info).toHaveBeenCalledWith(
        '[INFO]',
        'API Request:',
        expect.objectContaining({
          method: 'GET',
          url: '/api/users',
          headers: { 'content-type': 'application/json' },
        })
      );
    });

    it('should log API responses', () => {
      const res = {
        status: 200,
        body: { success: true, data: [] },
      };

      logger.logApiResponse(res);

      expect(console.info).toHaveBeenCalledWith(
        '[INFO]',
        'API Response:',
        expect.objectContaining({
          status: 200,
          body: { success: true, data: [] },
        })
      );
    });

    it('should log API errors', () => {
      const error = new Error('API Error');
      const context = { endpoint: '/api/users', method: 'GET' };

      logger.logApiError('Failed to fetch users', context, error);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR]',
        'API Error: Failed to fetch users',
        context,
        error
      );
    });
  });
});