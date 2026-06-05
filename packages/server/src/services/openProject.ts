import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';

const execFileAsync = promisify(execFile);

export type OpenMethod = 'explorer' | 'code' | 'terminal';

function isWSL(): boolean {
  try {
    return fs.existsSync('/proc/sys/fs/binfmt_misc/WSLInterop');
  } catch {
    return false;
  }
}

export async function openProject(
  projectPath: string,
  method: OpenMethod = 'explorer',
): Promise<void> {
  const platform = process.platform;

  // ── VS Code (cross-platform) ──
  if (method === 'code') {
    await execFileAsync('code', [projectPath]);
    return;
  }

  // ── Terminal ──
  if (method === 'terminal') {
    if (platform === 'win32') {
      // Windows native: try Windows Terminal, fallback to cmd
      try {
        await execFileAsync('cmd.exe', ['/c', 'start', 'wt', '-d', projectPath]);
      } catch {
        try {
          await execFileAsync('cmd.exe', ['/c', 'start', 'cmd', '/k', 'cd', '/d', projectPath]);
        } catch {
          console.log(`cd "${projectPath}"`);
        }
      }
      return;
    }

    if (isWSL()) {
      try {
        const { stdout } = await execFileAsync('wslpath', ['-w', projectPath], { timeout: 3000 });
        await execFileAsync('cmd.exe', ['/c', 'start', 'wt', '-d', stdout.trim()]);
      } catch {
        console.log(`cd "${projectPath}"`);
      }
      return;
    }

    if (platform === 'darwin') {
      try {
        await execFileAsync('open', ['-a', 'Terminal', projectPath]);
      } catch {
        console.log(`cd "${projectPath}"`);
      }
      return;
    }

    // Linux
    const term = process.env.TERMINAL || 'gnome-terminal';
    try {
      await execFileAsync(term, ['--working-directory', projectPath]);
    } catch {
      console.log(`cd "${projectPath}"`);
    }
    return;
  }

  // ── File Explorer (default) ──
  if (platform === 'win32') {
    await execFileAsync('explorer.exe', [projectPath]);
    return;
  }

  if (isWSL()) {
    try {
      const { stdout } = await execFileAsync('wslpath', ['-w', projectPath], { timeout: 3000 });
      await execFileAsync('explorer.exe', [stdout.trim()]);
    } catch {
      await execFileAsync('xdg-open', [projectPath]);
    }
    return;
  }

  if (platform === 'darwin') {
    await execFileAsync('open', [projectPath]);
  } else {
    await execFileAsync('xdg-open', [projectPath]);
  }
}
