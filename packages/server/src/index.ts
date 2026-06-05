import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { errorHandler } from './middleware/errorHandler.js';
import projectsRouter from './routes/projects.js';
import servicesRouter from './routes/services.js';
import checkRouter from './routes/check.js';
import dataRouter from './routes/data.js';
import pingRouter from './routes/ping.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api/projects', projectsRouter);
  app.use('/api/projects/:projectId/services', servicesRouter);
  app.use('/api/check', checkRouter);
  app.use('/api', dataRouter);
  app.use('/api', pingRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, data: { status: 'healthy' } });
  });

  // Production: serve web build
  const webDist = path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '../../web/dist');
  if (fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(webDist, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}

const PORT = parseInt(process.env.PORT || '45311', 10);

const isMain = process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js'));
if (isMain || process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[Portfolio Server] running at http://localhost:${PORT}`);
  });
}
