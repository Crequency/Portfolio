import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import net from 'node:net';

const router = Router();

// POST /api/ping-port — measure TCP connect latency to a local port
router.post(
  '/ping-port',
  asyncHandler(async (req, res) => {
    const port = req.body?.port;
    if (typeof port !== 'number' || port < 1 || port > 65535) {
      res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'port is required (1-65535)' } });
      return;
    }

    const start = performance.now();

    try {
      await new Promise<void>((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        socket.once('connect', () => {
          const latency = Math.round(performance.now() - start);
          socket.destroy();
          resolve();
          // Send response after connection measured
          res.json({ ok: true, data: { port, latency, reachable: true } });
        });

        socket.once('timeout', () => {
          socket.destroy();
          reject(new Error('timeout'));
        });

        socket.once('error', (err) => {
          socket.destroy();
          reject(err);
        });

        socket.connect(port, '127.0.0.1');
      });
    } catch {
      res.json({ ok: true, data: { port, latency: null, reachable: false } });
    }
  }),
);

export default router;
