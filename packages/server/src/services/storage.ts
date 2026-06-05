import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { rotateBackups } from './backup.js';
import type { DataFile } from '@portfolio/shared';

export const DATA_DIR = path.join(os.homedir(), '.portfolio');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

const EMPTY_DATA: DataFile = {
  version: 1,
  projects: [],
};

let cached: DataFile | null = null;

export async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readData(): Promise<DataFile> {
  await ensureDir();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    cached = parsed;
    return parsed as DataFile;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await saveData(EMPTY_DATA);
      return EMPTY_DATA;
    }
    throw new Error(
      `Data file is corrupted at ${DATA_FILE}. Please fix or remove it manually.`,
    );
  }
}

export async function saveData(data: DataFile): Promise<void> {
  await ensureDir();
  await rotateBackups(DATA_DIR);
  const tmp = DATA_FILE + '.tmp';
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(tmp, json, 'utf-8');
  await fs.rename(tmp, DATA_FILE);
  cached = data;
}

export function getCached(): DataFile | null {
  return cached;
}

export function setCached(data: DataFile): void {
  cached = data;
}
