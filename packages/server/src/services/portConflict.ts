import type { Project } from '@portfolio/shared';

export interface ConflictInfo {
  projectName: string;
  serviceName: string;
  projectId: string;
  serviceId: string;
}

/**
 * Check if a port is already used by another service (across all projects).
 * Returns conflict info if found, or null if no conflict.
 * The `excludeServiceId` parameter allows excluding the service being edited.
 */
export function checkPortConflict(
  projects: Project[],
  port: number,
  excludeServiceId?: string,
): ConflictInfo | null {
  for (const project of projects) {
    for (const service of project.services) {
      if (service.port === port) {
        if (excludeServiceId && service.id === excludeServiceId) continue;
        return {
          projectName: project.name,
          serviceName: service.name,
          projectId: project.id,
          serviceId: service.id,
        };
      }
    }
  }
  return null;
}
