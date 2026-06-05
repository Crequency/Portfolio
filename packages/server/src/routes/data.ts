import { Router } from 'express';
import { readData, saveData, ensureDir } from '../services/storage.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import type { DataFile } from '@portfolio/shared';
import { rotateBackups } from '../services/backup.js';
import os from 'node:os';
import path from 'node:path';

const router = Router();

// GET /api/export — export all data as JSON
router.get(
  '/export',
  asyncHandler(async (_req, res) => {
    const data = await readData();
    res.setHeader('Content-Disposition', 'attachment; filename="portfolio-export.json"');
    res.json(data);
  }),
);

// POST /api/import — import JSON data
router.post(
  '/import',
  asyncHandler(async (req, res) => {
    const { data, mode } = req.body as { data?: DataFile; mode?: 'merge' | 'replace' };

    if (!data || typeof data !== 'object' || !Array.isArray(data.projects)) {
      res.status(422).json({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid import data: must include a "projects" array' },
      });
      return;
    }

    const current = await readData();
    const dataDir = path.join(os.homedir(), '.portfolio');

    // Backup before import
    await rotateBackups(dataDir);

    if (mode === 'replace') {
      await saveData(data);
    } else {
      // Merge: add projects that don't exist by id
      const existingIds = new Set(current.projects.map((p) => p.id));
      for (const project of data.projects) {
        if (!existingIds.has(project.id)) {
          current.projects.push(project);
        }
      }
      await saveData(current);
    }

    res.json({ ok: true, data: { imported: data.projects.length, mode: mode || 'merge' } });
  }),
);

export default router;
