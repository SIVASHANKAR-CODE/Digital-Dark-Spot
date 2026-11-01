import type { IncomingMessage, ServerResponse } from 'http';
import app from '../apps/api/src/app';

/**
 * Vercel Serverless Function entry point.
 * Directs incoming /api/* traffic to the Express application.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  // If Vercel set matched path headers during URL rewrites, restore req.url
  const matchedPath = (req.headers['x-matched-path'] || req.headers['x-now-route-matches']) as string | undefined;
  if (matchedPath && typeof matchedPath === 'string' && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  }
  return app(req as any, res as any);
}
