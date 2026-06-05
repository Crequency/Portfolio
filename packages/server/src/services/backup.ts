import path from 'node:path';
import fs from 'node:fs/promises';

const MAX_BACKUPS = 5;

/**
 * Rotate backups of data.json before a write.
 * data.json.bak.1 is the most recent, .bak.5 is oldest.
 */
export async function rotateBackups(dataDir: string): Promise<void> {
  const dataFile = path.join(dataDir, 'data.json');

  // Check if data file exists
  try {
    await fs.access(dataFile);
  } catch {
    return; // No existing data to back up
  }

  // Shift existing backups: .bak.4 -> .bak.5, .bak.3 -> .bak.4, etc.
  for (let i = MAX_BACKUPS; i >= 1; i--) {
    const oldBak = path.join(dataDir, `data.json.bak.${i}`);
    const newBak = path.join(dataDir, `data.json.bak.${i + 1}`);
    try {
      if (i === MAX_BACKUPS) {
        await fs.unlink(oldBak); // Remove oldest if at limit
      } else {
        await fs.rename(oldBak, newBak);
      }
    } catch {
      // File doesn't exist — skip
    }
  }

  // Copy current data to .bak.1
  try {
    await fs.copyFile(dataFile, path.join(dataDir, 'data.json.bak.1'));
  } catch {
    // Ignore copy failures (e.g. source doesn't exist yet)
  }
}
