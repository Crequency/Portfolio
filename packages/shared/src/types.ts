// ── Data Model ──

export interface Service {
  id: string;
  name: string;
  port: number;
  description?: string;
  status: 'running' | 'stopped' | 'unknown';
  lastCheckedAt?: string;
  order: number;
}

export interface Tag {
  name: string;
  color: string; // hex color, e.g. "#3b82f6"
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  path?: string;
  tags: Tag[];
  services: Service[];
  previewServiceId?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface DataFile {
  version: number;
  projects: Project[];
}

// ── API Response ──

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'PORT_CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiError {
  code: ErrorCode;
  message: string;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

// ── Request Bodies ──

export interface CreateProjectBody {
  name: string;
  description?: string;
  path?: string;
  tags?: Tag[];
}

export interface UpdateProjectBody {
  name?: string;
  description?: string;
  path?: string;
  tags?: Tag[];
  previewServiceId?: string | null;
}

export interface CreateServiceBody {
  name: string;
  port: number;
  description?: string;
}

export interface UpdateServiceBody {
  name?: string;
  port?: number;
  description?: string;
}

export interface ReorderProjectsBody {
  projectIds: string[]; // Full list of project IDs in new order
}

export interface ReorderServicesBody {
  serviceIds: string[]; // Full list of service IDs in new order
}

export interface ImportBody {
  data: DataFile;
  mode: 'merge' | 'replace';
}

// ── Check Result ──

export interface CheckResult {
  serviceId: string;
  projectId: string;
  port: number;
  status: 'running' | 'stopped' | 'unknown';
  pid?: number;
  processName?: string;
}

export interface CheckResponse {
  checked: number;
  results: CheckResult[];
}

// ── Settings ──

export interface UserSettings {
  defaultOpenMethod: 'explorer' | 'code' | 'terminal';
  checkInterval: number; // seconds, 0 = disabled
}
