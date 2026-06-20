import { useState, useEffect, useCallback } from 'react';
import {
  getProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  createService as apiCreateService,
  updateService as apiUpdateService,
  deleteService as apiDeleteService,
  reorderProjects as apiReorderProjects,
  reorderServices as apiReorderServices,
} from '@/lib/api.js';
import type { Project, CreateProjectBody, UpdateProjectBody, CreateServiceBody, UpdateServiceBody } from '@portfolio/shared';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProject = useCallback(async (body: CreateProjectBody) => {
    await apiCreateProject(body);
    await refresh();
  }, [refresh]);

  const updateProject = useCallback(async (id: string, body: UpdateProjectBody) => {
    await apiUpdateProject(id, body);
    await refresh();
  }, [refresh]);

  const deleteProject = useCallback(async (id: string) => {
    await apiDeleteProject(id);
    await refresh();
  }, [refresh]);

  const createService = useCallback(async (projectId: string, body: CreateServiceBody) => {
    const result = await apiCreateService(projectId, body);
    await refresh();
    return result;
  }, [refresh]);

  const updateService = useCallback(async (projectId: string, serviceId: string, body: UpdateServiceBody) => {
    const result = await apiUpdateService(projectId, serviceId, body);
    await refresh();
    return result;
  }, [refresh]);

  const deleteService = useCallback(async (projectId: string, serviceId: string) => {
    await apiDeleteService(projectId, serviceId);
    await refresh();
  }, [refresh]);

  const reorderProjects = useCallback(async (projectIds: string[]) => {
    // Optimistic update
    setProjects((prev) => {
      const idMap = new Map(prev.map((p) => [p.id, p]));
      const reordered = projectIds.map((id, i) => {
        const p = idMap.get(id);
        return p ? { ...p, order: i } : p;
      }).filter(Boolean) as Project[];
      return reordered;
    });
    try {
      await apiReorderProjects(projectIds);
    } catch {
      await refresh(); // Rollback on failure
    }
  }, [refresh]);

  const reorderServices = useCallback(async (projectId: string, serviceIds: string[]) => {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const idMap = new Map(p.services.map((s) => [s.id, s]));
        const reordered = serviceIds.map((id, i) => {
          const s = idMap.get(id);
          return s ? { ...s, order: i } : s;
        }).filter(Boolean) as typeof p.services;
        return { ...p, services: reordered };
      }),
    );
    try {
      await apiReorderServices(projectId, serviceIds);
    } catch {
      await refresh(); // Rollback on failure
    }
  }, [refresh]);

  return {
    projects,
    loading,
    error,
    refresh,
    createProject,
    updateProject,
    deleteProject,
    createService,
    updateService,
    deleteService,
    reorderProjects,
    reorderServices,
  };
}
