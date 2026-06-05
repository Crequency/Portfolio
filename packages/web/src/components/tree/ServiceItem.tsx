import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Service } from '@portfolio/shared';
import { StatusBadge } from '@/components/common/StatusBadge.js';
import { LatencyChip } from '@/components/common/LatencyChip.js';
import { useServiceLatency } from '@/hooks/useServiceLatency.js';
import { Pencil, Trash2, GripVertical, ExternalLink } from 'lucide-react';

interface ServiceItemProps {
  service: Service;
  hasConflict: boolean;
  projectId: string;
  index: number;
  checking: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, projectId: string, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, projectId: string, index: number) => void;
}

export function ServiceItem({ service, hasConflict, projectId, index, checking, onEdit, onDelete, onDragStart, onDragOver, onDrop }: ServiceItemProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  // Running services keep measuring latency even during check
  const isRunning = service.status === 'running';
  const latency = useServiceLatency(service.port, isRunning ? 'running' : 'unknown');
  // Only non-running services show checking animation
  const showChecking = checking && !isRunning;

  const openInTab = () => {
    window.open(`http://localhost:${service.port}`, '_blank');
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, projectId, index)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); onDragOver(e); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { setDragOver(false); onDrop(e, projectId, index); }}
      className={`group flex items-center gap-3 py-2 pl-10 pr-3 text-sm transition-colors ${
        hasConflict ? 'border-l-2 border-yellow-500 bg-yellow-500/5' : ''
      } ${dragOver ? 'bg-primary/10' : ''}`}
    >
      {/* Drag handle */}
      <span className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="h-3.5 w-3.5" />
      </span>

      {/* Name — always fully visible */}
      <span className="shrink-0 font-medium">{service.name}</span>

      {/* Description */}
      {service.description && (
        <span className="hidden lg:block shrink-0 truncate max-w-52 text-muted-foreground text-xs">
          {service.description}
        </span>
      )}

      {/* Port + open-in-tab button */}
      <span className="inline-flex items-center gap-1 shrink-0">
        <button
          className="font-mono text-xs tabular-nums text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => navigator.clipboard.writeText(String(service.port))}
          title={t('service.clickToCopy')}
        >
          :{service.port}
        </button>
        <button
          onClick={openInTab}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
          title={t('service.openInTab')}
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </span>

      {/* Last checked */}
      {service.lastCheckedAt && (
        <span className="hidden lg:block text-xs text-muted-foreground shrink-0">
          {new Date(service.lastCheckedAt).toLocaleString()}
        </span>
      )}

      {/* Spacer — pushes status + latency to the right */}
      <span className="flex-1" />

      {/* Latency chip (only for running, always shown even during check) */}
      {isRunning && (
        <LatencyChip latency={latency} />
      )}

      {/* Status badge — fixed to far right */}
      <StatusBadge status={service.status} checking={showChecking} />

      {/* Actions — edit & delete only */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="rounded p-1 hover:bg-accent"
          title={t('service.editService')}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          title={t('service.deleteService')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
