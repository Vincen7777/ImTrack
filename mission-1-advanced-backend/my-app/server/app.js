import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createTaskRouter } from './routes/taskRoutes.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createUploadRouter } from './routes/uploadRoutes.js';
import { createAuthMiddleware } from './middleware/authMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp({ taskService, authService, config }) {
  const app = express();
  const verifyToken = createAuthMiddleware({ jwtSecret: config.jwtSecret, authService });
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(authService, verifyToken));
  app.use(['/api/task', '/api/tasks'], verifyToken, createTaskRouter(taskService));
  app.use(['/api/upload', '/api/uploads', '/upload', '/uploads'], verifyToken);
  app.use('/api', createUploadRouter({ uploadDir: config.uploadDir, authService }));
  app.use('/', createUploadRouter({ uploadDir: config.uploadDir, authService }));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
