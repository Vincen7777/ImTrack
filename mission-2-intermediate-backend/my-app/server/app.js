import express from 'express';
import cors from 'cors';
import { createTaskRouter } from './routes/taskRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp(taskService) {
  const app = express();
  const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

  app.disable('x-powered-by');
  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/task', createTaskRouter(taskService));
  app.use('/api/tasks', createTaskRouter(taskService));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
