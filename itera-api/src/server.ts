import { createApp } from './app.js';
import { config } from './config/environment.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log('ITERA API Server');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port: ${config.port}`);
  console.log(`URL: http://localhost:${config.port}`);
});

const shutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));