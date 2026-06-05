import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';

const execFileAsync = promisify(execFile);

export type OpenMethod = 'explorer' | 'code' | 'terminal';

/**
 * Detect if running inside WSL.
 */
function isWSL(): boolean {
  try {
    return fs.existsSync('/proc/sys/fs/binfmt_misc/WSLInterop');
  } catch {
    return false;
  }
}

/**
 * Open a project path in the chosen application.
 */
export async function openProject(
  projectPath: string,
  method: OpenMethod = 'explorer',
): Promise<void> {
  switch (method) {
    case 'code':
      await execFileAsync('code', [projectPath]);
      break;
    case 'terminal': {
      // Open terminal at the path
      if (isWSL()) {
        // In WSL, we use Windows Terminal or cmd
        try {
          const { stdout } = await execFileAsync('wslpath', ['-w', projectPath], { timeout: 3000 });
          const winPath = stdout.trim();
          await execFileAsync('cmd.exe', ['/c', 'start', 'wt', '-d', winPath]);
        } catch {
          // Fallback: just cd in WSL
          console.log(`cd "${projectPath}"`);
        }
      } else {
        const terminalCmd = process.env.TERMINAL || 'gnome-terminal';
        try {
          await execFileAsync(terminalCmd, ['--working-directory', projectPath]);
        } catch {
          console.log(`cd "${projectPath}"`);
        }
      }
      break;
    }
    default:
      // File explorer
      if (isWSL()) {
        try {
          const { stdout } = await execFileAsync('wslpath', ['-w', projectPath], { timeout: 3000 });
          const winPath = stdout.trim();
          await execFileAsync('explorer.exe', [winPath]);
        } catch {
          await execFileAsync('xdg-open', [projectPath]);
        }
      } else {
        const platform = process.platform;
        if (platform === 'darwin') {
          await execFileAsync('open', [projectPath]);
        } else {
          await execFileAsync('xdg-open', [projectPath]);
        }
      }
  }
}
