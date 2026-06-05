import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface PortCheckResult {
  status: 'running' | 'stopped' | 'unknown';
  pid?: number;
  processName?: string;
}

/**
 * Check if a port has a listening process.
 * Uses `ss` first (Linux), falls back to `lsof` (macOS/Linux).
 */
export async function checkPort(port: number): Promise<PortCheckResult> {
  // Try `ss -tlnp` first (fast, no root on most modern systems)
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
    // `ss` failed — try `lsof -i :PORT`
  }

  try {
    const { stdout } = await execFileAsync('lsof', ['-i', `:${port}`, '-t', '-sTCP:LISTEN'], { timeout: 5000 });
    const pids = stdout.trim().split('\n').filter(Boolean);
    if (pids.length > 0) {
      const pid = parseInt(pids[0], 10);
      let processName: string | undefined;
      try {
        const { stdout: psOut } = await execFileAsync('ps', ['-p', String(pid), '-o', 'comm='], { timeout: 2000 });
        processName = psOut.trim();
      } catch { /* ignore */ }
      return { status: 'running', pid, processName };
    }
    return { status: 'stopped' };
  } catch {
    return { status: 'unknown' };
  }
}
