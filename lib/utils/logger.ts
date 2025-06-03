/**
 * Advanced logging utility for the social media manager application
 * Provides structured logging with different log levels and formats
 */

import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Define log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logFilePath?: string;
  logFileMaxSize?: number; // in bytes
  formatJson?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === 'production',
  logFilePath: process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs', 'app.log'),
  logFileMaxSize: 10 * 1024 * 1024, // 10MB
  formatJson: process.env.NODE_ENV === 'production',
};

// ANSI color codes for console output
const COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.FATAL]: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',
};

/**
 * Logger class for handling application logs
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Ensure log directory exists if file logging is enabled
    if (this.config.enableFile && this.config.logFilePath) {
      const logDir = path.dirname(this.config.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Get the singleton instance of the logger
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Update logger configuration
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    // Skip if below minimum log level
    if (this.getLevelPriority(level) < this.getLevelPriority(this.config.minLevel)) {
      return;
    }

    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
    
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(error && { error: this.serializeError(error) }),
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // File logging
    if (this.config.enableFile && this.config.logFilePath) {
      this.logToFile(logEntry);
    }
  }

  /**
   * Log to console with colors
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message } = entry;
    
    const color = COLORS[level] || COLORS.RESET;
    const prefix = `${timestamp} ${color}[${level}]${COLORS.RESET}`;
    
    console.log(`${prefix} ${message}`);
    
    if (entry.context) {
      console.log('Context:', entry.context);
    }
    
    if (entry.error) {
      console.error('Error:', entry.error);
      if (entry.error.stack) {
        console.error('Stack:', entry.error.stack);
      }
    }
  }

  /**
   * Log to file
   */
  private logToFile(entry: LogEntry): void {
    if (!this.config.logFilePath) return;
    
    try {
      // Check file size and rotate if needed
      this.rotateLogFileIfNeeded();
      
      // Format the log entry
      let logLine: string;
      if (this.config.formatJson) {
        logLine = JSON.stringify(entry) + '\n';
      } else {
        logLine = `${entry.timestamp} [${entry.level}] ${entry.message}`;
        if (entry.context) {
          logLine += ` Context: ${JSON.stringify(entry.context)}`;
        }
        if (entry.error) {
          logLine += ` Error: ${JSON.stringify(entry.error)}`;
        }
        logLine += '\n';
      }
      
      // Append to log file
      fs.appendFileSync(this.config.logFilePath, logLine, { encoding: 'utf8' });
    } catch (err) {
      // Fall back to console if file logging fails
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Rotate log file if it exceeds the maximum size
   */
  private rotateLogFileIfNeeded(): void {
    if (!this.config.logFilePath || !this.config.logFileMaxSize) return;
    
    try {
      if (fs.existsSync(this.config.logFilePath)) {
        const stats = fs.statSync(this.config.logFilePath);
        
        if (stats.size >= this.config.logFileMaxSize) {
          const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
          const newPath = `${this.config.logFilePath}.${timestamp}`;
          
          fs.renameSync(this.config.logFilePath, newPath);
        }
      }
    } catch (err) {
      console.error('Failed to rotate log file:', err);
    }
  }

  /**
   * Serialize error objects for logging
   */
  private serializeError(error: Error): Record<string, any> {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any),
    };
  }

  /**
   * Get numeric priority for log level (higher = more severe)
   */
  private getLevelPriority(level: LogLevel): number {
    switch (level) {
      case LogLevel.DEBUG: return 0;
      case LogLevel.INFO: return 1;
      case LogLevel.WARN: return 2;
      case LogLevel.ERROR: return 3;
      case LogLevel.FATAL: return 4;
      default: return -1;
    }
  }

  // Public logging methods
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  public error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public fatal(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }
}

// Export a default logger instance
export const logger = Logger.getInstance();

// Helper function to log API requests
export function logApiRequest(req: any, context?: Record<string, any>): void {
  logger.info(`API Request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers,
    ...context,
  });
}

// Helper function to log API responses
export function logApiResponse(req: any, res: any, responseTime: number, context?: Record<string, any>): void {
  logger.info(`API Response: ${req.method} ${req.url} ${res.statusCode} (${responseTime}ms)`, {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime,
    ...context,
  });
}

// Helper function to log errors
export function logError(message: string, error: Error, context?: Record<string, any>): void {
  logger.error(message, context, error);
}