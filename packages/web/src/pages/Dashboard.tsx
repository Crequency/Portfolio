import { useState, useCallback, useEffect, useRef, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, LayoutList, LayoutGrid, FolderOpen, Pencil, Trash2, PanelLeftOpen, MonitorPlay } from 'lucide-react';
import { ServiceCard } from '@/components/tree/ServiceCard.js';
import { PreviewPanel } from '@/components/tree/PreviewPanel.js';
import { TagChip } from '@/components/common/TagChip.js';
import { TagSidebar } from '@/components/sidebar/TagSidebar.js';
import { TagManagerModal } from '@/components/modals/TagManagerModal.js';
import { useDefinedTags } from '@/hooks/useDefinedTags.js';
import { useProjects } from '@/hooks/useProjects.js';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts.js';
import { checkAll as apiCheckAll } from '@/lib/api.js';
import { openProject } from '@/lib/api.js';
import { ProjectCard } from '@/components/tree/ProjectCard.js';
import { EmptyState } from '@/components/common/EmptyState.js';
import { SettingsDialog } from '@/components/common/SettingsDialog.js';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal.js';
import { EditProjectModal } from '@/components/modals/EditProjectModal.js';
import { CreateServiceModal } from '@/components/modals/CreateServiceModal.js';
import { EditServiceModal } from '@/components/modals/EditServiceModal.js';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog.js';
import { CheckFab } from '@/components/common/CheckFab.js';
import type { Project, Service } from '@portfolio/shared';

const AUTO_CHECK_INTERVAL_MS = 10_000;

interface DashboardProps {
  showSettings: boolean;
  onCloseSettings: () => void;
}

