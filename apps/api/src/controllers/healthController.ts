import { Request, Response } from 'express';
import config from '../config';
import type { HealthResponse, ApiResponse } from '../types';

const startTime = Date.now();

export function getHealth(req: Request, res: Response) {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const healthData: HealthResponse = {
    status: 'healthy',
    version: '1.0.0',
    uptime,
    services: {
      database: config.mongodbUri ? 'connected' : 'not_configured',
      ai: config.geminiApiKey || config.openaiApiKey ? 'configured' : 'not_configured',
      search: config.searchApiKey ? 'configured' : 'not_configured',
    },
  };

  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: healthData,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return res.json(response);
}
