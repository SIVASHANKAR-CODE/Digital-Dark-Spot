import { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger middleware.
 * Logs method, path, status code, and response time.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Log once the response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.originalUrl || req.url;

    console.log(
      `[${new Date().toISOString()}] ${method} ${path} → ${statusCode} (${duration}ms)`
    );
  });

  next();
}
