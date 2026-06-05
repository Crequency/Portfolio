import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import net from 'node:net';

const execFileAsync = promisify(execFile);

export interface PortCheckResult {
  status: 'running' | 'stopped' | 'unknown';
  pid?: number;
  processName?: string;
}

const TIMEOUT = 5000;

/**
 * Check if a port has a listening process.
 * Cross-platform with TCP connect fallback — never returns unknown.
 */
export async function checkPort(port: number): Promise<PortCheckResult> {
  const platform = process.platform;

  // Try platform-native detection first
  let result: PortCheckResult;
  try {
    if (platform === 'win32') {
      result = await checkPortWindows(port);
    } else {
      result = await checkPortUnix(port);
    }
  } catch (err) {
    console.error(`[Portfolio] port check error (${platform}:${port}):`, (err as Error).message);
    result = { status: 'unknown' };
  }

  // TCP connect fallback if native detection failed
  if (result.status === 'unknown') {
    const tcp = await checkPortTCP(port);
    return { ...tcp, pid: undefined, processName: undefined };
  }

  return result;
}

// ── Windows (netstat -ano) ──

async function checkPortWindows(port: number): Promise<PortCheckResult> {
  // shell:true for better Windows compatibility
  const { stdout } = await execFileAsync('netstat', ['-ano'], {
    timeout: TIMEOUT,
    shell: true,
  });

  const lines = stdout.split(/\r?\n/);
  const portPattern = new RegExp(`:${port}\\b`);

  const matchLine = lines.find(
    (l) => l.toUpperCase().includes('LISTENING') && portPattern.test(l),
  );
  if (!matchLine) {
    return { status: 'stopped' };
  }

  const parts = matchLine.trim().split(/\s+/);
  const pid = parseInt(parts[parts.length - 1], 10);
  if (isNaN(pid)) {
    return { status: 'running' };
  }

  let processName: string | undefined;
  try {
    const { stdout: taskOut } = await execFileAsync(
      'tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'],
      { timeout: 3000, shell: true },
    );
    const m = taskOut.match(/^"([^"]+)"/m);
    if (m) processName = m[1].replace(/\.exe$/i, '');
  } catch {
    // process name is optional
  }

  return { status: 'running', pid, processName };
}

// ── Unix (ss / lsof) ──

async function checkPortUnix(port: number): Promise<PortCheckResult> {
  const isDarwin = process.platform === 'darwin';

  if (!isDarwin) {
    try {
      const { stdout } = await execFileAsync('ss', ['-tlnp'], { timeout: TIMEOUT });
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
      // fall through to lsof
    }
  }

  try {
    const { stdout } = await execFileAsync(
      'lsof', ['-i', `:${port}`, '-t', '-sTCP:LISTEN'],
      { timeout: TIMEOUT },
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
        } catch { /* optional */ }
      }
      return { status: 'running', pid, processName };
    }
    return { status: 'stopped' };
  } catch {
    return { status: 'unknown' };
  }
}

// ── TCP connect (last-resort fallback) ──

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
      // ECONNREFUSED = port open but no listener = not running
      resolve({ status: 'stopped' });
    });

    socket.connect(port, '127.0.0.1');
  });
}
