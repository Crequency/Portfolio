import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import net from 'node:net';

const execFileAsync = promisify(execFile);

export interface PortCheckResult {
  status: 'running' | 'stopped' | 'unknown';
  pid?: number;
  processName?: string;
}

/**
 * Check if a port has a listening process.
 * Cross-platform: Windows (netstat), macOS (lsof), Linux (ss/lsof).
 */
export async function checkPort(port: number): Promise<PortCheckResult> {
  const platform = process.platform;

  if (platform === 'win32') {
    return checkPortWindows(port);
  }
  // macOS & Linux
  return checkPortUnix(port);
}

// ── Windows ──

async function checkPortWindows(port: number): Promise<PortCheckResult> {
  try {
    const { stdout } = await execFileAsync('netstat', ['-ano'], { timeout: 5000 });
    const lines = stdout.split(/\r?\n/);
    // Find line with LISTENING and our port (e.g. "0.0.0.0:3000" or "[::]:3000")
    const matchLine = lines.find(
      (l) => l.includes('LISTENING') && new RegExp(`:${port}\\b`).test(l),
    );
    if (!matchLine) {
      return { status: 'stopped' };
    }

    // Extract PID (last column)
    const parts = matchLine.trim().split(/\s+/);
    const pid = parseInt(parts[parts.length - 1], 10);
    if (isNaN(pid)) {
      return { status: 'running' }; // found port but can't parse PID
    }

    // Get process name from PID
    let processName: string | undefined;
    try {
      const { stdout: taskOut } = await execFileAsync(
        'tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'],
        { timeout: 3000 },
      );
      const m = taskOut.match(/^"([^"]+)"/m);
      if (m) processName = m[1].replace(/\.exe$/i, '');
    } catch {
      // ignore
    }

    return { status: 'running', pid, processName };
  } catch {
    return { status: 'unknown' };
  }
}

// ── macOS / Linux ──

async function checkPortUnix(port: number): Promise<PortCheckResult> {
  const isDarwin = process.platform === 'darwin';

  // Linux: try ss first (fast, no root usually)
  if (!isDarwin) {
    try {
      const { stdout } = await execFileAsync('ss', ['-tlnp'], { timeout: 5000 });
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const pidMatch = line.match(/pid=(\d+)/);
          const nameMatch = line.match(/users:\(\("([^"]+)"/);
          return {
            status: 'running',
            pid: pidMatch ? parseInt(pidMatch[1], 10) : undefined,
            processName: nameMatch ? nameMatch[1] : undefined,
          };
        }
      }
      return { status: 'stopped' };
    } catch {
      // ss failed, fall through to lsof
    }
  }

  // macOS / Linux fallback: lsof
  try {
    const { stdout } = await execFileAsync(
      'lsof', ['-i', `:${port}`, '-t', '-sTCP:LISTEN'],
      { timeout: 5000 },
    );
    const pids = stdout.trim().split('\n').filter(Boolean);
    if (pids.length > 0) {
      const pid = parseInt(pids[0], 10);
      let processName: string | undefined;
      if (!isNaN(pid)) {
        try {
          const { stdout: psOut } = await execFileAsync(
            'ps', ['-p', String(pid), '-o', 'comm='],
            { timeout: 2000 },
          );
          processName = psOut.trim();
        } catch {
          // ignore
        }
      }
      return { status: 'running', pid, processName };
    }
    return { status: 'stopped' };
  } catch {
    return { status: 'unknown' };
  }
}

// ── TCP fallback (no external commands) ──

/**
 * Lightweight TCP connect check as a last-resort fallback.
 * Used only if ss/lsof/netstat all fail.
 */
export async function checkPortTCP(port: number): Promise<PortCheckResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);

    socket.once('connect', () => {
      socket.destroy();
      resolve({ status: 'running' });
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve({ status: 'stopped' });
    });

    socket.once('error', () => {
      socket.destroy();
      resolve({ status: 'stopped' });
    });

    socket.connect(port, '127.0.0.1');
  });
}
