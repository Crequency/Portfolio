import { Router } from 'express';
import { readData, saveData } from '../services/storage.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateService } from '../middleware/validate.js';
import { checkPortConflict } from '../services/portConflict.js';
import type { Service } from '@portfolio/shared';

const router = Router({ mergeParams: true });

// POST /api/projects/:projectId/services — add a service
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const errors = validateService(req.body);
    if (errors.length > 0) {
      res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: errors.map(e => `${e.field}: ${e.message}`).join('; ') } });
      return;
    }

    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.projectId);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const maxOrder = project.services.reduce((max, s) => Math.max(max, s.order), 0);
    const conflict = checkPortConflict(data.projects, req.body.port);
    const service: Service = {
      id: crypto.randomUUID(),
      name: req.body.name.trim(),
      port: req.body.port,
      description: req.body.description,
      status: 'unknown',
      order: maxOrder + 1,
    };

    project.services.push(service);
    project.updatedAt = new Date().toISOString();
    await saveData(data);

    const response: Record<string, unknown> = { ...service };
    if (conflict) {
      response.warning = { type: 'PORT_CONFLICT', ...conflict };
    }
    res.status(201).json({ ok: true, data: response });
  }),
);

// PUT /api/projects/:projectId/services/reorder — reorder services (MUST be before /:serviceId)
router.put(
  '/reorder',
  asyncHandler(async (req, res) => {
    const { serviceIds } = req.body as { serviceIds?: string[] };
    if (!Array.isArray(serviceIds)) {
      res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'serviceIds array is required' } });
      return;
    }

    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.projectId);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const idMap = new Map(project.services.map((s) => [s.id, s]));
    for (let i = 0; i < serviceIds.length; i++) {
      const svc = idMap.get(serviceIds[i]);
      if (svc) svc.order = i;
    }
    project.services.sort((a, b) => a.order - b.order);
    project.updatedAt = new Date().toISOString();
    await saveData(data);
    res.json({ ok: true, data: project.services });
  }),
);

// PUT /api/projects/:projectId/services/:serviceId — update a service
router.put(
  '/:serviceId',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.projectId);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const svcIdx = project.services.findIndex((s) => s.id === req.params.serviceId);
    if (svcIdx === -1) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
      return;
    }

    const errors = validateService({ ...project.services[svcIdx], ...req.body });
    if (errors.length > 0) {
      res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: errors.map(e => `${e.field}: ${e.message}`).join('; ') } });
      return;
    }

    const service = project.services[svcIdx];
    if (req.body.name !== undefined) service.name = req.body.name.trim();
    if (req.body.port !== undefined) service.port = req.body.port;
    if (req.body.description !== undefined) service.description = req.body.description;
    project.updatedAt = new Date().toISOString();

    const conflict = checkPortConflict(data.projects, service.port, service.id);
    await saveData(data);

    const response: Record<string, unknown> = { ...service };
    if (conflict) {
      response.warning = { type: 'PORT_CONFLICT', ...conflict };
    }
    res.json({ ok: true, data: response });
  }),
);

// DELETE /api/projects/:projectId/services/:serviceId — delete a service
router.delete(
  '/:serviceId',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.projectId);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const svcIdx = project.services.findIndex((s) => s.id === req.params.serviceId);
    if (svcIdx === -1) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
      return;
    }

    const removed = project.services.splice(svcIdx, 1)[0];
    project.updatedAt = new Date().toISOString();
    await saveData(data);
    res.json({ ok: true, data: removed });
  }),
);

export default router;
