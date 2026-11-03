import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import researchRoutes from './routes/research';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';

const app = express();

// Trust reverse proxies (Vercel, Cloudflare, AWS, Nginx) so client IP and rate-limiting work properly
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration — permit production Vercel deployment, localhost, and custom origin
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, serverless)
      if (!origin) return callback(null, true);
      if (
        config.corsOrigin === '*' ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        origin === config.corsOrigin
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// If Vercel pre-parsed the body, mark it so body-parser doesn't try to re-read the consumed stream
app.use((req, _res, next) => {
  if ((req as any).body && typeof (req as any).body === 'object') {
    (req as any)._body = true;
  }
  next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Rate limiter
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
    },
  },
});
app.use('/api/', limiter);
app.use('/v1/', limiter);

// Normalize req.url when rewritten through Vercel serverless functions
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '/api');
  }
  next();
});

// Root & Health status
app.get('/', (_req, res) => {
  res.json({
    name: 'Digital Dark Spot API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

// Mount API routes with /api/v1 prefix (standard client URL)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/research', researchRoutes);
app.use('/api/v1/health', healthRoutes);

// Also mount routes with /v1 prefix as fallback
app.use('/v1/auth', authRoutes);
app.use('/v1/research', researchRoutes);
app.use('/v1/health', healthRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
