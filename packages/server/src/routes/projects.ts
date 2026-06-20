import { Router } from 'express';
import { readData, saveData } from '../services/storage.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateProject } from '../middleware/validate.js';
import { openProject } from '../services/openProject.js';
import type { Project } from '@portfolio/shared';

const router = Router();

// GET /api/projects — list all projects, with optional search & tag filter
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await readData();
    let projects = data.projects;

    const search = req.query.search as string | undefined;
    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.services.some(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              String(s.port).includes(q),
          ),
      );
    }

    const tag = req.query.tag as string | undefined;
    if (tag) {
      projects = projects.filter((p) => p.tags.some((t) => t.name === tag));
    }

    // Sort by order, services sorted by order
    projects = projects.map((p) => ({
      ...p,
      services: [...p.services].sort((a, b) => a.order - b.order),
    }));
    projects.sort((a, b) => a.order - b.order);

    res.json({ ok: true, data: projects });
  }),
);

// POST /api/projects — create
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const errors = validateProject(req.body);
    if (errors.length > 0) {
      res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: errors.map(e => `${e.field}: ${e.message}`).join('; ') } });
      return;
    }

    const data = await readData();
    const maxOrder = data.projects.reduce((max, p) => Math.max(max, p.order), 0);
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name: req.body.name.trim(),
      description: req.body.description,
      path: req.body.path,
      tags: req.body.tags || [],
      services: [],
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1,
    };
    data.projects.push(project);
    await saveData(data);
    res.status(201).json({ ok: true, data: project });
  }),
);

// PUT /api/projects/reorder — reorder all projects
router.put(
  '/reorder',
  asyncHandler(async (req, res) => {
    const { projectIds } = req.body as { projectIds?: string[] };
    if (!Array.isArray(projectIds)) {
      res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'projectIds array is required' } });
      return;
    }

    const data = await readData();
    const idMap = new Map(data.projects.map((p) => [p.id, p]));
    for (let i = 0; i < projectIds.length; i++) {
      const p = idMap.get(projectIds[i]);
      if (p) p.order = i;
    }
    await saveData(data);
    res.json({ ok: true, data: data.projects.sort((a, b) => a.order - b.order) });
  }),
);

// GET /api/projects/:id — get single project
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }
    res.json({ ok: true, data: project });
  }),
);

// PUT /api/projects/:id — update
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const idx = data.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const errors = validateProject({ ...data.projects[idx], ...req.body });
    if (errors.length > 0) {
      res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: errors.map(e => `${e.field}: ${e.message}`).join('; ') } });
      return;
    }

    const project = data.projects[idx];
    if (req.body.name !== undefined) project.name = req.body.name.trim();
    if (req.body.description !== undefined) project.description = req.body.description;
    if (req.body.path !== undefined) project.path = req.body.path;
    if (req.body.tags !== undefined) project.tags = req.body.tags;
    project.updatedAt = new Date().toISOString();

    await saveData(data);
    res.json({ ok: true, data: project });
  }),
);

// DELETE /api/projects/:id — delete
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const idx = data.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }
    const removed = data.projects.splice(idx, 1)[0];
    await saveData(data);
    res.json({ ok: true, data: removed });
  }),
);

// POST /api/projects/:id/open — open project path
router.post(
  '/:id/open',
  asyncHandler(async (req, res) => {
    const data = await readData();
    const project = data.projects.find((p) => p.id === req.params.id);
    if (!project) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }
    if (!project.path) {
      res.status(400).json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Project has no path configured' } });
      return;
    }

    const method = (req.body?.method as 'explorer' | 'code' | 'terminal') || 'explorer';
    try {
      await openProject(project.path, method);
      res.json({ ok: true, data: { opened: project.path, method } });
    } catch (err) {
      res.status(500).json({ ok: false, error: { code: 'INTERNAL_ERROR', message: `Failed to open: ${(err as Error).message}` } });
    }
  }),
);

export default router;
