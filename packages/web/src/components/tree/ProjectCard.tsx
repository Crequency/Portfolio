import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, Service } from '@portfolio/shared';
import { ServiceItem } from './ServiceItem.js';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, FolderOpen, GripVertical } from 'lucide-react';
import { TagChip } from '@/components/common/TagChip.js';

interface ProjectCardProps {
  project: Project;
  conflictPorts: Set<number>;
  checkingIds: Set<string>;
  index: number;
  onAddService: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
  onEditService: (s: Service) => void;
  onDeleteService: (s: Service) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onServiceDragStart: (e: React.DragEvent, projectId: string, svcIndex: number) => void;
  onServiceDragOver: (e: React.DragEvent) => void;
  onServiceDrop: (e: React.DragEvent, projectId: string, svcIndex: number) => void;
}

export function ProjectCard({
  project,
  conflictPorts,
  checkingIds,
  index,
  onAddService,
  onEdit,
  onDelete,
  onOpen,
  onEditService,
  onDeleteService,
  onDragStart,
  onDragOver,
  onDrop,
  onServiceDragStart,
  onServiceDragOver,
  onServiceDrop,
}: ProjectCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const services = project.services;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); onDragOver(e, index); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { setDragOver(false); onDrop(e, index); }}
      className={`rounded-lg border bg-card transition-colors ${dragOver ? 'border-primary bg-primary/5' : ''}`}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-accent/50 rounded-t-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <span
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <button className="p-0.5 text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span className="font-semibold text-sm">{project.name}</span>
        {project.tags.length > 0 && (
          <span className="flex gap-1 ml-2">
            {project.tags.map((tag) => (
              <TagChip key={typeof tag === 'string' ? tag : tag.name} tag={tag} />
            ))}
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {t('project.servicesCount', { count: services.length })}
        </span>
        <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
          {project.path && (
            <button onClick={onOpen} className="rounded p-1 hover:bg-accent" title={t('project.openExplorer')}>
              <FolderOpen className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={onAddService} className="rounded p-1 hover:bg-accent" title={t('service.addService')}>
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button onClick={onEdit} className="rounded p-1 hover:bg-accent" title={t('service.editProject')}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title={t('service.deleteProject')}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && services.length > 0 && (
        <div className="divide-y">
          {services.map((s, sIdx) => (
            <ServiceItem
              key={s.id}
              service={s}
              hasConflict={conflictPorts.has(s.port)}
              projectId={project.id}
              index={sIdx}
              checking={checkingIds.has(s.id)}
              onEdit={() => onEditService(s)}
              onDelete={() => onDeleteService(s)}
              onDragStart={onServiceDragStart}
              onDragOver={onServiceDragOver}
              onDrop={onServiceDrop}
            />
          ))}
        </div>
      )}

      {expanded && services.length === 0 && (
        <div className="px-10 py-4 text-xs text-muted-foreground">
          {t('project.noServices')}
        </div>
      )}
    </div>
  );
}
