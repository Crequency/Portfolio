import { Router } from 'express';
import { readData, saveData } from '../services/storage.js';
import { checkPort } from '../services/portChecker.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import type { CheckResult } from '@portfolio/shared';

const router = Router();

// POST /api/check — check all services
router.post(
  '/',
  asyncHandler(async (_req, res) => {
    const data = await readData();
    const results: CheckResult[] = [];
    const CONCURRENCY = 5;

    // Flatten all services
    const tasks: Array<{ projectId: string; serviceId: string; port: number }> = [];
    for (const project of data.projects) {
      for (const service of project.services) {
        tasks.push({ projectId: project.id, serviceId: service.id, port: service.port });
      }
    }

    // Run with concurrency limit
    for (let i = 0; i < tasks.length; i += CONCURRENCY) {
      const batch = tasks.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (t) => {
          const checkResult = await checkPort(t.port);
          return { ...t, ...checkResult };
        }),
      );
      results.push(...batchResults);
    }

    // Update statuses
    const now = new Date().toISOString();
    for (const r of results) {
      const project = data.projects.find((p) => p.id === r.projectId);
      if (!project) continue;
      const service = project.services.find((s) => s.id === r.serviceId);
      if (!service) continue;
      service.status = r.status;
      service.lastCheckedAt = now;
    }

    await saveData(data);

    res.json({
      ok: true,
      data: {
        checked: results.length,
        results: results.map((r) => ({
          serviceId: r.serviceId,
          projectId: r.projectId,
          port: r.port,
          status: r.status,
          pid: r.pid,
          processName: r.processName,
        })),
      },
    });
  }),
);

// POST /api/check/:projectId — check one project
router.post(
  '/:projectId',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.projectId);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const results: CheckResult[] = [];
    const now = new Date().toISOString();

    for (const service of project.services) {
      const checkResult = await checkPort(service.port);
      service.status = checkResult.status;
      service.lastCheckedAt = now;
      results.push({
        serviceId: service.id,
        projectId: project.id,
        port: service.port,
        ...checkResult,
      });
    }

    await saveData(data);

    res.json({ ok: true, data: { checked: results.length, results } });
  }),
);

// POST /api/check/:projectId/:serviceId — check single service
router.post(
  '/:projectId/:serviceId',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.projectId);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }
    const service = project.services.find((s) => s.id === req.params.serviceId);
    if (!service) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
      return;
    }

    const checkResult = await checkPort(service.port);
    service.status = checkResult.status;
    service.lastCheckedAt = new Date().toISOString();
    await saveData(data);

    res.json({
      ok: true,
      data: {
        checked: 1,
        results: [{ serviceId: service.id, projectId: project.id, port: service.port, ...checkResult }],
      },
    });
  }),
);

export default router;
