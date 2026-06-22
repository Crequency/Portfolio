import { useState, useRef } from 'react';
import type { Service } from '@portfolio/shared';
import { LatencyChip } from '@/components/common/LatencyChip.js';
import { useServiceLatency } from '@/hooks/useServiceLatency.js';
import { useTranslation } from 'react-i18next';
import { MonitorPlay } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  hasConflict: boolean;
  checking: boolean;
  isPreview?: boolean;
  onSetPreview?: () => void;
}

export function ServiceCard({ service, hasConflict, checking, isPreview, onSetPreview }: ServiceCardProps) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isRunning = service.status === 'running';
  const latency = useServiceLatency(service.port, isRunning ? 'running' : 'unknown');
  const showChecking = checking && !isRunning;

  const statusDot: Record<string, string> = {
    running: 'bg-green-500',
    stopped: 'bg-red-500',
    unknown: 'bg-gray-400',
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Chip */}
      <div
        onClick={() => navigator.clipboard.writeText(String(service.port))}
        onContextMenu={(e) => {
          e.preventDefault();
          onSetPreview?.();
        }}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/30 select-none ${
          hasConflict ? 'border-yellow-500 bg-yellow-500/5' : 'bg-card'
        } ${isPreview ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
      >
        {showChecking ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
        ) : (
          <span className={`inline-block h-2 w-2 rounded-full ${statusDot[service.status]}`} />
        )}

        {isPreview && <MonitorPlay className="h-3 w-3 text-blue-500" />}

        <span className="font-mono tabular-nums font-medium">{service.port}</span>

        {isRunning && <LatencyChip latency={latency} />}
      </div>

      {/* Custom tooltip */}
      {hover && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 pointer-events-none">
          <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md whitespace-nowrap">
            <div className="font-medium text-sm">{service.name}</div>
            {service.description && (
              <div className="text-muted-foreground mt-0.5 max-w-48">{service.description}</div>
            )}
            <div className="text-muted-foreground mt-1">
              {t('service.port')}: {service.port} · {service.status}
            </div>
            {service.lastCheckedAt && (
              <div className="text-muted-foreground">
                {new Date(service.lastCheckedAt).toLocaleString()}
              </div>
            )}
            {isRunning && (
              <div className="text-muted-foreground">{t('service.rightClickPreview')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
