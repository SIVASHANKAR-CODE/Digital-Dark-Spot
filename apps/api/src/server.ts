import app from './app';
import config, { logConfigSummary } from './config';

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(` Digital Dark Spot API Server running on port ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` API Version: v1 (/api/v1/health, /api/v1/research)`);
  console.log(`===============================================`);
  logConfigSummary();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed out remaining connections.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed out remaining connections.');
    process.exit(0);
  });
});

export default server;

