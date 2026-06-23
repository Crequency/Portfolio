import type { ApiResponse } from "@portfolio/shared";

const BASE = "/api";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  const json: ApiResponse<T> = await res.json();
  if (!json.ok) {
    throw new Error(json.error.message);
  }
  return json.data;
}

export function getProjects(params?: { search?: string; tag?: string }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.tag) qs.set("tag", params.tag);
  const q = qs.toString();
  return request<import("@portfolio/shared").Project[]>(
    "GET",
    `/projects${q ? "?" + q : ""}`,
  );
}

export function createProject(
  body: import("@portfolio/shared").CreateProjectBody,
) {
  return request<import("@portfolio/shared").Project>(
    "POST",
    "/projects",
    body,
  );
}

export function updateProject(
  id: string,
  body: import("@portfolio/shared").UpdateProjectBody,
) {
  return request<import("@portfolio/shared").Project>(
    "PUT",
    `/projects/${id}`,
    body,
  );
}

export function deleteProject(id: string) {
  return request<import("@portfolio/shared").Project>(
    "DELETE",
    `/projects/${id}`,
  );
}

export function createService(
  projectId: string,
  body: import("@portfolio/shared").CreateServiceBody,
) {
  return request<import("@portfolio/shared").Service & { warning?: unknown }>(
    "POST",
    `/projects/${projectId}/services`,
    body,
  );
}

export function updateService(
  projectId: string,
  serviceId: string,
  body: import("@portfolio/shared").UpdateServiceBody,
) {
  return request<import("@portfolio/shared").Service & { warning?: unknown }>(
    "PUT",
    `/projects/${projectId}/services/${serviceId}`,
    body,
  );
}

export function deleteService(projectId: string, serviceId: string) {
  return request<import("@portfolio/shared").Service>(
    "DELETE",
    `/projects/${projectId}/services/${serviceId}`,
  );
}

export function checkAll() {
  return request<import("@portfolio/shared").CheckResponse>("POST", "/check");
}

export function checkProject(projectId: string) {
  return request<import("@portfolio/shared").CheckResponse>(
    "POST",
    `/check/${projectId}`,
  );
}

export function checkService(projectId: string, serviceId: string) {
  return request<import("@portfolio/shared").CheckResponse>(
    "POST",
    `/check/${projectId}/${serviceId}`,
  );
}

export function openProject(projectId: string, method: string) {
  return request<{ opened: string; method: string }>(
    "POST",
    `/projects/${projectId}/open`,
    { method },
  );
}

export function reorderProjects(projectIds: string[]) {
  return request<import("@portfolio/shared").Project[]>(
    "PUT",
    "/projects/reorder",
    { projectIds },
  );
}

export function reorderServices(projectId: string, serviceIds: string[]) {
  return request<import("@portfolio/shared").Service[]>(
    "PUT",
    `/projects/${projectId}/services/reorder`,
    { serviceIds },
  );
}

export function pingPort(port: number) {
  return request<{ port: number; latency: number | null; reachable: boolean }>(
    "POST",
    "/ping-port",
    { port },
  );
}

export function getBackendPort() {
  return request<{ port: number }>("GET", "/info");
}
