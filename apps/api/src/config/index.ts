import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  mongodbUri: string;
  geminiApiKey: string;
  openaiApiKey: string;
  aiProvider: 'gemini' | 'openai' | 'demo';
  searchApiKey: string;
  searchProvider: 'google' | 'none';
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  maxSources: number;
  maxContentLength: number;
  requestTimeoutMs: number;
}

function getEnv(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

function getEnvInt(key: string, fallback: number): number {
  const val = process.env[key];
  if (val === undefined || val === '') return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export const config: AppConfig = {
  port: getEnvInt('PORT', 3001),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
  mongodbUri: getEnv('MONGODB_URI', ''),
  geminiApiKey: getEnv('GEMINI_API_KEY', ''),
  openaiApiKey: getEnv('OPENAI_API_KEY', ''),
  aiProvider: (getEnv('AI_PROVIDER', 'demo') as AppConfig['aiProvider']),
  searchApiKey: getEnv('SEARCH_API_KEY', ''),
  searchProvider: (getEnv('SEARCH_PROVIDER', 'none') as AppConfig['searchProvider']),
  rateLimitWindowMs: getEnvInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  rateLimitMaxRequests: getEnvInt('RATE_LIMIT_MAX_REQUESTS', 100),
  maxSources: getEnvInt('MAX_SOURCES', 10),
  maxContentLength: getEnvInt('MAX_CONTENT_LENGTH', 50000),
  requestTimeoutMs: getEnvInt('REQUEST_TIMEOUT_MS', 30000),
};

/** Log config summary without exposing secrets */
export function logConfigSummary(): void {
  console.log('[Config] Environment:', config.nodeEnv);
  console.log('[Config] Port:', config.port);
  console.log('[Config] CORS Origin:', config.corsOrigin);
  console.log('[Config] AI Provider:', config.aiProvider);
  console.log('[Config] Gemini API Key:', config.geminiApiKey ? '***configured***' : 'not set');
  console.log('[Config] OpenAI API Key:', config.openaiApiKey ? '***configured***' : 'not set');
  console.log('[Config] Search Provider:', config.searchProvider);
  console.log('[Config] Search API Key:', config.searchApiKey ? '***configured***' : 'not set');
  console.log('[Config] MongoDB URI:', config.mongodbUri ? '***configured***' : 'not set (using in-memory)');
  console.log('[Config] Rate Limit:', `${config.rateLimitMaxRequests} requests per ${config.rateLimitWindowMs}ms`);
  console.log('[Config] Max Sources:', config.maxSources);
}

export default config;
