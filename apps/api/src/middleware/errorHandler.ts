import { Request, Response, NextFunction } from 'express';
import config from '../config';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Centralized Express error handler.
 * Returns structured { success: false, error: { code, message } }.
 * Never exposes stack traces in production.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message =
    statusCode === 500 && config.nodeEnv === 'production'
      ? 'An internal server error occurred'
      : err.message || 'An unexpected error occurred';

  // Log error with timestamp
  console.error(`[${new Date().toISOString()}] ERROR ${statusCode} ${code}:`, err.message);
  if (config.nodeEnv !== 'production' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Create a typed application error with status code.
 */
export function createAppError(message: string, statusCode: number, code: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