export function Dashboard({ showSettings, onCloseSettings }: DashboardProps) {
  const { t } = useTranslation();
  const { projects, loading, createProject, updateProject, deleteProject, createService, updateService, deleteService, refresh, reorderProjects, reorderServices } = useProjects();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());
  const { definedTags, addDefinedTag, removeDefinedTag } = useDefinedTags();

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [addingServiceTo, setAddingServiceTo] = useState<Project | null>(null);
  const [editingService, setEditingService] = useState<{ service: Service; project: Project } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'project'; item: Project } | { type: 'service'; item: Service; project: Project } | null>(null);

  const [settings, setSettings] = useState({
    defaultOpenMethod: 'explorer',
    checkInterval: AUTO_CHECK_INTERVAL_MS,
  });

  const [viewMode, setViewMode] = useState<'tree' | 'card'>(() => {
    return (localStorage.getItem('portfolio-view') as 'tree' | 'card') || 'tree';
  });
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());

  const runCheck = useCallback(async () => {
    const allIds = new Set(projects.flatMap((p) => p.services.map((s) => s.id)));
    if (allIds.size === 0) return;
    setCheckingIds(allIds);
    try {
      await apiCheckAll();
      await refresh();
    } catch { /* silently ignore */ }
    setCheckingIds(new Set());
  }, [projects, refresh]);

  const hasServices = projects.some((p) => p.services.length > 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasServices) return;
    timerRef.current = setInterval(() => {
      runCheck();
    }, AUTO_CHECK_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasServices, runCheck]);

  const handleOpenProject = useCallback(async (project: Project) => {
    if (!project.path) return;
    try {
      await openProject(project.id, settings.defaultOpenMethod);
    } catch (err) {
      console.error('Failed to open project:', err);
    }
  }, [settings.defaultOpenMethod]);

  const handleExport = useCallback(async () => {
    const res = await fetch('/api/export');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, mode: 'merge' }),
      });
      await refresh();
    } catch (err) {
      console.error('Import failed:', err);
    }
  }, [refresh]);

  useKeyboardShortcuts({
    'escape': () => {
      setShowCreateProject(false);
      setEditingProject(null);
      setAddingServiceTo(null);
      setEditingService(null);
      setDeleteTarget(null);
      onCloseSettings();
    },
    'ctrl+k': () => {
      document.querySelector<HTMLInputElement>('input[placeholder]')?.focus();
    },
    'ctrl+n': () => setShowCreateProject(true),
  });

  // Drag-and-drop
  const dragProjectIndex = useRef<number | null>(null);
  const dragServiceInfo = useRef<{ projectId: string; index: number } | null>(null);

  const handleProjectDragStart = useCallback((e: DragEvent, index: number) => {
    dragProjectIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleProjectDragOver = useCallback((_e: DragEvent, _index: number) => {}, []);

  const handleProjectDrop = useCallback((_e: DragEvent, targetIndex: number) => {
    const from = dragProjectIndex.current;
    if (from === null || from === targetIndex) return;
    const newIds = projects.map((p) => p.id);
    const [moved] = newIds.splice(from, 1);
    newIds.splice(targetIndex, 0, moved);
    reorderProjects(newIds);
    dragProjectIndex.current = null;
  }, [projects, reorderProjects]);

  const handleServiceDragStart = useCallback((e: DragEvent, projectId: string, index: number) => {
    dragServiceInfo.current = { projectId, index };
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  }, []);

  const handleServiceDragOver = useCallback((e: DragEvent) => {
    e.stopPropagation();
  }, []);

  const handleServiceDrop = useCallback((e: DragEvent, projectId: string, targetIndex: number) => {
    const info = dragServiceInfo.current;
    if (!info || info.projectId !== projectId || info.index === targetIndex) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const newIds = project.services.map((s) => s.id);
    const [moved] = newIds.splice(info.index, 1);
    newIds.splice(targetIndex, 0, moved);
    reorderServices(projectId, newIds);
    dragServiceInfo.current = null;
  }, [projects, reorderServices]);

  const portCounts = new Map<number, number>();
  for (const p of projects) {
    for (const s of p.services) {
      portCounts.set(s.port, (portCounts.get(s.port) || 0) + 1);
    }
  }
  const conflictPorts = new Set<number>();
  for (const [port, count] of portCounts) {
    if (count > 1) conflictPorts.add(port);
  }

  let filtered = projects;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.services.some((s) => s.name.toLowerCase().includes(q) || String(s.port).includes(q)),
    );
  }
  if (selectedTag) {
    filtered = filtered.filter((p) => p.tags.some((t) => (typeof t === 'string' ? t : t.name) === selectedTag));
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {projects.length > 0 && (
        <TagSidebar
          collapsed={sidebarCollapsed}
          projectTags={projects.flatMap((p) => p.tags)}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onManageTags={() => setShowTagManager(true)}
        />
      )}
      <main className="flex-1 flex flex-col overflow-auto custom-scrollbar">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground shrink-0"
            title="Toggle sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-md border bg-background pl-8 pr-3 py-2 text-sm"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              const next = viewMode === 'tree' ? 'card' : 'tree';
              setViewMode(next);
              localStorage.setItem('portfolio-view', next);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title={viewMode === 'tree' ? 'Card view' : 'List view'}
          >
            {viewMode === 'tree' ? <LayoutGrid className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              const anyExpanded = expandedPreviews.size > 0;
              if (anyExpanded) {
                setExpandedPreviews(new Set());
              } else {
                setExpandedPreviews(new Set(projects.filter((p) => p.previewServiceId).map((p) => p.id)));
              }
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title="Toggle Previews"
          >
            <MonitorPlay className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCreateProject(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t('common.newProject')}
          </button>
        </div>

        {filtered.length === 0 && !search && !selectedTag ? (
          <EmptyState onCreateProject={() => setShowCreateProject(true)} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            {t('common.noResults')}
          </div>
        ) : viewMode === 'card' ? (
          /* ── Card View ── */
          <div className="flex-1 p-4 pb-20 overflow-auto custom-scrollbar">
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filtered.map((p) => (
              <div key={p.id} className="rounded-lg border bg-card flex flex-col">
                {/* Project header — row 1: name + tags */}
                <div className="flex items-center gap-2 px-4 py-2 border-b">
                  <span className="font-semibold text-sm truncate">{p.name}</span>
                  <span className="flex-1" />
                  {p.tags.length > 0 && (
                    <span className="flex gap-1 shrink-0">
                      {p.tags.map((t) => (
                        <TagChip key={typeof t === 'string' ? t : t.name} tag={t} />
                      ))}
                    </span>
                  )}
                </div>
                {/* Row 2: services count + actions */}
                <div className="flex items-center gap-2 px-4 py-1.5 border-b">
                  <span className="text-xs text-muted-foreground">
                    {p.services.length} service{p.services.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex-1" />
                  <div className="flex items-center gap-0.5">
                    {p.path && (
                      <button onClick={() => handleOpenProject(p)} className="rounded p-1 hover:bg-accent" title="Open">
                        <FolderOpen className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => setAddingServiceTo(p)} className="rounded p-1 hover:bg-accent" title="Add service">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingProject(p)} className="rounded p-1 hover:bg-accent" title="Edit project">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget({ type: 'project', item: p })} className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Service cards */}
                {p.services.length > 0 ? (
                  <div className="flex flex-row flex-wrap items-start gap-2 p-3">
                    {p.services.map((s) => (
                      <ServiceCard
                        key={s.id}
                        service={s}
                        hasConflict={conflictPorts.has(s.port)}
                        checking={checkingIds.has(s.id)}
                        isPreview={p.previewServiceId === s.id}
                        onSetPreview={() => {
                          const newId = p.previewServiceId === s.id ? null : s.id;
                          updateProject(p.id, { previewServiceId: newId });
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-xs text-muted-foreground">
                    No services yet.
                  </div>
                )}
                <PreviewPanel
                  port={
                    p.previewServiceId
                      ? p.services.find((s) => s.id === p.previewServiceId)?.port ?? null
                      : null
                  }
                  expanded={expandedPreviews.has(p.id)}
                  onToggle={() => {
                    setExpandedPreviews((prev) => {
                      const next = new Set(prev);
                      if (next.has(p.id)) next.delete(p.id);
                      else next.add(p.id);
                      return next;
                    });
                  }}
                />
              </div>
            ))}
            </div>
          </div>
        ) : (
          /* ── Tree View (current) ── */
          <div className="flex-1 p-4 pb-20 space-y-3 overflow-auto custom-scrollbar">
            {filtered.map((p, idx) => (
              <ProjectCard
                key={p.id}
                project={p}
                conflictPorts={conflictPorts}
                checkingIds={checkingIds}
                index={idx}
                onAddService={() => setAddingServiceTo(p)}
                onEdit={() => setEditingProject(p)}
                onDelete={() => setDeleteTarget({ type: 'project', item: p })}
                onOpen={() => handleOpenProject(p)}
                onEditService={(s) => setEditingService({ service: s, project: p })}
                onDeleteService={(s) => setDeleteTarget({ type: 'service', item: s, project: p })}
                onDragStart={handleProjectDragStart}
                onDragOver={handleProjectDragOver}
                onDrop={handleProjectDrop}
                onServiceDragStart={handleServiceDragStart}
                onServiceDragOver={handleServiceDragOver}
                onServiceDrop={handleServiceDrop}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        open={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSave={createProject}
        definedTags={definedTags}
      />
      <EditProjectModal
        open={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={updateProject}
        definedTags={definedTags}
      />
      <CreateServiceModal
        open={!!addingServiceTo}
        projectName={addingServiceTo?.name || ''}
        onClose={() => setAddingServiceTo(null)}
        onSave={(body) => addingServiceTo ? createService(addingServiceTo.id, body) : Promise.resolve()}
      />
      <EditServiceModal
        open={!!editingService}
        service={editingService?.service || null}
        projectName={editingService?.project?.name || ''}
        onClose={() => setEditingService(null)}
        onSave={(body) =>
          editingService
            ? updateService(editingService.project.id, editingService.service.id, body)
            : Promise.resolve()
        }
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === 'project' ? t('project.deleteTitle') : t('service.deleteTitle')}
        message={
          deleteTarget?.type === 'project'
            ? t('project.deleteMsg', { name: deleteTarget.item.name, count: deleteTarget.item.services.length })
            : t('service.deleteMsg', { name: deleteTarget && 'item' in deleteTarget ? (deleteTarget as { type: 'service'; item: Service }).item.name : '' })
        }
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'project') {
            await deleteProject(deleteTarget.item.id);
          } else {
            await deleteService(deleteTarget.project.id, deleteTarget.item.id);
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
      <SettingsDialog
        open={showSettings}
        defaultOpenMethod={settings.defaultOpenMethod}
        checkInterval={settings.checkInterval}
        onClose={onCloseSettings}
        onSave={(s) => setSettings({ ...settings, ...s })}
        onExport={handleExport}
        onImport={handleImport}
      />
      <CheckFab onCheck={runCheck} />
      <TagManagerModal
        open={showTagManager}
        definedTags={definedTags}
        onAdd={addDefinedTag}
        onRemove={removeDefinedTag}
        onClose={() => setShowTagManager(false)}
      />
    </div>
  );
}
